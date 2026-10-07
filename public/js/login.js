const form =
    document.getElementById("loginForm");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");

    message.innerHTML =
        "Validando credenciales...";

    try {

        const response = await fetch(
            "/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            message.innerHTML =
                `<span style="color:red">
                    ${data.message}
                </span>`;

            return;
        }

        localStorage.setItem(
            "mfaToken",
            data.mfaToken
        );

        window.location.href =
            "mfa.html";

    } catch (error) {

        console.error(error);

        message.innerHTML =
            `<span style="color:red">
                No se pudo conectar con el servidor.
            </span>`;
    }

});
