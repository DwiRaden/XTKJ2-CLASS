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
// LOGIN
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

function canInteract() {

    return (
        getLoginStatus() === "user" &&
        getUsername() &&
        getRole() !== "guest"
    );
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


    const {
        data,
        error
    } = await supabaseClient
        .from("comments")
        .select(
            "id, name, message, created_at, reply_to"
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
                Gagal memuat komentar.<br>
                ${error.message}
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


    // ====================================
    // PISAH KOMENTAR UTAMA & BALASAN
    // ====================================

    const mainComments =
        data.filter(
            comment =>
                comment.reply_to === null ||
                comment.reply_to === undefined
        );


    const replies =
        data.filter(
            comment =>
                comment.reply_to !== null &&
                comment.reply_to !== undefined
        );


    commentList.innerHTML = "";


    // ====================================
    // TAMPILKAN KOMENTAR TERBARU DULU
    // ====================================

    mainComments.reverse();


    mainComments.forEach(comment => {

        const commentReplies =
            replies.filter(
                reply =>
                    String(reply.reply_to) ===
                    String(comment.id)
            );


        renderComment(
            comment,
            commentReplies,
            commentList
        );

    });


    // ====================================
    // BALASAN YANG PARENT-NYA SUDAH DIHAPUS
    // ====================================

    const orphanReplies =
        replies.filter(reply => {

            return !mainComments.some(
                comment =>
                    String(comment.id) ===
                    String(reply.reply_to)
            );

        });


    if (orphanReplies.length > 0) {

        console.warn(
            "Ditemukan balasan tanpa komentar induk:",
            orphanReplies
        );

    }

}


// ========================================
// RENDER KOMENTAR
// ========================================

function renderComment(
    comment,
    replies,
    container
) {

    const box =
        document.createElement("article");

    box.className = "comment";


    // ====================================
    // NAMA
    // ====================================

    const name =
        document.createElement("div");

    name.className =
        "comment-name";

    name.textContent =
        comment.name;


    // ====================================
    // PESAN
    // ====================================

    const message =
        document.createElement("div");

    message.className =
        "comment-message";

    message.textContent =
        comment.message;


    // ====================================
    // WAKTU
    // ====================================

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
    // ACTIONS
    // ====================================

    const actions =
        document.createElement("div");

    actions.className =
        "comment-actions";


    // ====================================
    // TOMBOL BALAS
    // ====================================

    if (canInteract()) {

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
            function() {

                showReplyForm(
                    box,
                    comment
                );

            }
        );


        actions.appendChild(
            replyButton
        );

    }


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
            function() {

                deleteComment(
                    comment.id
                );

            }
        );


        actions.appendChild(
            deleteButton
        );

    }


    if (actions.children.length > 0) {

        box.appendChild(actions);

    }


    // ====================================
    // BALASAN
    // ====================================

    if (replies.length > 0) {

        const replyToggle =
            document.createElement("button");

        replyToggle.type =
            "button";

        replyToggle.className =
            "reply-toggle";

        replyToggle.textContent =
            `Lihat ${replies.length} balasan`;


        const repliesContainer =
            document.createElement("div");

        repliesContainer.className =
            "replies";

        repliesContainer.style.display =
            "none";


        // =================================
        // RENDER BALASAN
        // =================================

        replies.forEach(reply => {

            renderReply(
                reply,
                comment,
                repliesContainer
            );

        });


        replyToggle.addEventListener(
            "click",
            function() {

                const hidden =
                    repliesContainer.style.display ===
                    "none";


                if (hidden) {

                    repliesContainer.style.display =
                        "flex";

                    replyToggle.textContent =
                        `Sembunyikan ${replies.length} balasan`;

                } else {

                    repliesContainer.style.display =
                        "none";

                    replyToggle.textContent =
                        `Lihat ${replies.length} balasan`;

                }

            }
        );


        box.appendChild(
            replyToggle
        );

        box.appendChild(
            repliesContainer
        );

    }


    container.appendChild(box);

}


