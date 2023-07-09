import { query, transaction } from "../db.js";
import mysql from 'mysql';

//TODO: Add error handling

const controller = {
    getForums: async (req, res) => {
        // need to get all forums and which ones a user is a part of
        const username = req.token.username;
        const view = `SELECT * FROM member WHERE username = '${username}'`
        const sql = `SELECT forumname, IF(isnull(username), FALSE, TRUE) as joined 
                        FROM (${view}) AS m NATURAL RIGHT JOIN forum f 
                        ORDER BY username DESC, forumname ASC`;
        
        const rows = await query(sql);

        return res.json(rows);
    },

    createForum: async (req, res) => {
        // need to create forum and add user to forum
        const { forumname } = req.body;
        const username = req.token.username;

        const callback = async () => {
            const sql = `SELECT * FROM forum WHERE forumname = ${mysql.escape(forumname)}`;
            let rows = await query(sql);
            if (rows.length > 0) {
                return res.status(409).send({error: "Forum already exists"});
            }

            const insertForumSql = `INSERT INTO forum VALUES (${mysql.escape(forumname)})`;
            await query(insertForumSql);

            const insertMemberSql = `INSERT INTO member VALUES (${mysql.escape(forumname)}, '${username}')`;
            await query(insertMemberSql);
        }

        try {
            await transaction(callback);
        } catch (err) {
            return res.status(409).send({error: "Issue with creating forum"});
        }

        return res.status(200).send({ message: "Forum created" });
    },

    joinForum: async (req, res) => {
        // need to add user to forum
        const { forumname } = req.body;
        const username = req.token.username;

        const callback = async () => {
            const sql = `SELECT * FROM forum WHERE forumname = ${mysql.escape(forumname)}`;
            let rows = await query(sql);
            if (rows.length === 0) {
                return res.status(409).send({error: "Forum does not exist"});
            }

            const insertMemberSql = `INSERT INTO member VALUES (${mysql.escape(forumname)}, '${username}')`;
            await query(insertMemberSql);
        }

        try {
            await transaction(callback);
        } catch (err) {
            return res.status(409).send({error: "User already in forum"});
        }

        return res.status(200).send({ message: "Forum joined" });
    },
};

export default controller;
