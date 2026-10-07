const form =
    document.getElementById("mfaForm");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const code =
        document.getElementById("code").value;

    const mfaToken =
        localStorage.getItem("mfaToken");

    const message =
        document.getElementById("message");

    if (!mfaToken) {

        message.innerHTML =
            `<span style="color:red">
                No existe una sesión MFA.
            </span>`;

        return;
    }

    message.innerHTML =
        "Verificando código...";

    try {

        const response = await fetch(
            "/api/auth/mfa/verify",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    mfaToken,
                    code
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            message.innerHTML =
                `<span style="color:red">
                    ${data.message}
                    <br>
                    Intentos restantes:
                    ${data.attemptsRemaining ?? 0}
                </span>`;

            return;
        }

        localStorage.removeItem(
            "mfaToken"
        );

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        window.location.href =
            "dashboard.html";

    } catch (error) {

        console.error(error);

        message.innerHTML =
            `<span style="color:red">
                Error de conexión.
            </span>`;
    }

});