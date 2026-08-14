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
// STATE
// ========================================

let openReplies = new Set();


// ========================================
// GET LOGIN INFO
// ========================================

function getLoginStatus() {
    return sessionStorage.getItem("loginStatus");
}

function getUsername() {
    return sessionStorage.getItem("username");
}

function getRole() {
    return sessionStorage.getItem("role");
}


// ========================================
// FORMAT DATE
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
                "id, name, message, created_at, parent_id"
            )
            .order(
                "created_at",
                {
                    ascending: true
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
                <br>
                <small>${escapeHTML(error.message)}</small>
            </p>`;

        return;
    }


    if (!data || data.length === 0) {

        commentList.innerHTML =
            '<p class="empty">Belum ada komentar.</p>';

        return;
    }


    commentList.innerHTML = "";


    // Komentar utama
    const mainComments =
        data.filter(
            comment =>
                comment.parent_id === null
        );


    mainComments
        .sort(
            (a, b) =>
                new Date(b.created_at) -
                new Date(a.created_at)
        );


    mainComments.forEach(comment => {

        const replies =
            data.filter(
                reply =>
                    String(reply.parent_id) ===
                    String(comment.id)
            );


        renderComment(
            comment,
            replies,
            commentList
        );

    });

}


// ========================================
// RENDER COMMENT
// ========================================

function renderComment(
    comment,
    replies,
    container
) {

    const article =
        document.createElement("article");

    article.className = "comment";


    // ====================================
    // HEADER
    // ====================================

    const header =
        document.createElement("div");

    header.className = "comment-header";


    const name =
        document.createElement("div");

    name.className = "comment-name";

    name.textContent =
        comment.name;


    header.appendChild(name);


    // ====================================
    // MESSAGE
    // ====================================

    const message =
        document.createElement("div");

    message.className =
        "comment-message";

    message.textContent =
        comment.message;


    // ====================================
    // TIME
    // ====================================

    const time =
        document.createElement("div");

    time.className =
        "comment-time";

    time.textContent =
        formatDate(
            comment.created_at
        );


    article.appendChild(header);
    article.appendChild(message);
    article.appendChild(time);


    // ====================================
    // ACTIONS
    // ====================================

    const actions =
        document.createElement("div");

    actions.className =
        "comment-actions";


    // BALAS
    const replyButton =
        document.createElement("button");

    replyButton.type =
        "button";

    replyButton.className =
        "reply-button";

    replyButton.textContent =
        "↩️ Balas";


    replyButton.addEventListener(
        "click",
        () => {

            showReplyBox(
                comment,
                article
            );

        }
    );


    actions.appendChild(
        replyButton
    );


    // ====================================
    // ADMIN DELETE
    // ====================================

    if (getRole() === "admin") {

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
            () => {

                deleteComment(
                    comment.id
                );

            }
        );


        actions.appendChild(
            deleteButton
        );

    }


    article.appendChild(actions);


    // ====================================
    // REPLIES
    // ====================================

    if (replies.length > 0) {

        const replyToggle =
            document.createElement("button");

        replyToggle.type =
            "button";

        replyToggle.className =
            "reply-toggle";


        const isOpen =
            openReplies.has(
                String(comment.id)
            );


        replyToggle.textContent =
            isOpen
                ? "Sembunyikan balasan"
                : `Lihat ${replies.length} balasan`;


        replyToggle.addEventListener(
            "click",
            () => {

                const key =
                    String(comment.id);


                if (openReplies.has(key)) {

                    openReplies.delete(key);

                } else {

                    openReplies.add(key);

                }


                loadComments();

            }
        );


        article.appendChild(
            replyToggle
        );


        if (isOpen) {

            const repliesContainer =
                document.createElement("div");

            repliesContainer.className =
                "replies";


            replies
                .sort(
                    (a, b) =>
                        new Date(a.created_at) -
                        new Date(b.created_at)
                )
                .forEach(
                    reply => {

                        renderReply(
                            reply,
                            comment,
                            repliesContainer
                        );

                    }
                );


            article.appendChild(
                repliesContainer
            );

        }

    }


    container.appendChild(article);

}


// ========================================
// RENDER REPLY
// ========================================

function renderReply(
    reply,
    parentComment,
    container
) {

    const replyBox =
        document.createElement("div");

    replyBox.className =
        "comment reply";


    // ====================================
    // REPLY HEADER
    // ====================================

    const header =
        document.createElement("div");

    header.className =
        "reply-header";


    const name =
        document.createElement("div");

    name.className =
        "comment-name";

    name.textContent =
        reply.name;


    const replyingTo =
        document.createElement("span");

    replyingTo.className =
        "replying-to";

    replyingTo.textContent =
        `Membalas @${parentComment.name}`;


    header.appendChild(name);
    header.appendChild(replyingTo);


    // ====================================
    // MESSAGE
    // ====================================

    const message =
        document.createElement("div");

    message.className =
        "comment-message";

    message.textContent =
        reply.message;


    // ====================================
    // TIME
    // ====================================

    const time =
        document.createElement("div");

    time.className =
        "comment-time";

    time.textContent =
        formatDate(
            reply.created_at
        );


    replyBox.appendChild(header);
    replyBox.appendChild(message);
    replyBox.appendChild(time);


    // ====================================
    // REPLY ACTIONS
    // ====================================

    const actions =
        document.createElement("div");

    actions.className =
        "comment-actions";


    if (getRole() === "admin") {

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
            () => {

                deleteComment(
                    reply.id
                );

            }
        );


        actions.appendChild(
            deleteButton
        );

    }


    replyBox.appendChild(
        actions
    );


    container.appendChild(
        replyBox
    );

}


// ========================================
// REPLY BOX
// ========================================

function showReplyBox(
    comment,
    article
) {

    // Jangan bikin dua reply box
    if (
        article.querySelector(
            ".reply-form"
        )
    ) {

        return;

    }


    // Guest
    if (
        getLoginStatus() !== "user"
    ) {

        alert(
            "Guest tidak dapat membalas komentar."
        );

        return;
    }


    const form =
        document.createElement("div");

    form.className =
        "reply-form";


    const textarea =
        document.createElement("textarea");

    textarea.className =
        "reply-input";

    textarea.maxLength =
        500;

    textarea.placeholder =
        `Membalas @${comment.name}...`;


    const bottom =
        document.createElement("div");

    bottom.className =
        "reply-form-bottom";


    const cancel =
        document.createElement("button");

    cancel.type =
        "button";

    cancel.className =
        "reply-cancel";

    cancel.textContent =
        "Batal";


    cancel.addEventListener(
        "click",
        () => {

            form.remove();

        }
    );


    const send =
        document.createElement("button");

    send.type =
        "button";

    send.className =
        "reply-send";

    send.textContent =
        "Balas";


    send.addEventListener(
        "click",
        async () => {

            await addReply(
                comment.id,
                textarea,
                send
            );

        }
    );


    bottom.appendChild(cancel);
    bottom.appendChild(send);


    form.appendChild(textarea);
    form.appendChild(bottom);


    article.appendChild(form);


    textarea.focus();

}


// ========================================
// ADD REPLY
// ========================================

async function addReply(
    parentId,
    textarea,
    button
) {

    if (
        getLoginStatus() !== "user"
    ) {

        alert(
            "Guest tidak dapat membalas komentar."
        );

        return;
    }


    const username =
        getUsername();


    if (!username) {

        alert(
            "Sesi login tidak ditemukan."
        );

        return;
    }


    const message =
        textarea.value.trim();


    if (!message) {

        alert(
            "Balasan belum diisi!"
        );

        textarea.focus();

        return;
    }


    if (message.length > 500) {

        alert(
            "Balasan maksimal 500 karakter!"
        );

        return;
    }


    button.disabled =
        true;

    button.textContent =
        "Mengirim...";


    const { error } =
        await supabaseClient
            .from("comments")
            .insert([
                {
                    name: username,
                    message: message,
                    parent_id: parentId
                }
            ]);


    if (error) {

        console.error(
            "Reply Error:",
            error
        );

        alert(
            "Gagal mengirim balasan.\n\n" +
            error.message
        );


        button.disabled =
            false;

        button.textContent =
            "Balas";

        return;
    }


    openReplies.add(
        String(parentId)
    );


    await loadComments();

}


// ========================================
// ADD COMMENT
// ========================================

async function addComment() {

    const loginStatus =
        getLoginStatus();


    // Guest tidak boleh komentar
    if (
        loginStatus !== "user"
    ) {

        alert(
            "Guest tidak dapat mengirim komentar."
        );

        return;
    }


    // ADMIN TETAP BOLEH
    // karena admin memiliki loginStatus = user

    const username =
        getUsername();


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

        button.disabled =
            true;

        button.textContent =
            "Mengirim...";

    }


    const { error } =
        await supabaseClient
            .from("comments")
            .insert([
                {
                    name: username,
                    message: message,
                    parent_id: null
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

            button.disabled =
                false;

            button.textContent =
                "Kirim Komentar";

        }

        return;
    }


    messageInput.value =
        "";


    const charCount =
        document.getElementById(
            "charCount"
        );


    if (charCount) {

        charCount.textContent =
            "0 / 500";

    }


    if (button) {

        button.disabled =
            false;

        button.textContent =
            "Kirim Komentar";

    }


    await loadComments();

}


// ========================================
// DELETE COMMENT
// ========================================

async function deleteComment(id) {

    // HANYA ADMIN
    if (
        getRole() !== "admin"
    ) {

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
// ESCAPE HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

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
        () => {

            loadComments();

        }
    )
    .subscribe();


// ========================================
// CHARACTER COUNTER
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