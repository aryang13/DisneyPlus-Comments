class Comments {
    constructor(video_id) {

        this.video_id = video_id;
        this.comments = [];
    }

    async fetchComments() {
        this.comments = await Client.get("post/episode-comments",{
            disneyplusid: this.video_id
        })
        // [{username
        //     commentid
        //     msg
        //     timestamp
        //     timeinepisode}] in asc by time in episode
        this.isReady = true;
        console.log(this.comments)
    }

    isReady() {
        return this.isReady ?? false;
    }

    *iterComments(timeinepisode) {
        for(const comment of this.comments) {
            if(comment.timeinepisode <= timeinepisode) {
                yield comment;
            } else {
                break;
            }
        }
    }

    async addComment(msg, timeinepisode, image) {
        console.log("Submit comment: '"+timeinepisode + ": " + msg+"'");
        const comment = {
            username: await Client.getUsername(),
            msg, timeinepisode, disneyplusid: this.video_id
        };

        const { commentid } = await Client.post("post/episode-comment", comment);

        if (image) {
            Client.post("post/image-comment", {commentid, image});
            comment["image"] = image;
        }

        comment["commentid"] = commentid;

        let i = this.comments.length;

        while(i > 0 && this.comments[i-1].timeinepisode > timeinepisode) i--;

        this.comments.splice(i, 0, comment);

        console.log(this.comments);
    }

    likeComment(commentid) {
        const liked_comment = this.comments.find(comment => comment.commentid == commentid);
        if(liked_comment.isliked) {
            liked_comment.numlikes = (liked_comment.numlikes ?? 1) - 1;
            liked_comment.isliked = false;

            Client.delete(`post/like/${commentid}`);
        } else {
            liked_comment.numlikes = (liked_comment.numlikes ?? 0) + 1;
            liked_comment.isliked = true;
    
            Client.post("post/like", {commentid});
        }
    }

    async setReply(comment) {
        this.open_reply = comment;
        if(comment) {
            this.replies = await Client.get("post/replies", {commentid: comment.commentid});
        } else {
            this.replies = [];
        }
    }

    likeReply(commentid) {
        const liked_reply = this.replies.find(comment => comment.commentid == commentid);
        if(liked_reply.isliked) {
            liked_reply.numlikes = (liked_reply.numlikes ?? 1) - 1;
            liked_reply.isliked = false;

            Client.delete(`post/like/${commentid}`);
        } else {
            liked_reply.numlikes = (liked_reply.numlikes ?? 0) + 1;
            liked_reply.isliked = true;
    
            Client.post("post/like", {commentid});
        }
    }

    async addReply(msg, image) {
        console.log("Submit reply: '" + msg+"'");
        const reply = {
            username: await Client.getUsername(),
            msg, replytocommentid: this.open_reply.commentid
        };

        const { commentid } = await Client.post("post/reply", reply);

        if (image) {
            Client.post("post/image-comment", {commentid, image});
            reply["image"] = image;
        }

        reply["commentid"] = commentid;

        this.replies.push(reply)

        console.log(this.replies);
    }

}