async function login() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginButton");
    const message = document.getElementById("loginMessage");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        message.textContent = "Username dan password wajib diisi.";
        message.className = "login-message error";
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Memeriksa...";

    try {
        const response = await fetch("./users.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("users.json tidak ditemukan.");
        }

        const database = await response.json();

        const user = database.users.find(account =>
            account.username === username &&
            account.password === password
        );

        if (!user) {
            message.textContent = "Username atau password salah.";
            message.className = "login-message error";

            loginButton.disabled = false;
            loginButton.textContent = "Masuk";
            return;
        }

        // HAPUS SESSION LAMA
        sessionStorage.clear();

        // SIMPAN LOGIN SECARA PERMANEN
        localStorage.setItem("loginStatus", "user");
        localStorage.setItem("username", user.username);
        localStorage.setItem("name", user.name);
        localStorage.setItem("role", user.role || "user");

        window.location.href = "index.html";

    } catch (error) {
        console.error(error);

        message.textContent = "Gagal membaca database akun.";
        message.className = "login-message error";

        loginButton.disabled = false;
        loginButton.textContent = "Masuk";
    }
}


// ===============================
// GUEST
// ===============================

function guestLogin() {

    sessionStorage.clear();

    localStorage.setItem("loginStatus", "guest");
    localStorage.setItem("username", "Guest");
    localStorage.setItem("name", "Guest");
    localStorage.setItem("role", "guest");

    window.location.href = "index.html";
}


// ===============================
// ENTER
// ===============================

document.addEventListener("keydown", function(event) {

    if (
        event.key === "Enter" &&
        document.activeElement.tagName !== "TEXTAREA"
    ) {
        login();
    }

});    // BUAT TREE KOMENTAR
    // ====================================

    const commentMap = new Map();

    data.forEach(comment => {

        comment.children = [];

        commentMap.set(
            String(comment.id),
            comment
        );

    });


    const roots = [];

    data.forEach(comment => {

        if (
            comment.reply_to !== null &&
            comment.reply_to !== undefined &&
            commentMap.has(
                String(comment.reply_to)
            )
        ) {

            commentMap
                .get(String(comment.reply_to))
                .children
                .push(comment);

        } else {

            roots.push(comment);

        }

    });


    // ====================================
    // RENDER KOMENTAR UTAMA
    // ====================================

    roots
        .sort(sortByDate)
        .forEach(comment => {

            const element =
                createCommentElement(
                    comment,
                    false
                );

            commentList.appendChild(
                element
            );

        });
}


// ========================================
// SORT
// ========================================

function sortByDate(a, b) {

    return new Date(a.created_at) -
        new Date(b.created_at);

}


// ========================================
// CREATE COMMENT
// ========================================

