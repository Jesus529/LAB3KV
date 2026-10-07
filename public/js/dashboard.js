const token =
    localStorage.getItem("token");

const userString =
    localStorage.getItem("user");

if (!token || !userString) {

    window.location.href =
        "index.html";
}

const user =
    JSON.parse(userString);

document.getElementById(
    "userName"
).textContent = user.fullName;

document.getElementById(
    "userRole"
).textContent = user.role;

document.getElementById(
    "roleName"
).textContent = user.role;

document.getElementById(
    "storeName"
).textContent = user.store;

document.getElementById(
    "welcomeText"
).textContent =
    `Bienvenido ${user.fullName}`;

const table =
    document.getElementById(
        "productsTable"
    );

async function loadProducts() {

    try {

        const response =
            await fetch(
                "/api/products",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        if (response.status === 401) {

            logout();

            return;
        }

        const products =
            await response.json();

        document.getElementById(
            "totalProducts"
        ).textContent =
            products.length;

        table.innerHTML = "";

        products.forEach(product => {

            let actions = "";

            /*
            EMPLEADO:
            Solo puede modificar stock.
            */

            if (
                user.role === "ADMIN" ||
                user.role === "GERENTE" ||
                user.role === "EMPLEADO"
            ) {

                actions += `
                    <button
                        class="action-btn stock-btn"
                        onclick="updateStock('${product._id}')"
                    >
                        Stock
                    </button>
                `;
            }

            /*
            ADMINISTRADOR Y GERENTE:
            Pueden modificar precios.
            */

            if (
                user.role === "ADMIN" ||
                user.role === "GERENTE"
            ) {

                actions += `
                    <button
                        class="action-btn price-btn"
                        onclick="updatePrice('${product._id}')"
                    >
                        Precio
                    </button>
                `;
            }

            /*
            SOLO ADMINISTRADOR:
            Puede eliminar.
            */

            if (user.role === "ADMIN") {

                actions += `
                    <button
                        class="action-btn delete-btn"
                        onclick="deleteProduct('${product._id}')"
                    >
                        Eliminar
                    </button>
                `;
            }

            /*
            AUDITOR:
            Solo lectura.
            */

            if (user.role === "AUDITOR") {

                actions =
                    "<span>Solo lectura</span>";
            }

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    ${product.name}
                </td>

                <td>
                    ${product.sku}
                </td>

                <td>
                    ${product.category}
                </td>

                <td>
                    S/ ${Number(
                        product.price
                    ).toFixed(2)}
                </td>

                <td>
                    ${product.stock}
                </td>

                <td>
                    ${product.store}
                </td>

                <td>
                    ${actions}
                </td>
            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    Error cargando productos.
                </td>
            </tr>
        `;
    }
}

/*
Actualizar stock
*/

async function updateStock(id) {

    const stock =
        prompt(
            "Ingrese el nuevo stock:"
        );

    if (stock === null) {
        return;
    }

    const response =
        await fetch(
            `/api/products/${id}/stock`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    stock: Number(stock)
                })
            }
        );

    const data =
        await response.json();

    alert(
        data.message ||
        "Stock actualizado"
    );

    loadProducts();
}

/*
Actualizar precio
*/

async function updatePrice(id) {

    const price =
        prompt(
            "Ingrese el nuevo precio:"
        );

    if (price === null) {
        return;
    }

    const response =
        await fetch(
            `/api/products/${id}/price`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    price: Number(price)
                })
            }
        );

    const data =
        await response.json();

    alert(
        data.message ||
        "Precio actualizado"
    );

    loadProducts();
}

/*
Eliminar producto
*/

async function deleteProduct(id) {

    if (
        !confirm(
            "¿Deseas eliminar este producto?"
        )
    ) {

        return;
    }

    const response =
        await fetch(
            `/api/products/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    const data =
        await response.json();

    alert(
        data.message ||
        "Producto eliminado"
    );

    loadProducts();
}

/*
Mostrar formulario
*/

const newProductButton =
    document.getElementById(
        "newProductButton"
    );

/*
Auditor y empleado NO pueden crear productos.
*/

if (
    user.role === "EMPLEADO" ||
    user.role === "AUDITOR"
) {

    newProductButton.style.display =
        "none";
}

newProductButton.addEventListener(
    "click",
    () => {

        document
            .getElementById(
                "productFormContainer"
            )
            .classList.toggle("hidden");

    }
);

/*
Crear producto
*/

document
    .getElementById("productForm")
    .addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const product = {

                name:
                    document.getElementById(
                        "productName"
                    ).value,

                sku:
                    document.getElementById(
                        "productSku"
                    ).value,

                category:
                    document.getElementById(
                        "productCategory"
                    ).value,

                price:
                    Number(
                        document.getElementById(
                            "productPrice"
                        ).value
                    ),

                stock:
                    Number(
                        document.getElementById(
                            "productStock"
                        ).value
                    ),

                store:
                    user.store
            };

            const response =
                await fetch(
                    "/api/products",
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(product)
                    }
                );

            const data =
                await response.json();

            document.getElementById(
                "productMessage"
            ).textContent =
                data.message ||
                "Producto creado";

            if (response.ok) {

                document
                    .getElementById(
                        "productForm"
                    )
                    .reset();

                loadProducts();
            }

        }
    );

/*
Cerrar sesión
*/

document
    .getElementById("logout")
    .addEventListener(
        "click",
        logout
    );

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    localStorage.removeItem(
        "mfaToken"
    );

    window.location.href =
        "index.html";
}

loadProducts();