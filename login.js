async function login() {

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const loginButton =
        document.getElementById("loginButton");

    const message =
        document.getElementById("loginMessage");


    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;


    if (!username || !password) {

        message.textContent =
            "Username dan password wajib diisi.";

        message.className =
            "login-message error";

        return;
    }


    loginButton.disabled = true;

    loginButton.textContent =
        "Memeriksa...";


    try {

        const response =
            await fetch("./users.json");


        if (!response.ok) {
            throw new Error(
                "users.json tidak ditemukan."
            );
        }


        const database =
            await response.json();


        const user =
            database.users.find(account => {

                return (
                    account.username === username &&
                    account.password === password
                );

            });


        if (!user) {

            message.textContent =
                "Username atau password salah.";

            message.className =
                "login-message error";

            loginButton.disabled = false;

            loginButton.textContent =
                "Masuk";

            return;
        }


        sessionStorage.setItem(
            "loginStatus",
            "user"
        );

        sessionStorage.setItem(
            "username",
            user.username
        );

        sessionStorage.setItem(
            "name",
            user.name
        );

        sessionStorage.setItem(
            "role",
            user.role || "user"
        );


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(error);

        message.textContent =
            "Gagal membaca database akun.";

        message.className =
            "login-message error";

        loginButton.disabled = false;

        loginButton.textContent =
            "Masuk";
    }
}


// ===============================
// GUEST
// ===============================

function guestLogin() {

    sessionStorage.setItem(
        "loginStatus",
        "guest"
    );

    sessionStorage.setItem(
        "username",
        "Guest"
    );

    sessionStorage.setItem(
        "name",
        "Guest"
    );

    sessionStorage.setItem(
        "role",
        "guest"
    );


    window.location.href =
        "index.html";
}


// ===============================
// ENTER = LOGIN
// ===============================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            login();
        }

    }
);