function createCommentElement(
    comment,
    isReply = false
) {

    const box =
        document.createElement("article");

    box.className =
        isReply
            ? "comment reply"
            : "comment";


    // ====================================
    // HEADER
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
        comment.name;


    header.appendChild(name);


    // ====================================
    // "MEMBALAS USER"
    // ====================================

    if (
        isReply &&
        comment.reply_to !== null
    ) {

        const parent =
            findParentName(
                comment.reply_to
            );

        if (parent) {

            const replyingTo =
                document.createElement("span");

            replyingTo.className =
                "replying-to";

            replyingTo.textContent =
                `membalas ${parent}`;

            header.appendChild(
                replyingTo
            );

        }

    }


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


    // ====================================
    // REPLY BUTTON
    // ====================================

    const replyButton =
        document.createElement("button");

    replyButton.type =
        "button";

    replyButton.className =
        "reply-button";

    replyButton.textContent =
        "💬 Balas";

    replyButton.addEventListener(
        "click",
        function() {

            if (!canComment()) {

                alert(
                    "Guest tidak dapat membalas komentar."
                );

                return;
            }

            toggleReplyForm(
                box,
                comment
            );

        }
    );


    actions.appendChild(
        replyButton
    );


    // ====================================
    // DELETE ADMIN
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


    // ====================================
    // APPEND BASIC
    // ====================================

    box.appendChild(header);

    box.appendChild(message);

    box.appendChild(time);

    box.appendChild(actions);


    // ====================================
    // REPLY FORM
    // ====================================

    const replyForm =
        document.createElement("div");

    replyForm.className =
        "reply-form-container";

    replyForm.style.display =
        "none";

    box.appendChild(
        replyForm
    );


    // ====================================
    // CHILD REPLIES
    // ====================================

    if (
        comment.children &&
        comment.children.length > 0
    ) {

        const toggle =
            document.createElement("button");

        toggle.type =
            "button";

        toggle.className =
            "reply-toggle";

        const total =
            comment.children.length;

        toggle.textContent =
            `▼ Lihat ${total} ${
                total === 1
                    ? "balasan"
                    : "balasan"
            }`;


        const replies =
            document.createElement("div");

        replies.className =
            "replies";

        replies.style.display =
            "none";


        // =================================
        // RENDER CHILD
        // =================================

        comment.children
            .sort(sortByDate)
            .forEach(child => {

                const childElement =
                    createCommentElement(
                        child,
                        true
                    );

                replies.appendChild(
                    childElement
                );

            });


        toggle.addEventListener(
            "click",
            function() {

                const hidden =
                    replies.style.display ===
                    "none";

                if (hidden) {

                    replies.style.display =
                        "flex";

                    toggle.textContent =
                        `▲ Sembunyikan ${total} ${
                            total === 1
                                ? "balasan"
                                : "balasan"
                        }`;

                } else {

                    replies.style.display =
                        "none";

                    toggle.textContent =
                        `▼ Lihat ${total} ${
                            total === 1
                                ? "balasan"
                                : "balasan"
                        }`;

                }

            }
        );


        box.appendChild(
            toggle
        );

        box.appendChild(
            replies
        );

    }


    return box;
}


// ========================================
// PARENT NAME
// ========================================
//
// Data sementara disimpan saat load.
// Fungsi ini mencari nama parent dari
// seluruh komentar yang sedang tampil.
//

let allCommentsCache = [];


function findParentName(id) {

    const parent =
        allCommentsCache.find(
            comment =>
                String(comment.id) ===
                String(id)
        );

    return parent
        ? parent.name
        : null;
}


// ========================================
// LOAD DATA + CACHE
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


    allCommentsCache =
        data || [];


    if (!data || data.length === 0) {

        commentList.innerHTML =
            `<p class="empty">
                Belum ada komentar.
            </p>`;

        return;
    }


    commentList.innerHTML = "";


    // ====================================
    // TREE
    // ====================================

    const commentMap =
        new Map();


    data.forEach(comment => {

        comment.children = [];

        commentMap.set(
            String(comment.id),
            comment
        );

    });


    const roots = [];


    data.forEach(comment => {

        if (
            comment.reply_to !== null &&
            comment.reply_to !== undefined &&
            commentMap.has(
                String(comment.reply_to)
            )
        ) {

            commentMap
                .get(
                    String(comment.reply_to)
                )
                .children
                .push(comment);

        } else {

            roots.push(comment);

        }

    });


    roots
        .sort(sortByDate)
        .reverse()
        .forEach(comment => {

            commentList.appendChild(
                createCommentElement(
                    comment,
                    false
                )
            );

        });

}


// ========================================
// REPLY FORM
// ========================================

