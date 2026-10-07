const form =
    document.getElementById("registerForm");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const fullName =
        document.getElementById("fullName").value;

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const store =
        document.getElementById("store").value;

    const message =
        document.getElementById("message");

    message.innerHTML =
        "Registrando usuario...";

    try {

        const response = await fetch(
            "/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    fullName,
                    email,
                    password,
                    store
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            const errors =
                data.errors
                ? data.errors.join("<br>")
                : data.message;

            message.innerHTML =
                `<span style="color:red">
                    ${errors}
                </span>`;

            return;
        }

        message.innerHTML =
            `<span style="color:green">
                Cuenta creada correctamente.
            </span>`;

        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 1500);

    } catch (error) {

        console.error(error);

        message.innerHTML =
            `<span style="color:red">
                Error de conexión.
            </span>`;
    }

});