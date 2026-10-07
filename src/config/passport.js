const passport = require("passport");

const GoogleStrategy =
    require("passport-google-oauth20").Strategy;

const GitHubStrategy =
    require("passport-github2").Strategy;

const User = require("../models/User");


// ==========================================
// CREAR / BUSCAR USUARIO OAUTH
// ==========================================

async function findOrCreateOAuthUser(
    profile,
    provider
) {

    let email = null;

    if (
        profile.emails &&
        profile.emails.length > 0
    ) {
        email =
            profile.emails[0].value
                .toLowerCase();
    }

    // Si GitHub no devuelve correo
    if (!email) {

        email =
            `${profile.id}@${provider}.local`;
    }

    let user =
        await User.findByEmail(email);

    if (!user) {

        const fullName =
            profile.displayName ||
            profile.username ||
            "Usuario OAuth";

        user =
            await User.createUser({
                fullName: fullName,
                email: email,
                password: null,
                role: "EMPLEADO",
                store: "Sin asignar"
            });

        console.log(
            `Usuario creado mediante ${provider}: ${email}`
        );
    }

    return user;
}


// ==========================================
// GOOGLE
// ==========================================

if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
) {

    passport.use(
        new GoogleStrategy(
            {
                clientID:
                    process.env.GOOGLE_CLIENT_ID,

                clientSecret:
                    process.env.GOOGLE_CLIENT_SECRET,

                callbackURL:
                    process.env.GOOGLE_CALLBACK_URL
            },

            async (
                accessToken,
                refreshToken,
                profile,
                done
            ) => {

                try {

                    console.log(
                        "Google profile:",
                        profile
                    );

                    const user =
                        await findOrCreateOAuthUser(
                            profile,
                            "google"
                        );

                    done(
                        null,
                        user
                    );

                } catch (error) {

                    console.error(
                        "ERROR GOOGLE:",
                        error
                    );

                    done(
                        error,
                        null
                    );
                }
            }
        )
    );
}


// ==========================================
// GITHUB
// ==========================================

if (
    process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET
) {

    passport.use(
        new GitHubStrategy(
            {
                clientID:
                    process.env.GITHUB_CLIENT_ID,

                clientSecret:
                    process.env.GITHUB_CLIENT_SECRET,

                callbackURL:
                    process.env.GITHUB_CALLBACK_URL
            },

            async (
                accessToken,
                refreshToken,
                profile,
                done
            ) => {

                try {

                    console.log(
                        "GitHub profile:",
                        profile
                    );

                    const user =
                        await findOrCreateOAuthUser(
                            profile,
                            "github"
                        );

                    done(
                        null,
                        user
                    );

                } catch (error) {

                    console.error(
                        "ERROR GITHUB:",
                        error
                    );

                    done(
                        error,
                        null
                    );
                }
            }
        )
    );
}


module.exports = passport;