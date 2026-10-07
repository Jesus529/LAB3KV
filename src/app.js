require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const passport = require("./config/passport");

const { connectDB } =
    require("./config/database");

const app = express();

const PORT =
    process.env.PORT || 3000;

connectDB();

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(passport.initialize());

app.use(
    express.static(
        path.join(
            __dirname,
            "../public"
        )
    )
);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../public/index.html"
        )
    );
});


// AUTH
app.use(
    "/api/auth",
    require("./routes/auth.routes")
);


// USERS
app.use(
    "/api/users",
    require("./routes/user.routes")
);


// PRODUCTS
app.use(
    "/api/products",
    require("./routes/product.routes")
);


app.get("/api", (req, res) => {
    res.json({
        message:
            "API TechStore funcionando",
        database:
            "PostgreSQL",
        version:
            "1.0.0"
    });
});


app.use(
    (err, req, res, next) => {
        console.error(err);

        res.status(500).json({
            message:
                "Error interno del servidor."
        });
    }
);


app.listen(
    PORT,
    () => {
        console.log(
            `Servidor TechStore ejecutándose en http://localhost:${PORT}`
        );
    }
);