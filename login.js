```javascript
async function login() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginButton");
    const message = document.getElementById("loginMessage");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        message.textContent = "Username dan password wajib diisi.";
        message.className = "login-message error";
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Memeriksa...";

    try {
        // ===============================
        // AMBIL DATABASE
        // ===============================

        const response = await fetch("./users.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `users.json gagal dimuat. HTTP ${response.status}`
            );
        }

        // ===============================
        // BACA JSON
        // ===============================

        const database = await response.json();

        // Pastikan format database benar
        if (
            !database ||
            !Array.isArray(database.users)
        ) {
            throw new Error(
                "Format users.json tidak valid. Harus memiliki array 'users'."
            );
        }

        // ===============================
        // CARI USER
        // ===============================

        const user = database.users.find(account =>
            String(account.username).trim() === username &&
            String(account.password) === password
        );

        // ===============================
        // LOGIN GAGAL
        // ===============================

        if (!user) {
            message.textContent =
                "Username atau password salah.";

            message.className =
                "login-message error";

            loginButton.disabled = false;
            loginButton.textContent = "Masuk";

            return;
        }

        // ===============================
        // BERSIHKAN SESSION
        // ===============================

        sessionStorage.clear();

        // ===============================
        // SIMPAN LOGIN
        // ===============================

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

        // ===============================
        // MASUK DASHBOARD
        // ===============================

        window.location.href = "index.html";

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        message.textContent =
            "Database akun bermasalah: " +
            error.message;

        message.className =
            "login-message error";

        loginButton.disabled = false;
        loginButton.textContent = "Masuk";
    }
}


// ===============================
// GUEST
// ===============================

function guestLogin() {

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


// ===============================
// ENTER
// ===============================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            document.activeElement.tagName !== "TEXTAREA"
        ) {
            login();
        }

    }
);
```
