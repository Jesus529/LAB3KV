const express = require("express");
const User = require("../models/User");
const {
    authenticate,
    authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

// ADMIN puede ver todos los usuarios
router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    async (req, res) => {
        try {
            const users = await User.getAllUsers();

            res.json(users);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Error al obtener usuarios."
            });
        }
    }
);

// ADMIN puede modificar rol y tienda
router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    async (req, res) => {
        try {
            const {
                role,
                store
            } = req.body;

            const validRoles = [
                "ADMIN",
                "GERENTE",
                "EMPLEADO",
                "AUDITOR"
            ];

            if (
                role &&
                !validRoles.includes(role)
            ) {
                return res.status(400).json({
                    message: "Rol inválido."
                });
            }

            const user = await User.findById(
                req.params.id
            );

            if (!user) {
                return res.status(404).json({
                    message: "Usuario no encontrado."
                });
            }

            const updatedUser =
                await User.updateUser(
                    req.params.id,
                    {
                        role,
                        store
                    }
                );

            res.json({
                message:
                    "Usuario actualizado correctamente.",
                user: {
                    id: updatedUser.id,
                    fullName: updatedUser.full_name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    store: updatedUser.store
                }
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Error al actualizar usuario."
            });
        }
    }
);

module.exports = router;