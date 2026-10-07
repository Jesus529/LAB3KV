const express = require("express");
const Product = require("../models/Product");
const {
    authenticate,
    authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

// LISTAR PRODUCTOS
router.get("/", authenticate, async (req, res) => {
    try {
        let products;

        if (
            req.user.role === "GERENTE" ||
            req.user.role === "EMPLEADO"
        ) {
            products = await Product.getProductsByStore(
                req.user.store
            );
        } else {
            products = await Product.getAllProducts();
        }

        res.json(products);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error al obtener productos."
        });
    }
});

// CREAR PRODUCTO
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "GERENTE"),
    async (req, res) => {
        try {
            const {
                name,
                sku,
                category,
                price,
                stock,
                store
            } = req.body;

            if (
                !name ||
                !sku ||
                !category ||
                price === undefined ||
                stock === undefined
            ) {
                return res.status(400).json({
                    message:
                        "name, sku, category, price y stock son obligatorios."
                });
            }

            if (Number(price) < 0 || Number(stock) < 0) {
                return res.status(400).json({
                    message:
                        "El precio y stock no pueden ser negativos."
                });
            }

            let targetStore = store;

            // El gerente solamente puede crear
            // productos para su propia tienda
            if (req.user.role === "GERENTE") {
                targetStore = req.user.store;
            }

            if (!targetStore) {
                return res.status(400).json({
                    message: "Debes indicar la tienda."
                });
            }

            const product = await Product.createProduct({
                name,
                sku,
                category,
                price: Number(price),
                stock: Number(stock),
                store: targetStore
            });

            res.status(201).json(product);

        } catch (error) {
            console.error(error);

            if (error.code === "23505") {
                return res.status(409).json({
                    message: "El SKU ya existe."
                });
            }

            res.status(500).json({
                message: "Error al crear producto."
            });
        }
    }
);

// ACTUALIZAR STOCK
router.patch(
    "/:id/stock",
    authenticate,
    authorize("ADMIN", "GERENTE", "EMPLEADO"),
    async (req, res) => {
        try {
            const { stock } = req.body;

            if (
                stock === undefined ||
                Number(stock) < 0
            ) {
                return res.status(400).json({
                    message:
                        "El stock debe ser un número mayor o igual a 0."
                });
            }

            const product =
                await Product.getProductById(
                    req.params.id
                );

            if (!product) {
                return res.status(404).json({
                    message: "Producto no encontrado."
                });
            }

            // Solo ADMIN puede modificar otra tienda
            if (
                req.user.role !== "ADMIN" &&
                product.store !== req.user.store
            ) {
                return res.status(403).json({
                    message:
                        "No puedes modificar stock de otra tienda."
                });
            }

            const updatedProduct =
                await Product.updateStock(
                    req.params.id,
                    Number(stock)
                );

            res.json({
                message: "Stock actualizado.",
                product: updatedProduct
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Error al actualizar el stock."
            });
        }
    }
);

// ACTUALIZAR PRECIO
router.patch(
    "/:id/price",
    authenticate,
    authorize("ADMIN", "GERENTE"),
    async (req, res) => {
        try {
            const { price } = req.body;

            if (
                price === undefined ||
                Number(price) < 0
            ) {
                return res.status(400).json({
                    message:
                        "El precio debe ser mayor o igual a 0."
                });
            }

            const product =
                await Product.getProductById(
                    req.params.id
                );

            if (!product) {
                return res.status(404).json({
                    message: "Producto no encontrado."
                });
            }

            // Gerente solamente puede modificar
            // productos de su propia tienda
            if (
                req.user.role === "GERENTE" &&
                product.store !== req.user.store
            ) {
                return res.status(403).json({
                    message:
                        "No puedes modificar precios de otra tienda."
                });
            }

            const updatedProduct =
                await Product.updatePrice(
                    req.params.id,
                    Number(price)
                );

            res.json({
                message: "Precio actualizado.",
                product: updatedProduct
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Error al actualizar el precio."
            });
        }
    }
);

// ELIMINAR PRODUCTO
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "GERENTE"),
    async (req, res) => {
        try {
            const product =
                await Product.getProductById(
                    req.params.id
                );

            if (!product) {
                return res.status(404).json({
                    message:
                        "Producto no encontrado."
                });
            }

            // El gerente solamente puede eliminar
            // productos de su propia tienda
            if (
                req.user.role === "GERENTE" &&
                product.store !== req.user.store
            ) {
                return res.status(403).json({
                    message:
                        "No puedes eliminar productos de otra tienda."
                });
            }

            await Product.deleteProduct(
                req.params.id
            );

            res.json({
                message:
                    "Producto eliminado correctamente."
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message:
                    "Error al eliminar producto."
            });
        }
    }
);

module.exports = router;