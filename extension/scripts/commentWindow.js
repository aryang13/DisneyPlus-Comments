const chat_width_pct = 25;
const red_heart = "&#10084;&#65039;";
const white_heart = "&#x1F90D;";


function prettyTime(timeInSeconds) {
  const minutes = Math.floor(timeInSeconds / 60);

  return `${minutes}:${(timeInSeconds % 60).toString().padStart(2, '0')}`;
}



class CommentWindow {
  constructor() {
    this.chat = document.createElement("div");
    this.comments_container = document.createElement("div");
    this.comments_container.className = "comment-container";
    this.comment_box = document.createElement("div");
    this.comment_box_input = document.createElement("input");
    this.comment_box_submit = document.createElement("button");
    this.comment_box_file = document.createElement("input")
    this.comment_box_file.type = "file";
    this.comment_box_file.accept = "image/*";
    this.comment_box_file.style.display = "none";
    this.comment_box_submit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24"><path d="M120 896V256l760 320-760 320Zm60-93 544-227-544-230v168l242 62-242 60v167Zm0 0V346v457Z"/></svg>';

    // Execute a function when the user presses a key on the keyboard
    this.comment_box_input.addEventListener("keypress", ((event) => {
      // If the user presses the "Enter" key on the keyboard
      if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        this.comment_box_submit.click();
      }
    }).bind(this));

    this.comment_box_submit.addEventListener('click', this.addComment.bind(this))

    const label_for_comment_box = document.createElement("label");
    label_for_comment_box.innerText = "Select an image";
    label_for_comment_box.appendChild(this.comment_box_file);
    this.comment_box.appendChild(this.comment_box_input);
    this.comment_box.appendChild(this.comment_box_submit);
    this.comment_box.appendChild(label_for_comment_box);

    // debugger;

    this.comment_box.className = "comment-box";

    this.chat.appendChild(this.comments_container);
    this.chat.appendChild(this.comment_box);

    this.chat_toggle = document.createElement("div");
    this.chat.className = "chat";
    this.chat.style.width = `${chat_width_pct}%`;

    this.chat_toggle.id = "chat-toggle";

    this.chat.hidden = true;
    this.chat_toggle.hidden = true;

    this.chat_toggle.addEventListener("click", () => this.toggleChat());

    // REPLY WINDOW

    this.reply_box = document.createElement("div");
    this.reply_box_input = document.createElement("input");
    this.reply_box_submit = document.createElement("button");
    this.reply_box_file = document.createElement("input")
    this.reply_box_file.type = "file";
    this.reply_box_file.accept = "image/*";
    this.reply_box_file.style.display = "none";
    this.reply_box_submit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24"><path d="M120 896V256l760 320-760 320Zm60-93 544-227-544-230v168l242 62-242 60v167Zm0 0V346v457Z"/></svg>';
    
