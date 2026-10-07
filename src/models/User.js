const { pool } = require("../config/database");

async function findByEmail(email) {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    return result.rows[0];
}

async function findById(id) {
    const result = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [id]
    );

    return result.rows[0];
}

async function createUser({
    fullName,
    email,
    password,
    role = "EMPLEADO",
    store
}) {
    const result = await pool.query(
        `INSERT INTO users
        (full_name, email, password, role, store)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [fullName, email, password, role, store]
    );

    return result.rows[0];
}

async function updateUser(id, fields) {
    const allowedFields = [
        "role",
        "store",
        "failed_attempts",
        "locked_until",
        "mfa_code",
        "mfa_expires_at",
        "mfa_attempts"
    ];

    const updates = [];
    const values = [];

    for (const field of allowedFields) {
        if (fields[field] !== undefined) {
            values.push(fields[field]);
            updates.push(`${field} = $${values.length}`);
        }
    }

    if (updates.length === 0) {
        return findById(id);
    }

    values.push(id);

    const result = await pool.query(
        `UPDATE users
         SET ${updates.join(", ")}
         WHERE id = $${values.length}
         RETURNING *`,
        values
    );

    return result.rows[0];
}

async function getAllUsers() {
    const result = await pool.query(
        `SELECT id, full_name, email, role, store, created_at
         FROM users
         ORDER BY id DESC`
    );

    return result.rows;
}

module.exports = {
    findByEmail,
    findById,
    createUser,
    updateUser,
    getAllUsers
};