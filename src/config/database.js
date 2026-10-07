const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on("connect", () => {
    console.log("Conectado a PostgreSQL");
});

pool.on("error", (error) => {
    console.error("Error en PostgreSQL:", error.message);
});

async function connectDB() {
    try {
        await pool.query("SELECT NOW()");
        console.log("PostgreSQL conectado correctamente");
    } catch (error) {
        console.error("Error conectando a PostgreSQL:", error.message);
        process.exit(1);
    }
}

module.exports = {
    pool,
    connectDB
};