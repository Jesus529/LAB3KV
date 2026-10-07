const { pool } = require("../config/database");

async function getAllProducts() {
    const result = await pool.query(
        "SELECT * FROM products ORDER BY id DESC"
    );

    return result.rows;
}

async function getProductsByStore(store) {
    const result = await pool.query(
        `SELECT * FROM products
         WHERE store = $1
         ORDER BY id DESC`,
        [store]
    );

    return result.rows;
}

async function getProductById(id) {
    const result = await pool.query(
        "SELECT * FROM products WHERE id = $1",
        [id]
    );

    return result.rows[0];
}

async function createProduct({
    name,
    sku,
    category,
    price,
    stock,
    store
}) {
    const result = await pool.query(
        `INSERT INTO products
        (name, sku, category, price, stock, store)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            name,
            sku,
            category,
            price,
            stock,
            store
        ]
    );

    return result.rows[0];
}

async function updateStock(id, stock) {
    const result = await pool.query(
        `UPDATE products
         SET stock = $1
         WHERE id = $2
         RETURNING *`,
        [stock, id]
    );

    return result.rows[0];
}

async function updatePrice(id, price) {
    const result = await pool.query(
        `UPDATE products
         SET price = $1
         WHERE id = $2
         RETURNING *`,
        [price, id]
    );

    return result.rows[0];
}

async function deleteProduct(id) {
    const result = await pool.query(
        `DELETE FROM products
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return result.rows[0];
}

module.exports = {
    getAllProducts,
    getProductsByStore,
    getProductById,
    createProduct,
    updateStock,
    updatePrice,
    deleteProduct
};