function toggleReplyForm(
    box,
    comment
) {

    const container =
        box.querySelector(
            ".reply-form-container"
        );

    if (!container) return;


    if (
        container.style.display !==
        "none"
    ) {

        container.style.display =
            "none";

        container.innerHTML = "";

        return;

    }


    container.innerHTML = "";


    const form =
        document.createElement("div");

    form.className =
        "reply-form";


    const label =
        document.createElement("div");

    label.className =
        "reply-label";

    label.textContent =
        `Membalas ${comment.name}`;


    const input =
        document.createElement("textarea");

    input.className =
        "reply-input";

    input.maxLength =
        500;

    input.placeholder =
        `Balas ${comment.name}...`;


    const bottom =
        document.createElement("div");

    bottom.className =
        "reply-form-bottom";


    const counter =
        document.createElement("span");

    counter.className =
        "reply-counter";

    counter.textContent =
        "0 / 500";


    const cancel =
        document.createElement("button");

    cancel.type =
        "button";

    cancel.className =
        "reply-cancel";

    cancel.textContent =
        "Batal";


    const send =
        document.createElement("button");

    send.type =
        "button";

    send.className =
        "reply-send";

    send.textContent =
        "Balas";


    input.addEventListener(
        "input",
        function() {

            counter.textContent =
                `${input.value.length} / 500`;

        }
    );


    cancel.addEventListener(
        "click",
        function() {

            container.style.display =
                "none";

            container.innerHTML = "";

        }
    );


    send.addEventListener(
        "click",
        async function() {

            await sendReply(
                comment.id,
                input,
                send
            );

        }
    );


    bottom.appendChild(counter);

    bottom.appendChild(cancel);

    bottom.appendChild(send);


    form.appendChild(label);

    form.appendChild(input);

    form.appendChild(bottom);


    container.appendChild(
        form
    );


    container.style.display =
        "block";

    input.focus();

}


// ========================================
// SEND REPLY
// ========================================

async function sendReply(
    parentId,
    input,
    button
) {

    if (!canComment()) {

        alert(
            "Guest tidak dapat membalas."
        );

        return;
    }


    const username =
        getUsername();


    const text =
        input.value.trim();


    if (!text) {

        alert(
            "Balasan belum diisi!"
        );

        input.focus();

        return;
    }


    if (text.length > 500) {

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
                    message: text,
                    reply_to: parentId
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


    await loadComments();

}


// ========================================
// ADD MAIN COMMENT
// ========================================

async function addComment() {

    if (!canComment()) {

        alert(
            "Guest tidak dapat mengirim komentar."
        );

        return;
    }


    const input =
        document.getElementById(
            "message"
        );

    if (!input) return;


    const text =
        input.value.trim();


    if (!text) {

        alert(
            "Komentar belum diisi!"
        );

        input.focus();

        return;
    }


    if (text.length > 500) {

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
                    name: getUsername(),
                    message: text,
                    reply_to: null
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


    input.value = "";


    const counter =
        document.getElementById(
            "charCount"
        );

    if (counter) {

        counter.textContent =
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
// DELETE COMMENT / REPLY
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
            "Yakin ingin menghapus komentar ini?\n\nSemua balasan di dalamnya juga akan dihapus."
        );


    if (!confirmed) return;


    // ====================================
    // AMBIL SEMUA KOMENTAR
    // ====================================

    const { data, error } =
        await supabaseClient
            .from("comments")
            .select(
                "id, reply_to"
            );


    if (error) {

        alert(
            "Gagal mencari balasan."
        );

        console.error(error);

        return;
    }


    // ====================================
    // CARI SEMUA TURUNAN
    // ====================================

    const idsToDelete =
        [id];


    let changed = true;


    while (changed) {

        changed = false;


        data.forEach(comment => {

            if (
                comment.reply_to !== null &&
                idsToDelete.some(
                    parentId =>
                        String(parentId) ===
                        String(comment.reply_to)
                ) &&
                !idsToDelete.some(
                    existingId =>
                        String(existingId) ===
                        String(comment.id)
                )
            ) {

                idsToDelete.push(
                    comment.id
                );

                changed = true;

            }

        });

    }


    // ====================================
    // DELETE
    // ====================================

    const { error: deleteError } =
        await supabaseClient
            .from("comments")
            .delete()
            .in(
                "id",
                idsToDelete
            );


    if (deleteError) {

        console.error(
            "Delete Error:",
            deleteError
        );

        alert(
            "Gagal menghapus komentar.\n\n" +
            deleteError.message
        );

        return;
    }


    await loadComments();

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
        function() {

            loadComments();

        }
    )
    .subscribe();


// ========================================
// INITIALIZE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

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

            input.addEventListener(
                "input",
                function() {

                    counter.textContent =
                        `${input.value.length} / 500`;

                }
            );

        }


        loadComments();

    }
);
