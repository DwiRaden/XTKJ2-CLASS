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

    return localStorage.getItem(
        "loginStatus"
    );

}


function getUsername() {

    return (
        localStorage.getItem("username") ||
        "Guest"
    );

}


function getRole() {

    return (
        localStorage.getItem("role") ||
        "guest"
    );

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;

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
        data,
        error
    } = await supabaseClient
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
                Gagal memuat komentar.<br>
                ${escapeHTML(error.message)}
            </p>`;

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        commentList.innerHTML =
            `<p class="empty">
                Belum ada komentar.
            </p>`;

        return;
    }


    const comments =
        data.filter(
            comment =>
                !comment.parent_id
        );


    const replies =
        data.filter(
            comment =>
                comment.parent_id
        );


    commentList.innerHTML = "";


    comments
        .sort(
            (a, b) =>
                new Date(b.created_at) -
                new Date(a.created_at)
        )
        .forEach(
            comment => {

                renderComment(
                    comment,
                    replies,
                    commentList
                );

            }
        );

}


// ========================================
// RENDER COMMENT
// ========================================

function renderComment(
    comment,
    replies,
    container
) {

    const role =
        getRole();

    const currentUser =
        getUsername();


    const box =
        document.createElement(
            "article"
        );

    box.className =
        "comment";


    // ================================
    // NAME
    // ================================

    const name =
        document.createElement(
            "div"
        );

    name.className =
        "comment-name";

    name.textContent =
        comment.name;


    // ================================
    // MESSAGE
    // ================================

    const message =
        document.createElement(
            "div"
        );

    message.className =
        "comment-message";

    message.textContent =
        comment.message;


    // ================================
    // TIME
    // ================================

    const time =
        document.createElement(
            "div"
        );

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
    // ACTIONS
    // ================================

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "comment-actions";


    // REPLY BUTTON

    const replyButton =
        document.createElement(
            "button"
        );

    replyButton.type =
        "button";

    replyButton.className =
        "reply-button";

    replyButton.textContent =
        "↩️ Balas";


    replyButton.addEventListener(
        "click",
        () => {

            showReplyForm(
                comment,
                box
            );

        }
    );


    actions.appendChild(
        replyButton
    );


    // ADMIN DELETE

    if (
        role === "admin"
    ) {

        const deleteButton =
            document.createElement(
                "button"
            );

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


    box.appendChild(
        actions
    );


    // ================================
    // REPLIES
    // ================================

    const commentReplies =
        replies.filter(
            reply =>
                String(reply.parent_id) ===
                String(comment.id)
        );


    if (
        commentReplies.length > 0
    ) {

        const toggle =
            document.createElement(
                "button"
            );

        toggle.type =
            "button";

        toggle.className =
            "reply-toggle";

        toggle.textContent =
            `Lihat ${commentReplies.length} balasan`;


        const repliesContainer =
            document.createElement(
                "div"
            );

        repliesContainer.className =
            "replies";

        repliesContainer.style.display =
            "none";


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
                        ? `Sembunyikan ${commentReplies.length} balasan`
                        : `Lihat ${commentReplies.length} balasan`;

            }
        );


        box.appendChild(
            toggle
        );


        commentReplies
            .sort(
                (a, b) =>
                    new Date(a.created_at) -
                    new Date(b.created_at)
            )
            .forEach(
                reply => {

                    renderReply(
                        reply,
                        commentReplies,
                        repliesContainer
                    );

                }
            );


        box.appendChild(
            repliesContainer
        );

    }


    container.appendChild(
        box
    );

}


// ========================================
// RENDER REPLY
// ========================================

function renderReply(
    reply,
    allReplies,
    container
) {

    const role =
        getRole();


    const replyBox =
        document.createElement(
            "article"
        );

    replyBox.className =
        "comment reply";


    // ================================
    // HEADER
    // ================================

    const header =
        document.createElement(
            "div"
        );

    header.className =
        "reply-header";


    const name =
        document.createElement(
            "span"
        );

    name.className =
        "comment-name";

    name.textContent =
        reply.name;


    const replyingTo =
        document.createElement(
            "span"
        );

    replyingTo.className =
        "replying-to";

    replyingTo.textContent =
        `membalas @${getParentName(
            reply.parent_id,
            allReplies
        )}`;


    header.appendChild(name);

    header.appendChild(
        replyingTo
    );


    // ================================
    // MESSAGE
    // ================================

    const message =
        document.createElement(
            "div"
        );

    message.className =
        "comment-message";

    message.textContent =
        reply.message;


    // ================================
    // TIME
    // ================================

    const time =
        document.createElement(
            "div"
        );

    time.className =
        "comment-time";

    time.textContent =
        formatDate(
            reply.created_at
        );


    replyBox.appendChild(
        header
    );

    replyBox.appendChild(
        message
    );

    replyBox.appendChild(
        time
    );


    // ================================
    // ACTIONS
    // ================================

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "comment-actions";


    // BALAS LAGI

    const replyButton =
        document.createElement(
            "button"
        );

    replyButton.type =
        "button";

    replyButton.className =
        "reply-button";

    replyButton.textContent =
        "↩️ Balas";


    replyButton.addEventListener(
        "click",
        () => {

            showReplyForm(
                reply,
                replyBox
            );

        }
    );


    actions.appendChild(
        replyButton
    );


    // ADMIN DELETE

    if (
        role === "admin"
    ) {

        const deleteButton =
            document.createElement(
                "button"
            );

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
// GET PARENT NAME
// ========================================

function getParentName(
    parentId,
    replies
) {

    const parent =
        replies.find(
            item =>
                String(item.id) ===
                String(parentId)
        );


    if (parent) {

        return parent.name;

    }


    return "pengguna";

}


// ========================================
// REPLY FORM
// ========================================

function showReplyForm(
    target,
    box
) {

    // Jangan buat dua form
    if (
        box.querySelector(
            ".reply-form"
        )
    ) {

        return;

    }


    const loginStatus =
        getLoginStatus();

    const role =
        getRole();

    const username =
        getUsername();


    if (
        loginStatus !== "user" ||
        !username ||
        role === "guest"
    ) {

        alert(
            "Guest tidak dapat membalas komentar."
        );

        return;
    }


    const form =
        document.createElement(
            "div"
        );

    form.className =
        "reply-form";


    const input =
        document.createElement(
            "textarea"
        );

    input.className =
        "reply-input";

    input.maxLength =
        500;

    input.placeholder =
        `Membalas @${target.name}...`;


    const bottom =
        document.createElement(
            "div"
        );

    bottom.className =
        "reply-form-bottom";


    const cancel =
        document.createElement(
            "button"
        );

    cancel.type =
        "button";

    cancel.className =
        "reply-cancel";

    cancel.textContent =
        "Batal";


    const send =
        document.createElement(
            "button"
        );

    send.type =
        "button";

    send.className =
        "reply-send";

    send.textContent =
        "Balas";


    cancel.addEventListener(
        "click",
        () => {

            form.remove();

        }
    );


    send.addEventListener(
        "click",
        async () => {

            const text =
                input.value.trim();


            if (!text) {

                alert(
                    "Balasan belum diisi!"
                );

                input.focus();

                return;
            }


            if (
                text.length > 500
            ) {

                alert(
                    "Balasan maksimal 500 karakter!"
                );

                return;
            }


            send.disabled =
                true;

            send.textContent =
                "Mengirim...";


            const {
                error
            } =
                await supabaseClient
                    .from("comments")
                    .insert([
                        {
                            name: username,
                            message: text,
                            parent_id: target.id
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


                send.disabled =
                    false;

                send.textContent =
                    "Balas";

                return;
            }


            form.remove();

            await loadComments();

        }
    );


    bottom.appendChild(
        cancel
    );

    bottom.appendChild(
        send
    );


    form.appendChild(
        input
    );

    form.appendChild(
        bottom
    );


    box.appendChild(
        form
    );


    input.focus();

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(
    date
) {

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


    if (
        message.length > 500
    ) {

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


    const {
        error
    } =
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
            "Insert Error:",
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

async function deleteComment(
    id
) {

    const role =
        getRole();


    if (
        role !== "admin"
    ) {

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
    } =
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
// GUEST / USER UI
// ========================================

function setupLoginUI() {

    const username =
        getUsername();

    const role =
        getRole();

    const loginStatus =
        getLoginStatus();


    const welcomeUser =
        document.getElementById(
            "welcomeUser"
        );


    if (welcomeUser) {

        welcomeUser.textContent =
            `Login sebagai ${username}`;

    }


    const message =
        document.getElementById(
            "message"
        );

    const sendButton =
        document.getElementById(
            "sendCommentButton"
        );

    const guestNotice =
        document.getElementById(
            "guestNotice"
        );


    if (
        loginStatus === "guest" ||
        role === "guest"
    ) {

        message.disabled =
            true;

        sendButton.disabled =
            true;

        message.placeholder =
            "Guest tidak dapat mengirim komentar";

        sendButton.textContent =
            "🔒 Login untuk Berkomentar";

        guestNotice.style.display =
            "block";

    } else {

        message.disabled =
            false;

        sendButton.disabled =
            false;

        message.placeholder =
            "Tulis komentar...";

        sendButton.textContent =
            "Kirim Komentar";

        guestNotice.style.display =
            "none";

    }

}


// ========================================
// SPOTIFY
// ========================================

function setupSpotify() {

    const popup =
        document.getElementById(
            "spotifyPopup"
        );

    const player =
        document.getElementById(
            "spotifyPlayer"
        );

    const yesButton =
        document.getElementById(
            "spotifyYes"
        );

    const noButton =
        document.getElementById(
            "spotifyNo"
        );

    const closeButton =
        document.getElementById(
            "closeSpotify"
        );


    if (
        !popup ||
        !player
    ) return;


    const loginStatus =
        getLoginStatus();


    // Hanya user yang melihat popup
    if (
        loginStatus === "user"
    ) {

        popup.style.display =
            "flex";

    } else {

        popup.style.display =
            "none";

    }


    yesButton.addEventListener(
        "click",
        function () {

            popup.style.display =
                "none";

            player.classList.add(
                "show"
            );

        }
    );


    noButton.addEventListener(
        "click",
        function () {

            popup.style.display =
                "none";

        }
    );


    closeButton.addEventListener(
        "click",
        function () {

            player.classList.remove(
                "show"
            );

        }
    );

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
        function () {

            loadComments();

        }
    )
    .subscribe();


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const messageInput =
            document.getElementById(
                "message"
            );

        const charCount =
            document.getElementById(
                "charCount"
            );

        const sendButton =
            document.getElementById(
                "sendCommentButton"
            );

        const refreshButton =
            document.getElementById(
                "refreshButton"
            );


        if (
            messageInput &&
            charCount
        ) {

            messageInput.addEventListener(
                "input",
                function () {

                    charCount.textContent =
                        `${messageInput.value.length} / 500`;

                }
            );

        }


        if (sendButton) {

            sendButton.addEventListener(
                "click",
                addComment
            );

        }


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                loadComments
            );

        }


        setupLoginUI();

        setupSpotify();

        loadComments();

    }
);