// ========================================
// RENDER BALASAN
// ========================================

function renderReply(
    reply,
    parentComment,
    container
) {

    const box =
        document.createElement("article");

    box.className =
        "comment reply";


    // ====================================
    // HEADER
    // ====================================

    const header =
        document.createElement("div");

    header.className =
        "reply-header";


    const name =
        document.createElement("span");

    name.className =
        "comment-name";

    name.textContent =
        reply.name;


    const replyingTo =
        document.createElement("span");

    replyingTo.className =
        "replying-to";

    replyingTo.textContent =
        `membalas @${parentComment.name}`;


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


    box.appendChild(header);
    box.appendChild(message);
    box.appendChild(time);


    // ====================================
    // ADMIN DELETE BALASAN
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
            function() {

                deleteComment(
                    reply.id
                );

            }
        );


        box.appendChild(
            deleteButton
        );

    }


    container.appendChild(box);

}


// ========================================
// FORM BALAS
// ========================================

function showReplyForm(
    commentBox,
    comment
) {

    if (!canInteract()) {

        alert(
            "Guest tidak dapat membalas."
        );

        return;
    }


    // Jangan buat form kedua
    if (
        commentBox.querySelector(
            ".reply-form"
        )
    ) {

        return;

    }


    const form =
        document.createElement("div");

    form.className =
        "reply-form";


    const input =
        document.createElement("textarea");

    input.className =
        "reply-input";

    input.maxLength = 500;

    input.placeholder =
        `Balas @${comment.name}...`;


    const bottom =
        document.createElement("div");

    bottom.className =
        "reply-form-bottom";


    const cancelButton =
        document.createElement("button");

    cancelButton.type =
        "button";

    cancelButton.className =
        "reply-cancel";

    cancelButton.textContent =
        "Batal";


    const sendButton =
        document.createElement("button");

    sendButton.type =
        "button";

    sendButton.className =
        "reply-send";

    sendButton.textContent =
        "Kirim Balasan";


    cancelButton.addEventListener(
        "click",
        function() {

            form.remove();

        }
    );


    sendButton.addEventListener(
        "click",
        async function() {

            await addReply(
                comment.id,
                input,
                sendButton,
                form
            );

        }
    );


    bottom.appendChild(
        cancelButton
    );

    bottom.appendChild(
        sendButton
    );


    form.appendChild(input);

    form.appendChild(bottom);


    commentBox.appendChild(form);

    input.focus();

}


// ========================================
// ADD REPLY
// ========================================

async function addReply(
    parentId,
    input,
    button,
    form
) {

    if (!canInteract()) {

        alert(
            "Guest tidak dapat membalas."
        );

        return;
    }


    const username =
        getUsername();


    const message =
        input.value.trim();


    if (!message) {

        alert(
            "Balasan belum diisi!"
        );

        input.focus();

        return;
    }


    if (message.length > 500) {

        alert(
            "Balasan maksimal 500 karakter!"
        );

        return;
    }


    button.disabled = true;

    button.textContent =
        "Mengirim...";


    const {
        error
    } = await supabaseClient
        .from("comments")
        .insert([
            {
                name: username,
                message: message,
                reply_to: parentId
            }
        ]);


    if (error) {

        console.error(
            "Reply Insert Error:",
            error
        );

        alert(
            "Gagal mengirim balasan.\n\n" +
            error.message
        );

        button.disabled = false;

        button.textContent =
            "Kirim Balasan";

        return;
    }


    form.remove();

    await loadComments();

}


// ========================================
// ADD COMMENT
// ========================================

async function addComment() {

    if (!canInteract()) {

        alert(
            "Guest tidak dapat mengirim komentar."
        );

        return;
    }


    const username =
        getUsername();


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


    const {
        error
    } = await supabaseClient
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
// DELETE
// ========================================

async function deleteComment(id) {

    if (getRole() !== "admin") {

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


    const {
        error
    } = await supabaseClient
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