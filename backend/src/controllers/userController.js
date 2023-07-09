import { query, transaction } from "../db.js";
import jwt from "jsonwebtoken";
import { createHashedPassword, compareHashedPassword } from "../utils/hash.js";
import { jwtkey } from "../config.js";

//TODO: Add error handling

const controller = {
    register: async (req, res) => {
        const { username, password, email, firstname, lastname, country, postalcode, province, city } = req.body;

        const callback = async () => {
            const sql = `SELECT * FROM user WHERE username = '${username}'`;
            let rows = await query(sql);
            if (rows.length > 0) {
                return res.status(409).send({error: "Username already exists"});
            }

            const checkLocationExists = `SELECT * FROM locations WHERE country = '${country}' AND postalcode = '${postalcode}'`;
            rows = await query(checkLocationExists);
            if (rows.length === 0) {
                const insertLocationSql = `INSERT INTO locations VALUES ('${postalcode}', '${province}', '${city}', '${country}')`;
                await query(insertLocationSql);
            }

            const insertUserSql = `INSERT INTO user VALUES ('${username}', '${firstname}', '${lastname}', '${country}', '${postalcode}', null)`;
            await query(insertUserSql);


            const {salt, hash} = createHashedPassword(password);
            const insertCredSql = `INSERT INTO usercredentials VALUES ('${email}', '${hash}', '${salt}', 'USER', '${username}')`;

            await query(insertCredSql);
        }

        await transaction(callback);

        // create token
        const token = jwt.sign({ username }, jwtkey, { expiresIn: "10h" });

        return res.json({ token });
    },

    login: async (req, res) => {
        const { email, password } = req.body;
        
        const sql = `SELECT passwordhash, salt, username FROM usercredentials WHERE email = '${email}'`;

        let rows = await query(sql);

        if (rows.length === 0) {
            return res.status(401).send({error: "Invalid email"});
        }

        const { salt, passwordhash, username } = rows[0];
        if(!compareHashedPassword(password, salt, passwordhash)) {
            return res.status(401).send({error: "Invalid password"});
        }

        const token = jwt.sign({ username }, jwtkey, { expiresIn: "10h" });

        return res.json({ token });
    },

    getProfile: async (req, res) => {
        console.log("get profile");
        const { username } = req.token;
        const sql = `SELECT * FROM user u WHERE username = '${username}'`;
        let rows = await query(sql);

        if (rows.length === 0) {
            return res.status(404).send({error: "User not found"});
        }

        const obj = rows[0];

        if(obj.imageid !== null) {
            const imageSql = `SELECT data FROM images WHERE imageid = '${obj.imageid}'`;
            rows = await query(imageSql);
            obj.image = rows[0].data;
        }
            
        return res.json(obj);
    },

    postProfileImage: async (req, res) => {
        const { imagedata } = req.body;
        const username = req.token.username;
        let imageid = null;

        const callback = async () => {
            const sql = `INSERT INTO images(name, data, commentid) VALUES ('${username}-profile', '${imagedata}', NULL)`;
            const response = await query(sql);
            imageid = response.insertId;
    
            const updateSql = `UPDATE user SET imageid = '${imageid}' WHERE username = '${username}'`;
            await query(updateSql);
        };

        await transaction(callback);

        return res.json({ imageid });
    }
};

export default controller;