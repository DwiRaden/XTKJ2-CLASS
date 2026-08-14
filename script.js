// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL =
    "https://xzgcspmwkxnimtczdopq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_AuowlqGe8ykjqRBXlgY5EQ_M3h2DdFG";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ========================================
// LOGIN DATA
// ========================================

function getLoginStatus() {
    return localStorage.getItem("loginStatus");
}

function getUsername() {
    return localStorage.getItem("username");
}

function getRole() {
    return localStorage.getItem("role");
}


// ========================================
// LOAD COMMENTS
// ========================================

async function loadComments() {

    const commentList =
        document.getElementById("commentList");

    if (!commentList) return;

    commentList.innerHTML =
        '<p class="empty">Memuat komentar...</p>';

    const { data, error } =
        await supabaseClient
            .from("comments")
            .select(
                "id, name, message, created_at"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(
            "Supabase Error:",
            error
        );

        commentList.innerHTML =
            `<p class="empty">
                Gagal memuat komentar.
            </p>`;

        return;
    }

    if (!data || data.length === 0) {

        commentList.innerHTML =
            `<p class="empty">
                Belum ada komentar.
            </p>`;

        return;
    }

    commentList.innerHTML = "";

    const role = getRole();

    data.forEach(comment => {

        const box =
            document.createElement("article");

        box.className = "comment";


        // ================================
        // NAMA
        // ================================

        const name =
            document.createElement("div");

        name.className =
            "comment-name";

        name.textContent =
            comment.name;


        // ================================
        // PESAN
        // ================================

        const message =
            document.createElement("div");

        message.className =
            "comment-message";

        message.textContent =
            comment.message;


        // ================================
        // WAKTU
        // ================================

        const time =
            document.createElement("div");

        time.className =
            "comment-time";

        time.textContent =
            formatDate(
                comment.created_at
            );


        box.appendChild(name);
        box.appendChild(message);
        box.appendChild(time);


        // ================================
        // ADMIN DELETE
        // ================================

        if (role === "admin") {

            const deleteButton =
                document.createElement("button");

            deleteButton.type =
                "button";

            deleteButton.className =
                "delete-comment";

            deleteButton.textContent =
                "🗑️ Hapus";

            deleteButton.addEventListener(
                "click",
                function() {

                    deleteComment(
                        comment.id
                    );

                }
            );

            box.appendChild(
                deleteButton
            );
        }


        commentList.appendChild(box);

    });
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(date) {

    return new Date(date)
        .toLocaleString(
            "id-ID",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
}


// ========================================
// ADD COMMENT
// ========================================

async function addComment() {

    const loginStatus =
        getLoginStatus();

    const role =
        getRole();

    const username =
        getUsername();


    // ====================================
    // HARUS LOGIN SEBAGAI USER / ADMIN
    // ====================================

    if (
        loginStatus !== "user" ||
        !username ||
        role === "guest"
    ) {

        alert(
            "Guest tidak dapat mengirim komentar."
        );

        return;
    }


    const messageInput =
        document.getElementById(
            "message"
        );

    if (!messageInput) return;


    const message =
        messageInput.value.trim();


    if (!message) {

        alert(
            "Komentar belum diisi!"
        );

        messageInput.focus();

        return;
    }


    if (message.length > 500) {

        alert(
            "Komentar maksimal 500 karakter!"
        );

        return;
    }


    const button =
        document.getElementById(
            "sendCommentButton"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Mengirim...";
    }


    const { error } =
        await supabaseClient
            .from("comments")
            .insert([
                {
                    name: username,
                    message: message
                }
            ]);


    if (error) {

        console.error(
            "Insert Error:",
            error
        );

        alert(
            "Gagal mengirim komentar.\n\n" +
            error.message
        );

        if (button) {

            button.disabled = false;

            button.textContent =
                "Kirim Komentar";
        }

        return;
    }


    messageInput.value = "";


    const charCount =
        document.getElementById(
            "charCount"
        );

    if (charCount) {

        charCount.textContent =
            "0 / 500";
    }


    if (button) {

        button.disabled = false;

        button.textContent =
            "Kirim Komentar";
    }


    await loadComments();
}


// ========================================
// DELETE COMMENT
// ========================================

async function deleteComment(id) {

    const role =
        getRole();


    if (role !== "admin") {

        alert(
            "Akses ditolak. Kamu bukan admin."
        );

        return;
    }


    const confirmed =
        confirm(
            "Yakin ingin menghapus komentar ini?"
        );


    if (!confirmed) return;


    const { error } =
        await supabaseClient
            .from("comments")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "Delete Error:",
            error
        );

        alert(
            "Gagal menghapus komentar.\n\n" +
            error.message
        );

        return;
    }


    await loadComments();
}


// ========================================
// REALTIME
// ========================================

supabaseClient
    .channel(
        "comments-realtime"
    )
    .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: "comments"
        },
        function() {

            loadComments();

        }
    )
    .subscribe();


// ========================================
// CHARACTER COUNTER
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const messageInput =
            document.getElementById(
                "message"
            );

        const charCount =
            document.getElementById(
                "charCount"
            );


        if (
            messageInput &&
            charCount
        ) {

            messageInput.addEventListener(
                "input",
                function() {

                    charCount.textContent =
                        `${messageInput.value.length} / 500`;

                }
            );

        }


        loadComments();

    }
);