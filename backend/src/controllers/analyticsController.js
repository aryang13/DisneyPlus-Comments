import { query } from "../db.js";
import mysql from "mysql";

//TODO: Add error handling

const controller = {
    getSimilarUsers: async (req, res) => {
        const username = req.token.username;
        const sql = `SELECT DISTINCT(username)
                        FROM member m1
                        WHERE m1.username <> '${username}'
                        AND NOT EXISTS (
                            SELECT *
                            FROM member m2
                            WHERE m2.username = '${username}'
                            AND NOT EXISTS(
                                SELECT *
                                FROM member m3
                                WHERE m3.forumname = m2.forumname
                                AND m1.username = m3.username
                            )
                        )`;
        const rows = await query(sql);
        
        return res.json(rows);
    },

    getTopCommenter: async (req, res) => {
        const { forumname } = req.query;
        const sql = `SELECT username, COUNT(*) AS numcomments
                        FROM comment c, forumcomment f
                        WHERE c.commentid = f.commentid
                            AND f.forumname = ${mysql.escape(forumname)}
                            GROUP BY username
                            HAVING COUNT(*) >= ALL (SELECT COUNT(*) 
                                                        FROM comment c, forumcomment f
                                                        WHERE c.commentid = f.commentid
                                                        AND f.forumname = ${mysql.escape(forumname)}
                                                        GROUP BY c.username)`;
        const rows = await query(sql);
        return res.json(rows);
    },

    getReviewsPerUser: async (req, res) => {
        const sql = `SELECT username, COUNT(*) AS numreviews, AVG(numericalrating) AS avgrating
                        FROM review
                        GROUP BY username
                        HAVING COUNT(*) >= 1
                        ORDER BY numreviews DESC`;
        const rows = await query(sql);

        return res.json(rows);
    },
};

export default controller;