    this.reply_box_input.addEventListener("keypress", ((event) => {
      // If the user presses the "Enter" key on the keyboard
      if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        this.reply_box_submit.click();
      }
    }).bind(this));

    this.reply_window = document.createElement("div");
    this.reply_window.id = "reply-window";
    this.reply_window.hidden = true;

    const close_reply_window = document.createElement("button");
    close_reply_window.innerText = "Close";
    close_reply_window.addEventListener('click', this.closeReplyWindow.bind(this));
    this.reply_window.appendChild(close_reply_window);

    this.reply_window_comment = document.createElement("div");
    this.reply_window.appendChild(this.reply_window_comment);
    this.reply_window.appendChild(document.createElement("hr"));

    this.reply_window_replies = document.createElement("div");
    this.reply_window_replies.className = "reply-container";
    this.reply_window.appendChild(this.reply_window_replies);


    this.reply_box_submit.addEventListener('click', this.addReply.bind(this))

    const label_for_reply_box = document.createElement("label");
    label_for_reply_box.innerText = "Select an image";
    label_for_reply_box.appendChild(this.reply_box_file);
    this.reply_box.appendChild(this.reply_box_input);
    this.reply_box.appendChild(this.reply_box_submit);
    this.reply_box.appendChild(label_for_reply_box);

    this.reply_box.className = "comment-box";

    this.reply_window.appendChild(this.reply_box);


    document.body.appendChild(this.chat_toggle);
    document.body.appendChild(this.chat);
    document.body.appendChild(this.reply_window);
  }

  currentTimeInEpisode() {
    return Number(document.querySelector(".progress-bar > .slider-container")?.ariaValueNow ?? 0);
  }

  toggleChat() {
    this.chat.hidden = !this.chat.hidden;
    if (this.chat.hidden) {
      clearInterval(this.update);
      this.chat_toggle.style.right = 0;
      this.web_player.style.width = `100%`;
    } else {
      this.update = setInterval(this.renderComments.bind(this), 1000);
      this.chat_toggle.style.right = `${chat_width_pct}%`;
      this.web_player.style.width = `${100 - chat_width_pct}%`;
    }
  }

  setComments(comments) {
    this.comments = comments;
    this.renderComments();
  }

  renderComments() {
    this.comments_container.innerHTML = "";
    for(const comment of this.comments.iterComments(this.currentTimeInEpisode())) {
      this.comments_container.appendChild(this.newCommentElement(comment));
    }

    if(this.comments.open_reply) {
      this.openReplyWindow();
    }
  }

  waitForWebPlayerLoad(callback) {
    this.web_player = document.getElementById("hudson-wrapper");
    if (this.web_player) {
      console.log("Start");
      callback();
      console.log("done");
    } else {
      setTimeout(this.waitForWebPlayerLoad.bind(this, callback), 100);
    }
  }

  async showSidebarToggle(isShown) {
    if (isShown) {
      // wait and set webplayer
      await new Promise((resolve) => this.waitForWebPlayerLoad(resolve));
      this.web_player.style.left = "0px";
      this.web_player.style.right = "unset";
    }

    this.chat_toggle.hidden = !isShown;
    if (!isShown && !this.chat.hidden) {
      this.toggleChat();
    }
  }

  newCommentElement(comment, showReplies = true) {
    const e = document.createElement("div");
    const msg = document.createElement("div");
    const buttons = document.createElement("div")
    msg.innerHTML = `<div><b>${comment.username}</b> (${prettyTime(comment.timeinepisode)}): ${comment.msg}</div>`
  
    if(comment.image) {
      const image = document.createElement("img");
      if(comment.image["type"]) {
        image.src = Images.toImage(comment.image);
      } else {
        image.src = comment.image; // for local comments
      }
      msg.appendChild(image);
    }

    const likeButton = document.createElement("button")
    if(showReplies) {
      const replyButton = document.createElement("button")
      replyButton.className = "reply-button";
      replyButton.innerText = "Replies";
      replyButton.addEventListener('click', this.comments.setReply.bind(this.comments, comment));
      buttons.appendChild(replyButton);
    }
    
    
    likeButton.className = "like-button";
    likeButton.innerHTML = `${comment.isliked ? red_heart : white_heart}(${comment.numlikes ?? 0})`
    
    likeButton.addEventListener('click', this.like.bind(this, comment.commentid));
    
    buttons.appendChild(likeButton);
  
    e.appendChild(msg);
    e.appendChild(buttons);
    e.className = "comment"
  
    return e;
  }

  newReplyElement(reply) {
    const e = document.createElement("div");
    const msg = document.createElement("div");
    const buttons = document.createElement("div")
    msg.innerHTML = `<div><b>${reply.username}</b>: ${reply.msg}</div>`
  
    if(reply.image) {
      const image = document.createElement("img");
      if(reply.image["type"]) {
        image.src = Images.toImage(reply.image);
      } else {
        image.src = reply.image; // for local replys
      }
      msg.appendChild(image);
    }

    const likeButton = document.createElement("button")
    
    likeButton.className = "like-button";
    likeButton.innerHTML = `${reply.isliked ? red_heart : white_heart}(${reply.numlikes ?? 0})`
    
    likeButton.addEventListener('click', this.likeReply.bind(this, reply.commentid));
    
    buttons.appendChild(likeButton);
  
    e.appendChild(msg);
    e.appendChild(buttons);
    e.className = "comment"
  
    return e;
  }

  async addComment() {
    let image;
    if(this.comment_box_file.files.length == 1) {
      image = await Images.convertBase64(this.comment_box_file.files[0]).then(Images.resizeBase64Img);
    }
    
    const msg = this.comment_box_input.value;
    if(msg.trim() == "") return;
    this.comments.addComment(msg, this.currentTimeInEpisode(), image);
    this.comment_box_input.value = '';
    this.comment_box_file.value = '';
  }

  async addReply() {
    let image;
    if(this.reply_box_file.files.length == 1) {
      image = await Images.convertBase64(this.reply_box_file.files[0]).then(Images.resizeBase64Img);
    }
    
    const msg = this.reply_box_input.value;
    if(msg.trim() == "") return;
    this.comments.addReply(msg, image);
    this.reply_box_input.value = '';
    this.reply_box_file.value = '';
  }

  like(commentid) {
    this.comments.likeComment(commentid);
  }

  likeReply(commentid) {
    this.comments.likeReply(commentid);
  }

  openReplyWindow() {
    this.reply_window_comment.innerHTML = "";
    this.reply_window_comment.appendChild(this.newCommentElement(this.comments.open_reply, false));

    this.reply_window_replies.innerHTML = "";
    this.comments.replies.forEach(reply => {
      this.reply_window_replies.appendChild(this.newReplyElement(reply));
    });

    this.reply_window.hidden = false;
  }

  closeReplyWindow() {
    this.comments?.setReply(null);
    this.reply_window.hidden = true;
  }
}