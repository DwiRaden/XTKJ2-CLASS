```javascript
document.addEventListener("DOMContentLoaded", () => {

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const loginButton =
        document.getElementById("loginButton");

    const guestButton =
        document.querySelector(".guest-button");

    const message =
        document.getElementById("loginMessage");


    // ========================================
    // LOGIN
    // ========================================

    async function login() {

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        // ====================================
        // VALIDASI
        // ====================================

        if (!username || !password) {

            message.textContent =
                "Username dan password wajib diisi.";

            message.className =
                "login-message error";

            return;
        }


        // ====================================
        // LOADING
        // ====================================

        loginButton.disabled = true;

        loginButton.textContent =
            "Memeriksa...";


        try {

            // =================================
            // AMBIL USERS.JSON
            // =================================

            const response =
                await fetch(
                    "./users.json?cache=" +
                    Date.now()
                );


            if (!response.ok) {

                throw new Error(
                    "users.json tidak ditemukan. HTTP " +
                    response.status
                );

            }


            // =================================
            // PARSE JSON
            // =================================

            const database =
                await response.json();


            // =================================
            // CEK FORMAT
            // =================================

            if (
                !database ||
                !Array.isArray(database.users)
            ) {

                throw new Error(
                    "Format users.json tidak valid."
                );

            }


            // =================================
            // CARI AKUN
            // =================================

            const user =
                database.users.find(account => {

                    const accountUsername =
                        String(
                            account.username ?? ""
                        )
                        .trim()
                        .toLowerCase();


                    const accountPassword =
                        String(
                            account.password ?? ""
                        );


                    return (
                        accountUsername ===
                        username.toLowerCase()
                        &&
                        accountPassword ===
                        password
                    );

                });


            // =================================
            // AKUN TIDAK DITEMUKAN
            // =================================

            if (!user) {

                message.textContent =
                    "Username atau password salah.";

                message.className =
                    "login-message error";

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "Masuk";

                return;
            }


            // =================================
            // BERSIHKAN SESSION
            // =================================

            sessionStorage.clear();


            // =================================
            // SIMPAN LOGIN
            // =================================

            localStorage.setItem(
                "loginStatus",
                "user"
            );

            localStorage.setItem(
                "username",
                user.username
            );

            localStorage.setItem(
                "name",
                user.name || user.username
            );

            localStorage.setItem(
                "role",
                user.role || "user"
            );


            // =================================
            // BERHASIL
            // =================================

            message.textContent =
                "Login berhasil! Mengalihkan...";

            message.className =
                "login-message";


            window.location.href =
                "index.html";

        }

        catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            message.textContent =
                "Gagal membaca database akun.";


            message.className =
                "login-message error";


            loginButton.disabled =
                false;


            loginButton.textContent =
                "Masuk";

        }

    }


    // ========================================
    // EVENT TOMBOL LOGIN
    // ========================================

    loginButton.addEventListener(
        "click",
        login
    );


    // ========================================
    // ENTER DI USERNAME
    // ========================================

    usernameInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                login();

            }

        }
    );


    // ========================================
    // ENTER DI PASSWORD
    // ========================================

    passwordInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                login();

            }

        }
    );


    // ========================================
    // GUEST
    // ========================================

    if (guestButton) {

        guestButton.addEventListener(
            "click",
            () => {

                sessionStorage.clear();


                localStorage.setItem(
                    "loginStatus",
                    "guest"
                );

                localStorage.setItem(
                    "username",
                    "Guest"
                );

                localStorage.setItem(
                    "name",
                    "Guest"
                );

                localStorage.setItem(
                    "role",
                    "guest"
                );


                window.location.href =
                    "index.html";

            }
        );

    }

});
```
