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

let commentsCache = [];


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
            .order("created_at", {
                ascending: true
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

    commentsCache = data || [];

    renderComments();

}


// ========================================
// RENDER COMMENTS
// ========================================

function renderComments() {

    const commentList =
        document.getElementById("commentList");

    if (!commentList) return;

    const comments =
        commentsCache;

    if (
        !comments ||
        comments.length === 0
    ) {

        commentList.innerHTML =
            '<p class="empty">Belum ada komentar.</p>';

        return;
    }

    commentList.innerHTML = "";

    // Komentar utama saja
    const mainComments =
        comments.filter(
            comment =>
                comment.parent_id === null ||
                comment.parent_id === undefined
        );

    // Terbaru di atas
    mainComments.sort(
        (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
    );

    mainComments.forEach(comment => {

        const box =
            createCommentElement(
                comment
            );

        commentList.appendChild(box);

    });

}


// ========================================
// CREATE COMMENT ELEMENT
// ========================================

function createCommentElement(comment) {

    const box =
        document.createElement("article");

    box.className = "comment";


    // NAME

    const name =
        document.createElement("div");

    name.className =
        "comment-name";

    name.textContent =
        comment.name;


    // MESSAGE

    const message =
        document.createElement("div");

    message.className =
        "comment-message";

    message.textContent =
        comment.message;


    // TIME

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


    // ====================================
    // REPLY COUNT
    // ====================================

    const replies =
        commentsCache.filter(
            reply =>
                Number(reply.parent_id) ===
                Number(comment.id)
        );

    const replyCount =
        replies.length;


    const replyButton =
        document.createElement("button");

    replyButton.type =
        "button";

    replyButton.className =
        "reply-toggle";

    replyButton.textContent =
        replyCount > 0
            ? `↩️ Lihat ${replyCount} balasan`
            : "↩️ Balas";


    replyButton.addEventListener(
        "click",
        () => {

            if (replyCount > 0) {

                toggleReplies(
                    comment.id,
                    replyButton
                );

            } else {

                showReplyForm(
                    comment.id,
                    comment.name,
                    box
                );

            }

        }
    );


    box.appendChild(
        replyButton
    );


    // ====================================
    // ADMIN DELETE
    // ====================================

    const role =
        sessionStorage.getItem("role");

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
            () => {
                deleteComment(
                    comment.id
                );
            }
        );

        box.appendChild(
            deleteButton
        );
    }


    return box;

}


// ========================================
// SHOW / HIDE REPLIES
// ========================================

function toggleReplies(
    commentId,
    button
) {

    const existing =
        document.querySelector(
            `.replies[data-parent-id="${commentId}"]`
        );

    if (existing) {

        existing.remove();

        button.textContent =
            `↩️ Lihat ${
                getReplyCount(commentId)
            } balasan`;

        return;
    }


    const replies =
        commentsCache.filter(
            reply =>
                Number(reply.parent_id) ===
                Number(commentId)
        );


    const container =
        document.createElement("div");

    container.className =
        "replies";

    container.dataset.parentId =
        commentId;


    replies.sort(
        (a, b) =>
            new Date(a.created_at) -
            new Date(b.created_at)
    );


    replies.forEach(reply => {

        const replyBox =
            createReplyElement(
                reply
            );

        container.appendChild(
            replyBox
        );

    });


    // Cari komentar utama
    const allComments =
        document.querySelectorAll(
            ".comment"
        );

    for (const commentBox of allComments) {

        const buttons =
            commentBox.querySelectorAll(
                ".reply-toggle"
            );

        if (
            buttons.length &&
            buttons[0] === button
        ) {

            commentBox.appendChild(
                container
            );

            break;
        }

    }


    button.textContent =
        "↩️ Sembunyikan balasan";

}


// ========================================
// CREATE REPLY
// ========================================

