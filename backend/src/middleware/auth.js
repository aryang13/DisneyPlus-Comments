import jwt from "jsonwebtoken";
import { jwtkey } from "../config.js";

const auth = (req, res, next) => {
    if(req.headers["x-access-token"]) {
        const token = req.headers["x-access-token"];

        try {
            req.token = jwt.verify(token, jwtkey);
        } catch (err) {
            return res.status(401).send({error: "Invalid Token", reason: err});
        }
        return next();
    } else {
        return res.status(403).send({error: "A token is required for authentication"});
    }
};

export { auth }