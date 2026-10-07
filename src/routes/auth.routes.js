const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const passport = require("../config/passport");

const User = require("../models/User");
const { sendMfaEmail } = require("../utils/mailer");

const router = express.Router();

function validatePassword(password) {
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
}


// ======================================================
// REGISTRO NORMAL
// ======================================================

router.post("/register", async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            store
        } = req.body;

        if (!fullName || !email || !password || !store) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                message:
                    "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial"
            });
        }

        const existingUser =
            await User.findByEmail(email);

        if (existingUser) {
            return res.status(409).json({
                message:
                    "El correo ya está registrado"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user =
            await User.createUser({
                fullName,
                email,
                password: hashedPassword,
                role: "EMPLEADO",
                store
            });

        res.status(201).json({
            message:
                "Usuario registrado correctamente",
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                store: user.store
            }
        });

    } catch (error) {
        console.error(
            "Error en registro:",
            error
        );

        res.status(500).json({
            message:
                "Error interno al registrar usuario"
        });
    }
});


// ======================================================
// LOGIN NORMAL
// ======================================================

router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const user =
            await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                message:
                    "Credenciales incorrectas"
            });
        }

        if (
            user.locked_until &&
            new Date(user.locked_until) >
                new Date()
        ) {
            return res.status(423).json({
                message:
                    "Cuenta bloqueada temporalmente. Intenta nuevamente más tarde."
            });
        }

        const validPassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!validPassword) {

            const attempts =
                (user.failed_attempts || 0) + 1;

            if (attempts >= 5) {

                const lockedUntil =
                    new Date(
                        Date.now() +
                        15 * 60 * 1000
                    );

                await User.updateUser(
                    user.id,
                    {
                        failed_attempts: 0,
                        locked_until:
                            lockedUntil
                    }
                );

                return res.status(423).json({
                    message:
                        "Cuenta bloqueada durante 15 minutos por demasiados intentos."
                });
            }

            await User.updateUser(
                user.id,
                {
                    failed_attempts:
                        attempts
                }
            );

            return res.status(401).json({
                message:
                    "Credenciales incorrectas",
                attemptsRemaining:
                    5 - attempts
            });
        }

        await User.updateUser(
            user.id,
            {
                failed_attempts: 0,
                locked_until: null
            }
        );

        const code =
            crypto.randomInt(
                100000,
                1000000
            ).toString();

        const expires =
            new Date(
                Date.now() +
                5 * 60 * 1000
            );

        await User.updateUser(
            user.id,
            {
                mfa_code: code,
                mfa_expires_at:
                    expires,
                mfa_attempts: 0
            }
        );

        await sendMfaEmail(
            user.email,
            code
        );

        const mfaToken =
            jwt.sign(
                {
                    userId: user.id,
                    type: "MFA"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "5m"
                }
            );

        res.json({
            message:
                "Credenciales correctas. Ingresa el código MFA.",
            mfaToken
        });

    } catch (error) {
        console.error(
            "Error en login:",
            error
        );

        res.status(500).json({
            message:
                "Error interno en el login"
        });
    }
});


// ======================================================
// VERIFICAR MFA
// ======================================================

router.post(
    "/mfa/verify",
    async (req, res) => {
        try {
            const {
                mfaToken,
                code
            } = req.body;

            if (!mfaToken || !code) {
                return res.status(400).json({
                    message:
                        "Código MFA requerido"
                });
            }

            let decoded;

            try {
                decoded =
                    jwt.verify(
                        mfaToken,
                        process.env.JWT_SECRET
                    );
            } catch {
                return res.status(401).json({
                    message:
                        "El token MFA expiró"
                });
            }

            if (decoded.type !== "MFA") {
                return res.status(401).json({
                    message:
                        "Token MFA inválido"
                });
            }

            const user =
                await User.findById(
                    decoded.userId
                );

            if (!user) {
                return res.status(404).json({
                    message:
                        "Usuario no encontrado"
                });
            }

            if (
                !user.mfa_expires_at ||
                new Date(
                    user.mfa_expires_at
                ) < new Date()
            ) {
                return res.status(401).json({
                    message:
                        "El código MFA expiró"
                });
            }

            if (
                (user.mfa_attempts || 0) >= 3
            ) {
                return res.status(403).json({
                    message:
                        "Superaste el máximo de intentos MFA"
                });
            }

            if (user.mfa_code !== code) {

                const attempts =
                    (user.mfa_attempts || 0) +
                    1;

                await User.updateUser(
                    user.id,
                    {
                        mfa_attempts:
                            attempts
                    }
                );

                return res.status(401).json({
                    message:
                        "Código MFA incorrecto",
                    attemptsRemaining:
                        3 - attempts
                });
            }

            const token =
                jwt.sign(
                    {
                        userId: user.id,
                        role: user.role,
                        store: user.store
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "8h"
                    }
                );

            await User.updateUser(
                user.id,
                {
                    mfa_code: null,
                    mfa_expires_at: null,
                    mfa_attempts: 0
                }
            );

            res.json({
                message:
                    "Autenticación exitosa",
                token,
                user: {
                    id: user.id,
                    fullName:
                        user.full_name,
                    email: user.email,
                    role: user.role,
                    store: user.store
                }
            });

        } catch (error) {
            console.error(
                "Error MFA:",
                error
            );

            res.status(500).json({
                message:
                    "Error interno en MFA"
            });
        }
    }
);


// ======================================================
// GOOGLE
// ======================================================

router.get(
    "/google",
    passport.authenticate(
        "google",
        {
            scope: [
                "profile",
                "email"
            ],
            session: false
        }
    )
);


router.get(
    "/google/callback",
    passport.authenticate(
        "google",
        {
            session: false,
            failureRedirect: "/index.html"
        }
    ),
    (req, res) => {

        const user = req.user;

        const token =
            jwt.sign(
                {
                    userId: user.id,
                    role: user.role,
                    store: user.store
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "8h"
                }
            );

        const userData = {
            id: user.id,
            fullName:
                user.full_name,
            email:
                user.email,
            role:
                user.role,
            store:
                user.store
        };

        const encodedUser =
            encodeURIComponent(
                JSON.stringify(userData)
            );

        res.redirect(
            `/dashboard.html?token=${encodeURIComponent(token)}&user=${encodedUser}`
        );
    }
);


// ======================================================
// GITHUB
// ======================================================

router.get(
    "/github",
    passport.authenticate(
        "github",
        {
            scope: ["user:email"],
            session: false
        }
    )
);


router.get(
    "/github/callback",
    passport.authenticate(
        "github",
        {
            session: false,
            failureRedirect: "/index.html"
        }
    ),
    (req, res) => {

        const user = req.user;

        const token =
            jwt.sign(
                {
                    userId: user.id,
                    role: user.role,
                    store: user.store
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "8h"
                }
            );

        const userData = {
            id: user.id,
            fullName:
                user.full_name,
            email:
                user.email,
            role:
                user.role,
            store:
                user.store
        };

        const encodedUser =
            encodeURIComponent(
                JSON.stringify(userData)
            );

        res.redirect(
            `/dashboard.html?token=${encodeURIComponent(token)}&user=${encodedUser}`
        );
    }
);


module.exports = router;