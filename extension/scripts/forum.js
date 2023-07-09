const main = document.getElementById('main');
const content = document.getElementById('content');
const forumInput = document.getElementById('forum-input');
const forumMsgTextBox = document.getElementById('forum-text');
const joinForumButton = document.getElementById('join-forum');
const forumButton = document.getElementById('forum-button');
const newForumButton = document.getElementById('new-forum-button');
forumButton.addEventListener('click', addForumComment);
newForumButton.addEventListener('click', addForum);
joinForumButton.addEventListener('click', joinForum);

const forumList = createDOM(`<ul id="forum-list"></ul>`);

renderForumsList();

let currentForum = '';

function createForumListItem(f) {
    return createDOM(
        `<li class='${f.forumname.toLowerCase().replaceAll(' ', '-')}'>
			<button class="forum">
				${f.joined ? '&#9989;' : '&#10060;'} 
				${f.forumname}
			</button>
		</li>`
    );
}

async function renderForumsList() {
    emptyDOM(forumList);

    const similarUsersElem = document.getElementById('similar-users');
    const similarUsersList = document.createElement('ul');
    const similarUsers = await Client.get('analytics/similar-users');
    similarUsers.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        similarUsersList.appendChild(li);
    });
    similarUsersElem.appendChild(similarUsersList);

    const forums = await Client.get('forum');

    forums.forEach((f) => {
        let forumItem = createForumListItem(f);

        let forumButton = forumItem.querySelector('.forum');

        forumButton.addEventListener('click', () => {
            currentForum = f;
            renderForum(f.forumname);
        });

        forumList.appendChild(forumItem);
    });

    main.appendChild(forumList);
}

function createCommentElement(fc, hideReplies = false) {
    return createDOM(
        `<div class='forum-comment'>
			<p class='username'>${fc.username}</p>
			<p>Time posted: ${fc.timestamp}</p>
			<p class='comment-msg'>${fc.msg}</p>
			<button class='replies-button' ${hideReplies ? 'hidden' : ''}>Replies</button>
			<div class='forum-replies' hidden>
			</div>
		</div>`
    );
}

async function renderForum(forumname) {
    emptyDOM(content);

    forumInput.hidden = !currentForum.joined;
    joinForumButton.hidden = currentForum.joined;

    const forumComments = await Client.get('post/forum-comments', {
        forumname,
    });

    const forumHeading = document.getElementById('forum-heading');
    forumHeading.innerText = forumname;

    const topCommentersElem = document.getElementById('top-commenters');
    const topCommenters = await Client.get('analytics/top-commenter', {
        forumname: currentForum.forumname,
    });

    let topCommentersString = 'No commenters. Be the first to comment!';

    if (topCommenters.length > 0) {
        topCommentersString = `Top commenters (${topCommenters[0].numcomments} comments): `;

        for (let i = 0; i < topCommenters.length; i++) {
            const tc = topCommenters[i];
            if (i === topCommenters.length - 1) {
                topCommentersString += tc.username;
            } else {
                topCommentersString += tc.username + `, `;
            }
        }

        console.log(topCommentersString);
    }

    topCommentersElem.textContent = topCommentersString;

    forumComments.forEach((fc) => {
        const forumCommentElement = createCommentElement(fc);
        forumCommentElement
            .querySelector('.replies-button')
            .addEventListener('click', () => {
                getForumReplies(fc, forumCommentElement);
            });

        content.insertBefore(forumCommentElement, content.firstChild);
    });
}

async function addForumComment() {
    const msg = forumMsgTextBox.value;
    const forumComment = { msg, forumname: currentForum.forumname };
    const { commentid } = await Client.post('post/forum-comment', forumComment);

    forumComment.commentid = commentid;
    forumComment.username = await Client.getUsername();
    forumComment.timestamp = new Date();

    const commentElement = createCommentElement(forumComment);
    commentElement
        .querySelector('.replies-button')
        .addEventListener('click', () => {
            getForumReplies(forumComment, commentElement);
        });

    content.insertBefore(commentElement, content.firstChild);

    forumMsgTextBox.value = '';
}

async function addForum() {
    const newForumName = document.getElementById('new-forum-name').value;
    await Client.post('forum/create', {
        forumname: newForumName,
    });

    const newForum = { forumname: newForumName, joined: true };
    forumList.insertBefore(createForumListItem(newForum), forumList.firstChild);
    document.getElementById('new-forum-name').value = '';
    renderForumsList();
}

async function joinForum() {
    await Client.post('forum/join', { forumname: currentForum.forumname });

    currentForum.joined = true;
    forumInput.hidden = !currentForum.joined;
    joinForumButton.hidden = currentForum.joined;

    const forumButton = forumList.querySelector(
        `.${currentForum.forumname.toLowerCase().replaceAll(' ', '-')} > button`
    );

    forumButton.innerHTML = `${'&#9989;'} ${currentForum.forumname}`;

    const similarUsersElem = document.getElementById('similar-users');
    const similarUsersList = document.createElement('ul');
    const similarUsers = await Client.get('analytics/similar-users');
    similarUsers.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        similarUsersList.appendChild(li);
    });
    similarUsersElem.removeChild(similarUsersElem.lastChild);
    similarUsersElem.appendChild(similarUsersList);
}

async function getForumReplies(comment, forumCommentElement) {
    const forumRepliesContainer =
        forumCommentElement.querySelector('.forum-replies');

    emptyDOM(forumRepliesContainer);

    forumRepliesContainer.hidden = false;

    const forumReplyInput = createDOM(`
		<div class='write-forum-reply'>
			<p>Write a reply:</p>
			<textarea class="forum-reply-text" rows="4" cols="50"></textarea>
			<button class="forum-reply-button">Post</button>
		</div>`);

    forumReplyInput
        .querySelector('.forum-reply-button')
        .addEventListener('click', () => {
            const msg =
                forumReplyInput.querySelector('.forum-reply-text').value;
            addForumReply(msg, comment.commentid, forumRepliesContainer);
            forumReplyInput.querySelector('.forum-reply-text').value = '';
        });

    forumRepliesContainer.appendChild(forumReplyInput);

    const forumReplies = await Client.get('post/replies', {
        commentid: comment.commentid,
    });

    forumReplies.forEach((fr) => {
        const forumReply = createCommentElement(fr, true);
        forumRepliesContainer.appendChild(forumReply);
    });
}

async function addForumReply(msg, replytocommentid, forumRepliesContainer) {
    const forumReply = { msg, replytocommentid };
    const { commentid } = await Client.post('post/reply', {
        msg,
        replytocommentid,
    });

    forumReply.commentid = commentid;
    forumReply.username = await Client.getUsername();
    forumReply.timestamp = new Date();

    forumRepliesContainer.insertBefore(
        createCommentElement(forumReply, true),
        forumRepliesContainer.firstChild.nextSibling
    );
}

// Removes the contents of the given DOM element (equivalent to elem.innerHTML = '' but faster)
function emptyDOM(elem) {
    while (elem.firstChild) elem.removeChild(elem.firstChild);
}

// Creates a DOM element from the given HTML string
function createDOM(htmlString) {
    let template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstChild;
}
