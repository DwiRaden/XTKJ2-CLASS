const SUPABASE_URL =
    "https://xzgcspmwkxnimtczdopq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_AuowlqGe8ykjqRBXlgY5EQ_M3h2DdFG";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// LOAD COMMENTS
// ===============================

async function loadComments() {

    const commentList =
        document.getElementById("commentList");

    commentList.innerHTML =
        '<p class="empty">Memuat komentar...</p>';

    const { data, error } = await supabaseClient
        .from("comments")
        .select("id, name, message, created_at")
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Supabase Error:", error);

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

    data.forEach(comment => {

        const box = document.createElement("div");
        box.className = "comment";

        const name = document.createElement("div");
        name.className = "comment-name";
        name.textContent = comment.name;

        const message = document.createElement("div");
        message.textContent = comment.message;

        const time = document.createElement("div");
        time.className = "comment-time";

        time.textContent =
            new Date(comment.created_at)
            .toLocaleString("id-ID");

        box.appendChild(name);
        box.appendChild(message);
        box.appendChild(time);

        commentList.appendChild(box);
    });
}


// ===============================
// ADD COMMENT
// ===============================

async function addComment() {

    const nameInput =
        document.getElementById("name");

    const messageInput =
        document.getElementById("message");

    const name =
        nameInput.value.trim();

    const message =
        messageInput.value.trim();

    if (!name) {
        alert("Nama belum diisi!");
        nameInput.focus();
        return;
    }

    if (!message) {
        alert("Komentar belum diisi!");
        messageInput.focus();
        return;
    }

    if (name.length > 30) {
        alert("Nama maksimal 30 karakter!");
        return;
    }

    if (message.length > 500) {
        alert("Komentar maksimal 500 karakter!");
        return;
    }

    const button =
        document.querySelector("button");

    button.disabled = true;
    button.textContent = "Mengirim...";

    const { error } = await supabaseClient
        .from("comments")
        .insert({
            name: name,
            message: message
        });

    if (error) {

        console.error("Supabase Error:", error);

        alert(
            "Gagal mengirim komentar.\n\n" +
            error.message
        );

        button.disabled = false;
        button.textContent = "Kirim Komentar";

        return;
    }

    nameInput.value = "";
    messageInput.value = "";

    button.disabled = false;
    button.textContent = "Kirim Komentar";

    await loadComments();
}


// ===============================
// START
// ===============================

loadComments();
