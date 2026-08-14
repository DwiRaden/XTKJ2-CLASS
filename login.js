// ========================================
// CEK LOGIN YANG SUDAH ADA
// ========================================

const existingLogin =
    localStorage.getItem("loginStatus");


if (
    existingLogin === "user" ||
    existingLogin === "guest"
) {

    window.location.replace(
        "index.html"
    );

}


// ========================================
// LOGIN
// ========================================

async function login() {

    const usernameInput =
        document.getElementById(
            "username"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const loginButton =
        document.getElementById(
            "loginButton"
        );


    const message =
        document.getElementById(
            "loginMessage"
        );


    const username =
        usernameInput.value.trim();


    const password =
        passwordInput.value;


    if (
        !username ||
        !password
    ) {

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
            database.users.find(
                account =>
                    account.username === username &&
                    account.password === password
            );


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
        // SIMPAN LOGIN PERMANEN
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
            user.name
        );


        localStorage.setItem(
            "role",
            user.role || "user"
        );


        window.location.replace(
            "index.html"
        );


    } catch (error) {

        console.error(
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
// GUEST
// ========================================

function guestLogin() {

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


    window.location.replace(
        "index.html"
    );

}


// ========================================
// ENTER = LOGIN
// ========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            login();

        }

    }
);