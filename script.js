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
    return (
        localStorage.getItem("username") ||
        localStorage.getItem("name") ||
        "Guest"
    );
}

function getRole() {
    return (
        localStorage.getItem("role") ||
        "guest"
    ).toLowerCase();
}

function isLoggedIn() {
    const status = getLoginStatus();
    const role = getRole();

    return (
        status === "user" &&
        (
            role === "user" ||
            role === "admin"
        )
    );
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(date) {

    if (!date) return "";

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
        document.getElementById(
            "commentList"
        );

    if (!commentList) return;

    commentList.innerHTML =
        `<p class="empty">
            Memuat komentar...
        </p>`;


    const {
        data: comments,
        error
    } = await supabaseClient
        .from("comments")
        .select(`
            id,
            name,
            message,
            created_at,
            parent_id
        `)
        .order(
            "created_at",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Load comments error:",
            error
        );

        commentList.innerHTML =
            `<p class="empty">
                Gagal memuat komentar.<br>
                <small>${escapeHTML(error.message)}</small>
            </p>`;

        return;
    }


    if (!comments || comments.length === 0) {

        commentList.innerHTML =
            `<p class="empty">
                Belum ada komentar.
            </p>`;

        return;
    }


    // ====================================
    // PISAH PARENT & REPLY
    // ====================================

    const parents =
        comments.filter(
            comment =>
                !comment.parent_id
        );


    const replies =
        comments.filter(
            comment =>
                comment.parent_id
        );


    commentList.innerHTML = "";


    parents.forEach(parent => {

        const repliesForParent =
            replies.filter(
                reply =>
                    String(reply.parent_id) ===
                    String(parent.id)
            );

        renderComment(
            parent,
            repliesForParent,
            commentList
        );

    });


    // ====================================
    // JIKA ADA DATA REPLY YANG PARENT-NYA
    // SUDAH TIDAK ADA
    // ====================================

    const orphanReplies =
        replies.filter(reply => {

            return !parents.some(
                parent =>
                    String(parent.id) ===
                    String(reply.parent_id)
            );

        });


    orphanReplies.forEach(reply => {

        renderComment(
            reply,
            [],
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

    const box =
        document.createElement("article");

    box.className =
        "comment";


    // ====================================
    // HEADER
    // ====================================

    const header =
        document.createElement("div");

    header.className =
        "comment-header";


    const name =
        document.createElement("div");

    name.className =
        "comment-name";

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


    // ====================================
    // ACTIONS
    // ====================================

    const actions =
        document.createElement("div");

    actions.className =
        "comment-actions";


    // REPLY BUTTON

    const replyButton =
        document.createElement("button");

    replyButton.type =
        "button";

    replyButton.className =
        "reply-button";

    replyButton.textContent =
        "↩ Balas";


    replyButton.addEventListener(
        "click",
        () => {

            showReplyForm(
                comment.id,
                comment.name,
                box
            );

        }
    );


    actions.appendChild(
        replyButton
    );


    // DELETE ADMIN

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


    // ====================================
    // APPEND MAIN
    // ====================================

    box.appendChild(header);
    box.appendChild(message);
    box.appendChild(time);
    box.appendChild(actions);


    // ====================================
    // REPLY FORM HOLDER
    // ====================================

    const replyFormHolder =
        document.createElement("div");

    replyFormHolder.className =
        "reply-form-holder";

    box.appendChild(
        replyFormHolder
    );


    // ====================================
    // REPLIES
    // ====================================

    if (replies.length > 0) {

        const toggle =
            document.createElement("button");

        toggle.type =
            "button";

        toggle.className =
            "reply-toggle";

        toggle.textContent =
            `Lihat ${replies.length} balasan`;


        const repliesContainer =
            document.createElement("div");

        repliesContainer.className =
            "replies";

        repliesContainer.style.display =
            "none";


        replies.forEach(reply => {

            renderReply(
                reply,
                repliesContainer
            );

        });


        toggle.addEventListener(
            "click",
            () => {

                const hidden =
                    repliesContainer.style.display ===
                    "none";


                repliesContainer.style.display =
                    hidden
                        ? "flex"
                        : "none";


                toggle.textContent =
                    hidden
                        ? `Sembunyikan ${replies.length} balasan`
                        : `Lihat ${replies.length} balasan`;

            }
        );


        box.appendChild(toggle);

        box.appendChild(
            repliesContainer
        );

    }


    container.appendChild(box);

}


// ========================================
// RENDER REPLY
// ========================================

function renderReply(
    reply,
    container
) {

    const box =
        document.createElement("article");

    box.className =
        "comment reply";


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
        "membalas pesan";


    header.appendChild(name);
    header.appendChild(replyingTo);


    const message =
        document.createElement("div");

    message.className =
        "comment-message";

    message.textContent =
        reply.message;


    const time =
        document.createElement("div");

    time.className =
        "comment-time";

    time.textContent =
        formatDate(
            reply.created_at
        );


    const actions =
        document.createElement("div");

    actions.className =
        "comment-actions";


    // Reply to reply

    const replyButton =
        document.createElement("button");

    replyButton.type =
        "button";

    replyButton.className =
        "reply-button";

    replyButton.textContent =
        "↩ Balas";


    replyButton.addEventListener(
        "click",
        () => {

            showReplyForm(
                reply.id,
                reply.name,
                box
            );

        }
    );


    actions.appendChild(
        replyButton
    );


    // Admin delete

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


    box.appendChild(header);
    box.appendChild(message);
    box.appendChild(time);
    box.appendChild(actions);


    const replyHolder =
        document.createElement("div");

    replyHolder.className =
        "reply-form-holder";

    box.appendChild(
        replyHolder
    );


    container.appendChild(box);

}


// ========================================
// SHOW REPLY FORM
// ========================================

function showReplyForm(
    parentId,
    parentName,
    box
) {

    if (!isLoggedIn()) {

        alert(
            "Guest tidak dapat membalas pesan."
        );

        return;
    }


    const holder =
        box.querySelector(
            ".reply-form-holder"
        );


    if (!holder) return;


    // Jika sudah terbuka, tutup

    if (
        holder.querySelector(
            ".reply-form"
        )
    ) {

        holder.innerHTML = "";

        return;
    }


    holder.innerHTML = "";


    const form =
        document.createElement("div");

    form.className =
        "reply-form";


    const info =
        document.createElement("div");

    info.className =
        "reply-info";

    info.textContent =
        `Membalas ${parentName}`;


    const input =
        document.createElement("textarea");

    input.className =
        "reply-input";

    input.maxLength =
        500;

    input.placeholder =
        `Balas pesan ${parentName}...`;


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

            holder.innerHTML = "";

        }
    );


    const send =
        document.createElement("button");

    send.type =
        "button";

    send.className =
        "reply-send";

    send.textContent =
        "Kirim Balasan";


    send.addEventListener(
        "click",
        async () => {

            await addReply(
                parentId,
                input,
                send,
                holder
            );

        }
    );


    bottom.appendChild(cancel);
    bottom.appendChild(send);


    form.appendChild(info);
    form.appendChild(input);
    form.appendChild(bottom);


    holder.appendChild(form);


    input.focus();

}


// ========================================
// ADD REPLY
// ========================================

async function addReply(
    parentId,
    input,
    button,
    holder
) {

    if (!isLoggedIn()) {

        alert(
            "Guest tidak dapat membalas pesan."
        );

        return;
    }


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


    const username =
        getUsername();


    button.disabled =
        true;

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
                parent_id: parentId
            }
        ]);


    if (error) {

        console.error(
            "Reply error:",
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


    holder.innerHTML = "";

    await loadComments();

}


// ========================================
// ADD COMMENT
// ========================================

async function addComment() {

    if (!isLoggedIn()) {

        alert(
            "Guest tidak dapat mengirim komentar."
        );

        return;
    }


    const input =
        document.getElementById(
            "message"
        );


    const button =
        document.getElementById(
            "sendCommentButton"
        );


    if (!input || !button) return;


    const message =
        input.value.trim();


    if (!message) {

        alert(
            "Komentar belum diisi!"
        );

        input.focus();

        return;
    }


    if (message.length > 500) {

        alert(
            "Komentar maksimal 500 karakter!"
        );

        return;
    }


    button.disabled =
        true;

    button.textContent =
        "Mengirim...";


    const {
        error
    } = await supabaseClient
        .from("comments")
        .insert([
            {
                name: getUsername(),
                message: message,
                parent_id: null
            }
        ]);


    if (error) {

        console.error(
            "Insert error:",
            error
        );

        alert(
            "Gagal mengirim komentar.\n\n" +
            error.message
        );

        button.disabled =
            false;

        button.textContent =
            "Kirim Komentar";

        return;
    }


    input.value = "";

    updateCharCount();


    button.disabled =
        false;

    button.textContent =
        "Kirim Komentar";


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
            "Yakin ingin menghapus komentar ini?\n\n" +
            "Jika komentar memiliki balasan, balasannya juga akan dihapus."
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
            "Delete error:",
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
// CHARACTER COUNT
// ========================================

function updateCharCount() {

    const input =
        document.getElementById(
            "message"
        );

    const counter =
        document.getElementById(
            "charCount"
        );


    if (
        input &&
        counter
    ) {

        counter.textContent =
            `${input.value.length} / 500`;

    }

}


// ========================================
// LOGIN UI
// ========================================

function setupLoginUI() {

    const username =
        getUsername();

    const role =
        getRole();

    const status =
        getLoginStatus();


    const welcome =
        document.getElementById(
            "welcomeUser"
        );


    const input =
        document.getElementById(
            "message"
        );


    const button =
        document.getElementById(
            "sendCommentButton"
        );


    const notice =
        document.getElementById(
            "guestNotice"
        );


    if (welcome) {

        welcome.textContent =
            `Login sebagai ${username}`;

    }


    if (
        status === "guest" ||
        role === "guest" ||
        !isLoggedIn()
    ) {

        if (input) {

            input.disabled =
                true;

            input.placeholder =
                "Guest tidak dapat mengirim komentar";

        }


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "🔒 Login untuk Berkomentar";

        }


        if (notice) {

            notice.style.display =
                "block";

        }

    } else {

        if (input) {

            input.disabled =
                false;

            input.placeholder =
                "Tulis komentar...";

        }


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Kirim Komentar";

        }


        if (notice) {

            notice.style.display =
                "none";

        }

    }

}


// ========================================
// LOGOUT
// ========================================

function logout() {

    localStorage.removeItem(
        "loginStatus"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "name"
    );

    localStorage.removeItem(
        "role"
    );

    sessionStorage.clear();

    window.location.href =
        "login.html";

}


// ========================================
// EVENTS
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupLoginUI();

        updateCharCount();

        const input =
            document.getElementById(
                "message"
            );


        if (input) {

            input.addEventListener(
                "input",
                updateCharCount
            );

        }


        const sendButton =
            document.getElementById(
                "sendCommentButton"
            );


        if (sendButton) {

            sendButton.addEventListener(
                "click",
                addComment
            );

        }


        const refreshButton =
            document.getElementById(
                "refreshButton"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                loadComments
            );

        }


        loadComments();

    }
);


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