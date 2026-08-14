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
            .select("id, name, message, created_at")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(
            "Supabase Error:",
            error
        );

        commentList.innerHTML =
            '<p class="empty">Gagal memuat komentar.</p>';

        return;
    }

    if (!data || data.length === 0) {

        commentList.innerHTML =
            '<p class="empty">Belum ada komentar.</p>';

        return;
    }

    commentList.innerHTML = "";

    const role =
        sessionStorage.getItem("role");

    data.forEach(comment => {

        const box =
            document.createElement("article");

        box.className = "comment";


        // =================================
        // NAMA
        // =================================

        const name =
            document.createElement("div");

        name.className =
            "comment-name";

        name.textContent =
            comment.name;


        // =================================
        // PESAN
        // =================================

        const message =
            document.createElement("div");

        message.className =
            "comment-message";

        message.textContent =
            comment.message;


        // =================================
        // WAKTU
        // =================================

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


        // =================================
        // TOMBOL ADMIN
        // =================================

        if (role === "admin") {

            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";

            deleteButton.className =
                "delete-comment";

            deleteButton.textContent =
                "🗑️ Hapus";

            deleteButton.addEventListener(
                "click",
                () => {
                    deleteComment(comment.id);
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
// FORMAT TANGGAL
// ========================================

function formatDate(date) {

    return new Date(date).toLocaleString(
        "id-ID",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// ========================================
// TAMBAH KOMENTAR
// ========================================

async function addComment() {

    const loginStatus =
        sessionStorage.getItem(
            "loginStatus"
        );

    // Guest tidak boleh komentar
    if (loginStatus !== "user") {

        alert(
            "Guest tidak dapat mengirim komentar."
        );

        return;
    }


    const username =
        sessionStorage.getItem(
            "username"
        );

    if (!username) {

        alert(
            "Sesi login tidak ditemukan."
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
            "Supabase Error:",
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


    // Bersihkan textarea
    messageInput.value = "";


    // Reset counter
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
// HAPUS KOMENTAR - ADMIN
// ========================================

async function deleteComment(id) {

    const role =
        sessionStorage.getItem(
            "role"
        );


    if (role !== "admin") {

        alert(
            "Akses ditolak."
        );

        return;
    }


    const confirmed =
        confirm(
            "Yakin ingin menghapus komentar ini?"
        );


    if (!confirmed) return;


    console.log(
        "Menghapus komentar ID:",
        id
    );


    const { error } =
        await supabaseClient
            .from("comments")
            .delete()
            .eq("id", id);


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


    alert(
        "Komentar berhasil dihapus."
    );


    await loadComments();

}


// ========================================
// REALTIME
// ========================================

supabaseClient
    .channel("comments-realtime")
    .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: "comments"
        },
        () => {

            loadComments();

        }
    )
    .subscribe();


// ========================================
// COUNTER KARAKTER
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

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
                () => {

                    charCount.textContent =
                        `${messageInput.value.length} / 500`;

                }
            );

        }


        loadComments();

    }
);