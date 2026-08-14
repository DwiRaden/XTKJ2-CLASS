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

    return localStorage.getItem(
        "loginStatus"
    );

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
    );

}


// ========================================
// USER INFO
// ========================================

const loginStatus =
    getLoginStatus();

const username =
    getUsername();

const role =
    getRole();


const welcomeUser =
    document.getElementById(
        "welcomeUser"
    );


if (welcomeUser) {

    welcomeUser.textContent =
        `Login sebagai ${username}`;

}


// ========================================
// ELEMENT
// ========================================

const messageInput =
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


const charCount =
    document.getElementById(
        "charCount"
    );


// ========================================
// CEK USER
// ========================================

const canComment =
    loginStatus === "user" &&
    username &&
    role !== "guest";


// ========================================
// GUEST MODE
// ========================================

if (!canComment) {

    if (messageInput) {

        messageInput.disabled = true;

        messageInput.placeholder =
            "Guest tidak dapat mengirim komentar";

    }


    if (sendButton) {

        sendButton.disabled = true;

        sendButton.textContent =
            "🔒 Login untuk Berkomentar";

    }


    if (guestNotice) {

        guestNotice.style.display =
            "block";

    }

}


// ========================================
// USER / ADMIN MODE
// ========================================

else {

    if (messageInput) {

        messageInput.disabled = false;

        messageInput.placeholder =
            "Tulis komentar...";

    }


    if (sendButton) {

        sendButton.disabled = false;

        sendButton.textContent =
            "Kirim Komentar";

    }


    if (guestNotice) {

        guestNotice.style.display =
            "none";

    }

}


// ========================================
// CHARACTER COUNTER
// ========================================

if (messageInput) {

    messageInput.addEventListener(
        "input",
        function () {

            if (charCount) {

                charCount.textContent =
                    `${messageInput.value.length} / 500`;

            }

        }
    );

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


    const { data, error } =
        await supabaseClient
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
                ${escapeHTML(error.message)}
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
    // PISAHKAN KOMENTAR UTAMA & BALASAN
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
    // BUAT SETIAP KOMENTAR
    // ====================================

    mainComments
        .slice()
        .reverse()
        .forEach(
            comment => {

                const repliesForComment =
                    replies.filter(
                        reply =>
                            String(reply.reply_to) ===
                            String(comment.id)
                    );


                const element =
                    createCommentElement(
                        comment,
                        repliesForComment
                    );


                commentList.appendChild(
                    element
                );

            }
        );

}


// ========================================
// CREATE COMMENT
// ========================================