function createReplyElement(reply) {

    const box =
        document.createElement("div");

    box.className =
        "reply";


    const replyingTo =
        document.createElement("div");

    replyingTo.className =
        "reply-to";

    replyingTo.textContent =
        `Membalas ${getUserDisplayName(
            reply.parent_id
        )}`;


    const name =
        document.createElement("div");

    name.className =
        "reply-name";

    name.textContent =
        reply.name;


    const message =
        document.createElement("div");

    message.className =
        "reply-message";

    message.textContent =
        reply.message;


    const time =
        document.createElement("div");

    time.className =
        "reply-time";

    time.textContent =
        formatDate(
            reply.created_at
        );


    box.appendChild(
        replyingTo
    );

    box.appendChild(
        name
    );

    box.appendChild(
        message
    );

    box.appendChild(
        time
    );


    // Admin delete
    const role =
        sessionStorage.getItem("role");

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
            () => {
                deleteComment(
                    reply.id
                );
            }
        );

        box.appendChild(
            deleteButton
        );
    }


    return box;

}


// ========================================
// REPLY FORM
// ========================================

function showReplyForm(
    parentId,
    parentName,
    parentBox
) {

    // Guest tidak bisa membalas
    if (
        sessionStorage.getItem(
            "loginStatus"
        ) !== "user"
    ) {

        alert(
            "Guest tidak dapat membalas komentar."
        );

        return;
    }


    // Jangan buat form dua kali
    const existing =
        parentBox.querySelector(
            ".reply-form"
        );

    if (existing) {

        existing.remove();

        return;
    }


    const form =
        document.createElement("div");

    form.className =
        "reply-form";


    const info =
        document.createElement("div");

    info.className =
        "reply-form-info";

    info.textContent =
        `Membalas ${parentName}`;


    const textarea =
        document.createElement("textarea");

    textarea.maxLength =
        500;

    textarea.placeholder =
        `Balas ${parentName}...`;


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


    cancel.onclick =
        () => {
            form.remove();
        };


    const send =
        document.createElement("button");

    send.type =
        "button";

    send.className =
        "reply-send";

    send.textContent =
        "Kirim Balasan";


    send.onclick =
        async () => {

            await addReply(
                parentId,
                textarea,
                send,
                form
            );

        };


    bottom.appendChild(
        cancel
    );

    bottom.appendChild(
        send
    );


    form.appendChild(
        info
    );

    form.appendChild(
        textarea
    );

    form.appendChild(
        bottom
    );


    parentBox.appendChild(
        form
    );


    textarea.focus();

}


// ========================================
// ADD REPLY
// ========================================

async function addReply(
    parentId,
    textarea,
    button,
    form
) {

    const loginStatus =
        sessionStorage.getItem(
            "loginStatus"
        );


    if (loginStatus !== "user") {

        alert(
            "Guest tidak dapat membalas komentar."
        );

        return;
    }


    const username =
        sessionStorage.getItem(
            "username"
        );


    const message =
        textarea.value.trim();


    if (!username) {

        alert(
            "Sesi login tidak ditemukan."
        );

        return;
    }


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
            "Kirim Balasan";

        return;
    }


    form.remove();

    await loadComments();

}


// ========================================
// GET REPLY COUNT
// ========================================

function getReplyCount(
    commentId
) {

    return commentsCache.filter(
        reply =>
            Number(reply.parent_id) ===
            Number(commentId)
    ).length;

}


// ========================================
// GET USER NAME
// ========================================

function getUserDisplayName(
    parentId
) {

    const parent =
        commentsCache.find(
            comment =>
                Number(comment.id) ===
                Number(parentId)
        );


    if (parent) {
        return parent.name;
    }


    return "pengguna";

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
// ADD MAIN COMMENT
// ========================================

async function addComment() {

    const loginStatus =
        sessionStorage.getItem(
            "loginStatus"
        );


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


    // Hapus balasan terlebih dahulu
    const { error: replyError } =
        await supabaseClient
            .from("comments")
            .delete()
            .eq(
                "parent_id",
                id
            );


    if (replyError) {

        console.error(
            "Reply Delete Error:",
            replyError
        );

        alert(
            "Gagal menghapus balasan.\n\n" +
            replyError.message
        );

        return;
    }


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
        () => {

            loadComments();

        }
    )
    .subscribe();


// ========================================
// COUNTER
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