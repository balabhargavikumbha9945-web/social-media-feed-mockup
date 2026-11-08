const postForm = document.getElementById("post-form");
const postsContainer = document.getElementById("posts-container");
const message = document.getElementById("message");

// Create HTML element safely
function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

// Load all posts
async function loadPosts() {
    try {
        const response = await fetch("/posts");

        if (!response.ok) {
            throw new Error("Unable to load posts");
        }

        const posts = await response.json();

        postsContainer.innerHTML = "";

        if (posts.length === 0) {
            postsContainer.appendChild(
                createElement("p", "", "No posts yet. Create your first post!")
            );
            return;
        }

        posts.forEach(post => {

            const card = createElement("div", "post");

            // Post header
            const header = createElement("div", "post-header");

            const username = createElement(
                "h3", "", "👤 " + post.username
            );

            const date = createElement("small", "", post.created_at);

            header.append(username, date);

            // Post content
            const content = createElement(
                "p", "post-content", post.content
            );

            // Actions
            const actions = createElement("div", "post-actions");

            const likeButton = createElement(
                "button", "like-btn", "❤️ Like (" + post.likes + ")"
            );

            likeButton.addEventListener("click", () => {
                likePost(post.id);
            });

            const deleteButton = createElement(
                "button", "delete-btn", "Delete"
            );

            deleteButton.addEventListener("click", () => {
                deletePost(post.id);
            });

            actions.append(likeButton, deleteButton);

            // Comments section
            const commentSection = createElement(
                "div", "comment-section"
            );

            commentSection.appendChild(
                createElement("h4", "", "Comments")
            );

            post.comments.forEach(comment => {
                const commentBox = createElement("div", "comment");

                commentBox.appendChild(
                    createElement(
                        "strong", "", comment.username + ": "
                    )
                );

                commentBox.appendChild(
                    document.createTextNode(comment.comment)
                );

                commentSection.appendChild(commentBox);
            });

            // Comment form
            const commentForm = createElement(
                "form", "comment-form"
            );

            const commentInput = createElement("input");

            commentInput.type = "text";
            commentInput.placeholder = "Write a comment...";
            commentInput.required = true;

            const commentButton = createElement(
                "button", "", "Comment"
            );

            commentButton.type = "submit";

            commentForm.append(commentInput, commentButton);

            commentForm.addEventListener("submit", async event => {
                event.preventDefault();

                await addComment(
                    post.id,
                    post.username,
                    commentInput.value
                );
            });

            commentSection.appendChild(commentForm);

            card.append(
                header,
                content,
                actions,
                commentSection
            );

            postsContainer.appendChild(card);
        });

    } catch (error) {
        postsContainer.textContent = error.message;
    }
}

// Create a new post
postForm.addEventListener("submit", async event => {
    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const content =
        document.getElementById("content").value.trim();

    try {
        const response = await fetch("/add_post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, content })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to create post");
        }

        message.textContent = data.message;
        message.style.color = "green";

        document.getElementById("content").value = "";

        await loadPosts();

    } catch (error) {
        message.textContent = error.message;
        message.style.color = "red";
    }
});

// Like a post
async function likePost(id) {
    try {
        const response = await fetch(`/like/${id}`, {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Unable to like post");
        }

        await loadPosts();

    } catch (error) {
        message.textContent = error.message;
    }
}

// Add a comment
async function addComment(id, username, comment) {
    try {
        const response = await fetch(`/comment/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                comment: comment.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to add comment");
        }

        await loadPosts();

    } catch (error) {
        message.textContent = error.message;
    }
}

// Delete a post
async function deletePost(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(`/delete/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to delete post");
        }

        message.textContent = data.message;
        message.style.color = "green";

        await loadPosts();

    } catch (error) {
        message.textContent = error.message;
    }
}

// Load posts when page opens
loadPosts();