function createCommentElement(
    comment,
    replies
) {

    const box =
        document.createElement(
            "article"
        );


    box.className =
        "comment";


    // ====================================
    // HEADER
    // ====================================

    const header =
        document.createElement(
            "div"
        );


    header.className =
        "comment-header";


    const name =
        document.createElement(
            "div"
        );


    name.className =
        "comment-name";


    name.textContent =
        comment.name;


    header.appendChild(
        name
    );


    // ====================================
    // MESSAGE
    // ====================================

    const text =
        document.createElement(
            "div"
        );


    text.className =
        "comment-message";


    text.textContent =
        comment.message;


    // ====================================
    // TIME
    // ====================================

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


    // ====================================
    // ACTIONS
    // ====================================

    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "comment-actions";


    // ====================================
    // REPLY BUTTON
    // ====================================

    if (canComment) {

        const replyButton =
            document.createElement(
                "button"
            );


        replyButton.type =
            "button";


        replyButton.className =
            "reply-button";


        replyButton.textContent =
            "↩ Balas";


        replyButton.addEventListener(
            "click",
            function () {

                toggleReplyForm(
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

    if (role === "admin") {

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
            function () {

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
    // REPLY LIST
    // ====================================

    let repliesContainer = null;


    if (replies.length > 0) {

        const replyToggle =
            document.createElement(
                "button"
            );


        replyToggle.type =
            "button";


        replyToggle.className =
            "reply-toggle";


        replyToggle.textContent =
            `Lihat ${replies.length} balasan`;


        repliesContainer =
            document.createElement(
                "div"
            );


        repliesContainer.className =
            "replies";


        repliesContainer.style.display =
            "none";


        replies
            .slice()
            .sort(
                (a, b) =>
                    new Date(a.created_at) -
                    new Date(b.created_at)
            )
            .forEach(
                reply => {

                    const replyElement =
                        createReplyElement(
                            reply,
                            comment.name
                        );


                    repliesContainer.appendChild(
                        replyElement
                    );

                }
            );


        replyToggle.addEventListener(
            "click",
            function () {

                const hidden =
                    repliesContainer.style.display ===
                    "none";


                repliesContainer.style.display =
                    hidden
                        ? "flex"
                        : "none";


                replyToggle.textContent =
                    hidden
                        ? "Sembunyikan balasan"
                        : `Lihat ${replies.length} balasan`;

            }
        );


        actions.appendChild(
            replyToggle
        );

    }


    // ====================================
    // APPEND
    // ====================================

    box.appendChild(
        header
    );

    box.appendChild(
        text
    );

    box.appendChild(
        time
    );

    box.appendChild(
        actions
    );


    if (repliesContainer) {

        box.appendChild(
            repliesContainer
        );

    }


    return box;

}


// ========================================
// CREATE REPLY
// ========================================

function createReplyElement(
    reply,
    parentName
) {

    const box =
        document.createElement(
            "div"
        );


    box.className =
        "comment reply";


    // ====================================
    // HEADER
    // ====================================

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
        `membalas @${parentName}`;


    header.appendChild(
        name
    );


    header.appendChild(
        replyingTo
    );


    // ====================================
    // MESSAGE
    // ====================================

    const text =
        document.createElement(
            "div"
        );


    text.className =
        "comment-message";


    text.textContent =
        reply.message;


    // ====================================
    // TIME
    // ====================================

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


    box.appendChild(
        header
    );

    box.appendChild(
        text
    );

    box.appendChild(
        time
    );


    // ====================================
    // ADMIN DELETE
    // ====================================

    if (role === "admin") {

        const actions =
            document.createElement(
                "div"
            );


        actions.className =
            "comment-actions";


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
            function () {

                deleteComment(
                    reply.id
                );

            }
        );


        actions.appendChild(
            deleteButton
        );


        box.appendChild(
            actions
        );

    }


    return box;

}


// ========================================
// REPLY FORM
// ========================================

function toggleReplyForm(
    commentBox,
    comment
) {

    const existing =
        commentBox.querySelector(
            ".reply-form"
        );


    if (existing) {

        existing.remove();

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
        `Balas @${comment.name}...`;


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
        function () {

            form.remove();

        }
    );


    send.addEventListener(
        "click",
        async function () {

            const replyText =
                input.value.trim();


            if (!replyText) {

                alert(
                    "Balasan belum diisi!"
                );

                input.focus();

                return;

            }


            if (replyText.length > 500) {

                alert(
                    "Balasan maksimal 500 karakter!"
                );

                return;

            }


            send.disabled =
                true;


            send.textContent =
                "Mengirim...";


            const { error } =
                await supabaseClient
                    .from("comments")
                    .insert([
                        {
                            name:
                                username,

                            message:
                                replyText,

                            reply_to:
                                comment.id
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


    commentBox.appendChild(
        form
    );


    input.focus();

}


// ========================================
// ADD COMMENT
// ========================================

async function addComment() {

    if (!canComment) {

        alert(
            "Guest tidak dapat mengirim komentar."
        );

        return;

    }


    const text =
        messageInput.value.trim();


    if (!text) {

        alert(
            "Komentar belum diisi!"
        );

        messageInput.focus();

        return;

    }


    if (text.length > 500) {

        alert(
            "Komentar maksimal 500 karakter!"
        );

        return;

    }


    sendButton.disabled =
        true;


    sendButton.textContent =
        "Mengirim...";


    const { error } =
        await supabaseClient
            .from("comments")
            .insert([
                {
                    name:
                        username,

                    message:
                        text,

                    reply_to:
                        null
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


        sendButton.disabled =
            false;


        sendButton.textContent =
            "Kirim Komentar";


        return;

    }


    messageInput.value = "";


    if (charCount) {

        charCount.textContent =
            "0 / 500";

    }


    sendButton.disabled =
        false;


    sendButton.textContent =
        "Kirim Komentar";


    await loadComments();

}


// ========================================
// DELETE COMMENT / REPLY
// ========================================

async function deleteComment(id) {

    if (role !== "admin") {

        alert(
            "Akses ditolak. Kamu bukan admin."
        );

        return;

    }


    const confirmed =
        confirm(
            "Yakin ingin menghapus pesan ini?"
        );


    if (!confirmed) return;


    // ====================================
    // HAPUS BALASAN YANG MENEMPEL
    // ====================================

    const { error: replyDeleteError } =
        await supabaseClient
            .from("comments")
            .delete()
            .eq(
                "reply_to",
                id
            );


    if (replyDeleteError) {

        console.error(
            "Reply Delete Error:",
            replyDeleteError
        );

    }


    // ====================================
    // HAPUS PESAN
    // ====================================

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
            "Gagal menghapus pesan.\n\n" +
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
        function () {

            loadComments();

        }
    )
    .subscribe();


// ========================================
// BUTTON EVENTS
// ========================================

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


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );

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
// INITIAL LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadComments();

    }
);