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
// SPOTIFY
// ========================================

// MASUKKAN ID TRACK SPOTIFY DI SINI
const SPOTIFY_TRACK_ID =
    "GANTI_DENGAN_ID_TRACK_SPOTIFY";


function loadSpotify() {

    const frame =
        document.getElementById("spotifyFrame");

    if (!frame) return;

    if (
        !SPOTIFY_TRACK_ID ||
        SPOTIFY_TRACK_ID ===
        "GANTI_DENGAN_ID_TRACK_SPOTIFY"
    ) {
        return;
    }

    frame.src =
        `https://open.spotify.com/embed/track/${SPOTIFY_TRACK_ID}?utm_source=generator&theme=0`;
}


function closeSpotify() {

    const player =
        document.getElementById("spotifyPlayer");

    if (player) {

        player.style.display = "none";

    }
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


    commentList.innerHTML = "";


    const role =
        getRole();


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


    comments.reverse();


    comments.forEach(comment => {

        const box =
            createCommentElement(
                comment,
                role,
                replies
            );

        commentList.appendChild(box);

    });

}


// ========================================
// CREATE COMMENT
// ========================================

function createCommentElement(
    comment,
    role,
    replies
) {

    const box =
        document.createElement("article");

    box.className =
        "comment";


    const name =
        document.createElement("div");

    name.className =
        "comment-name";

    name.textContent =
        comment.name;


    const message =
        document.createElement("div");

    message.className =
        "comment-message";

    message.textContent =
        comment.message;


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
        function () {

            showReplyForm(
                box,
                comment
            );

        }
    );


    actions.appendChild(
        replyButton
    );


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


    box.appendChild(actions);


    // ====================================
    // REPLIES
    // ====================================

    const commentReplies =
        replies.filter(
            reply =>
                String(reply.parent_id) ===
                String(comment.id)
        );


    if (commentReplies.length > 0) {

        const toggle =
            document.createElement("button");

        toggle.type =
            "button";

        toggle.className =
            "reply-toggle";

        toggle.textContent =
            `Lihat ${commentReplies.length} balasan`;


        const repliesContainer =
            document.createElement("div");

        repliesContainer.className =
            "replies";

        repliesContainer.style.display =
            "none";


        toggle.addEventListener(
            "click",
            function () {

                const hidden =
                    repliesContainer.style.display ===
                    "none";


                repliesContainer.style.display =
                    hidden ? "flex" : "none";


                toggle.textContent =
                    hidden
                        ? `Sembunyikan ${commentReplies.length} balasan`
                        : `Lihat ${commentReplies.length} balasan`;

            }
        );


        commentReplies.forEach(
            reply => {

                repliesContainer.appendChild(
                    createReplyElement(
                        reply,
                        comment,
                        role
                    )
                );

            }
        );


        box.appendChild(toggle);

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
    parentComment,
    role
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
        document.createElement("div");

    name.className =
        "comment-name";

    name.textContent =
        reply.name;


    const replying =
        document.createElement("span");

    replying.className =
        "replying-to";

    replying.textContent =
        `membalas ${parentComment.name}`;


    header.appendChild(name);
    header.appendChild(replying);


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


    box.appendChild(header);
    box.appendChild(message);
    box.appendChild(time);


    // ====================================
    // REPLY KE REPLY
    // ====================================

    const actions =
        document.createElement("div");

    actions.className =
        "comment-actions";


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
        function () {

            showReplyForm(
                box,
                reply
            );

        }
    );


    actions.appendChild(
        replyButton
    );


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
            function () {

                deleteComment(
                    reply.id
                );

            }
        );


        actions.appendChild(
            deleteButton
        );

    }


    box.appendChild(actions);


    return box;
}


// ========================================
// REPLY FORM
// ========================================

function showReplyForm(
    container,
    targetComment
) {

    const oldForm =
        document.querySelector(
            ".reply-form"
        );

    if (oldForm) {

        oldForm.remove();

    }


    const loginStatus =
        getLoginStatus();

    const username =
        getUsername();

    const role =
        getRole();


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
        document.createElement("div");

    form.className =
        "reply-form";


    const input =
        document.createElement("textarea");

    input.className =
        "reply-input";

    input.maxLength =
        500;

    input.placeholder =
        `Balas ${targetComment.name}...`;


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
        function () {

            form.remove();

        };


    const send =
        document.createElement("button");

    send.type =
        "button";

    send.className =
        "reply-send";

    send.textContent =
        "Balas";


    send.onclick =
        async function () {

            const text =
                input.value.trim();


            if (!text) {

                alert(
                    "Balasan belum diisi!"
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
                            name: username,
                            message: text,
                            parent_id:
                                targetComment.id
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

        };


    bottom.appendChild(cancel);
    bottom.appendChild(send);


    form.appendChild(input);
    form.appendChild(bottom);


    container.appendChild(form);

    input.focus();

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
        document.getElementById("message");


    if (!messageInput) return;


    const message =
        messageInput.value.trim();


    if (!message) {

        alert(
            "Komentar belum diisi!"
        );

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

        button.disabled =
            false;

        button.textContent =
            "Kirim Komentar";

        return;
    }


    messageInput.value = "";

    document.getElementById(
        "charCount"
    ).textContent =
        "0 / 500";


    button.disabled =
        false;

    button.textContent =
        "Kirim Komentar";


    await loadComments();

}


// ========================================
// DELETE COMMENT
// ========================================

async function deleteComment(id) {

    if (
        getRole() !== "admin"
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
    .channel("comments-realtime")
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


        loadSpotify();

        loadComments();

    }
);