import { query, transaction } from "../db.js";
import { getImageForComment } from "../utils/image.js";
import mysql from "mysql";

//TODO: Add error handling

const controller = {
    // GET Functions
    getEpisodeComments: async (req, res) => {
        const { disneyplusid} = req.query;
        const username = req.token.username;

        const view1 = `SELECT c.commentid, c.username, c.msg, c.timestamp, e.timeinepisode
                        FROM episodecomment e, comment c
                        WHERE e.commentid = c.commentid
                                AND e.disneyplusid = '${disneyplusid}'`;
        const view2 = `SELECT commentid, COUNT(*) AS numlikes, SUM(IF(username = '${username}',1,0)) > 0 AS isliked
                        FROM likes
                        GROUP BY commentid`;
        const sql = `SELECT t.commentid, t.username, t.msg, t.timestamp, t.timeinepisode, ifnull(l.numlikes, 0) as numlikes, l.isliked
                    FROM (${view1}) AS t NATURAL LEFT OUTER JOIN (${view2}) AS l
                    ORDER BY t.timeinepisode ASC, t.timestamp DESC`;
        const rows = await query(sql);

        let data = [];
        for (let i = 0; i < rows.length; i++) {
            data.push(await getImageForComment(rows[i], rows[i].commentid));
        }

        return res.json(data);
    },
    getForumComments: async (req, res) => {
        const sql = `SELECT c.commentid, c.username, c.msg, c.timestamp
                        FROM forumcomment f, comment c
                        WHERE f.commentid = c.commentid 
                                AND f.forumname = '${req.query.forumname}'`;
        const rows = await query(sql);

        let data = [];
        for (let i = 0; i < rows.length; i++) {
            data.push(await getImageForComment(rows[i], rows[i].commentid));
        }

        return res.json(data);
    },
    getReplies: async (req, res) => {
        const username = req.token.username;
        
        const view1 = `SELECT c.commentid, replytocommentid, username, msg, timestamp
                        FROM reply r, comment c
                        WHERE r.commentid = c.commentid
                        AND replytocommentid = ${parseInt(req.query.commentid)}`;
        const view2 = `SELECT commentid, COUNT(*) AS numlikes, SUM(IF(username = '${username}',1,0)) > 0 AS isliked
                        FROM likes
                        GROUP BY commentid`;
        const sql = `SELECT t.commentid, t.replytocommentid, t.username, t.msg, t.timestamp, ifnull(l.numlikes, 0) as numlikes, l.isliked
                        FROM (${view1}) AS t NATURAL LEFT OUTER JOIN (${view2}) AS l
                        ORDER BY t.timestamp DESC`;
        const rows = await query(sql);

        let data = [];
        for (let i = 0; i < rows.length; i++) {
            data.push(await getImageForComment(rows[i], rows[i].commentid));
        }

        return res.json(data);
    },
    getReviews: async (req, res) => {
        const sql = `SELECT username, content, ra.numericalrating, ra.phraserating
                        FROM review re, rating ra
                        WHERE re.disneyplusid = '${req.query.disneyplusid}' 
                            AND re.numericalrating = ra.numericalrating`;
        const rows = await query(sql);
        return res.json(rows);
    },

    // POST Functions
    postEpisodeComment: async (req, res) => {
        const { msg, disneyplusid, timeinepisode } = req.body;
        const username = req.token.username;
        let commentid = null;

        const callback = async () => {
            const commentSql = `INSERT INTO comment(timestamp, username, msg) VALUES (NOW(), '${username}', ${mysql.escape(msg)})`;
            const respose = await query(commentSql);
            commentid = respose.insertId;
           
            const episodecommentSql = `INSERT INTO episodecomment VALUES (${commentid}, ${timeinepisode}, '${disneyplusid}')`;
            await query(episodecommentSql);
        };

        await transaction(callback);

        return res.json({ commentid });
    },
    postForumComment: async (req, res) => {
        const { msg, forumname } = req.body;
        const username = req.token.username;
        let commentid = null;

        const callback = async () => {
            const checkIfForumExistsSql = `SELECT * FROM forum WHERE forumname = ${mysql.escape(forumname)}`;
            const rows = await query(checkIfForumExistsSql);
            if (rows.length === 0) {
                return res.status(400).json({ error: "Forum does not exist" });
            }
    
            const commentSql = `INSERT INTO comment(timestamp, username, msg) VALUES (NOW(), '${username}', ${mysql.escape(msg)})`;
            const response = await query(commentSql);
            commentid = response.insertId;
    
            const forumcommentSql = `INSERT INTO forumcomment VALUES (${commentid}, ${mysql.escape(forumname)})`;
            await query(forumcommentSql);
        }

        await transaction(callback);

        return res.json({ commentid });
    },
    postReply: async (req, res) => {
        const { msg, replytocommentid } = req.body;
        const username = req.token.username;
        let commentid = null;

        const callback = async () => {
            const commentSql = `INSERT INTO comment(timestamp, username, msg) VALUES (NOW(), '${username}', ${mysql.escape(msg)})`;
            const response = await query(commentSql);
    
            commentid = response.insertId;
            const replySql = `INSERT INTO reply VALUES (${commentid}, ${replytocommentid})`;
            await query(replySql);
        }

        await transaction(callback);

        return res.json({ commentid });
    },
    postLike: async (req, res) => {
        const { commentid } = req.body;
        const username = req.token.username;

        const likeSql = `INSERT INTO likes VALUES (${commentid}, '${username}')`;
        await query(likeSql);

        return res.json({ commentid });
    },
    postReview: async (req, res) => {
        const { content, numericalrating, disneyplusid, title } = req.body;
        const username = req.token.username;
        let reviewid = null;

        const callback = async () => {
            const checkIfShowExistsSql = `SELECT * FROM shows WHERE disneyplusid = '${disneyplusid}'`;
            let rows = await query(checkIfShowExistsSql);
            if (rows.length === 0) {
                const addShowSql = `INSERT INTO shows VALUES ('${disneyplusid}', ${mysql.escape(title.toLowerCase())})`;
                await query(addShowSql);
            }
            
            const reviewSql = `INSERT INTO review(timestamp, username, disneyplusid, content, numericalrating) VALUES (NOW(), '${username}', '${disneyplusid}', ${mysql.escape(content)}, ${numericalrating})`;
            const response = await query(reviewSql);
            reviewid = response.insertId;
        }

        await transaction(callback);

        return res.json({ reviewid });
    },
    postImageComment: async (req, res) => {
        const { image, commentid } = req.body;

        const sql = `INSERT INTO images(name, data, commentid) VALUES ('${commentid}-comment', '${image}', ${commentid})`;
        const response = await query(sql);
        const imageid = response.insertId;

        return res.json({ imageid });
    },

    // PUT Functions
    patchEpisodeComment: async (req, res) => {
        const { msg, commentid } = req.body;
        const username = req.token.username;
        const sql = `UPDATE comment SET msg = ${mysql.escape(msg)} WHERE commentid = ${commentid} AND username = '${username}'`;
        await query(sql);
        res.status(200).send({message: `Updated Episode Comment: ${commentid}`});
    },
    patchForumComment: async (req, res) => {
        const { msg, commentid } = req.body;
        const username = req.token.username;
        const sql = `UPDATE comment SET msg = ${mysql.escape(msg)} WHERE commentid = ${commentid} AND username = '${username}'`;
        await query(sql);
        res.status(200).send({message: `Updated Forum Comment: ${commentid}`});
    },
    patchReply: async (req, res) => {
        const { msg, commentid } = req.body;
        const username = req.token.username;
        const sql = `UPDATE comment SET msg = ${mysql.escape(msg)} WHERE commentid = ${commentid} AND username = '${username}'`;
        await query(sql);
        res.status(200).send({message: `Updated Reply: ${commentid}`});
    },
    patchReview: async (req, res) => {
        const { content, reviewid } = req.body;
        const username = req.token.username;
        const sql = `UPDATE review SET content = ${mysql.escape(content)} WHERE reviewid = ${reviewid} AND username = '${username}'`;
        await query(sql);
        res.status(200).send({message: `Updated Review: ${reviewid}`});
    },

    // DELETE Functions
    deleteEpisodeComment: async (req, res) => {
        const commentid = req.params.commentid;

        const callback = async () => {
            const deleteEpisodeCommentSql = `DELETE FROM episodecomment WHERE commentid = ${commentid}`;
            await query(deleteEpisodeCommentSql);
    
            const deleteCommentSql = `DELETE FROM comment WHERE commentid = ${commentid}`;
            await query(deleteCommentSql);
        }

        await transaction(callback);

        res.status(200).send({message: "Deleted Episode Comment"});
    },
    deleteForumComment: async (req, res) => {
        const commentid = req.params.commentid;

        const callback = async () => {
            const deleteForumCommentSql = `DELETE FROM forumcomment WHERE commentid = ${commentid}`;
            await query(deleteForumCommentSql);
    
            const deleteCommentSql = `DELETE FROM comment WHERE commentid = ${commentid}`;
            await query(deleteCommentSql);
        }

        await transaction(callback);

        res.status(200).send({message: "Deleted Forum Comment"});
    },
    deleteReply: async (req, res) => {
        const commentid = req.params.commentid;

        const callback = async () => {
            const deleteReplySql = `DELETE FROM reply WHERE commentid = ${commentid}`;
            await query(deleteReplySql);
    
            const deleteCommentSql = `DELETE FROM comment WHERE commentid = ${commentid}`;
            await query(deleteCommentSql);
        }

        await transaction(callback);

        res.status(200).send({message: "Deleted Reply"});
    },
    deleteLike: async (req, res) => {
        const { commentid } = req.params;
        const username = req.token.username;

        const deleteLikeSql = `DELETE FROM likes WHERE commentid = ${commentid} AND username = '${username}'`;
        await query(deleteLikeSql);

        res.status(200).send({message: "Deleted like"});
    },
    deleteReview: async (req, res) => {
        const reviewid = req.params.reviewid;

        const deleteReviewSql = `DELETE FROM review WHERE reviewid = ${reviewid}`;
        await query(deleteReviewSql);

        res.status(200).send({message: "Deleted review"});
    },
}

export default controller;
