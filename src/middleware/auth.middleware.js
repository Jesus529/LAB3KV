const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Token requerido."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.type === "MFA") {
            return res.status(401).json({
                message: "Debes completar la verificación MFA."
            });
        }

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Token inválido o expirado."
        });
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "No autenticado."
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "No tienes permisos para realizar esta acción."
            });
        }

        next();
    };
}

module.exports = {
    authenticate,
    authorize
};