import { sha256 } from 'js-sha256';
import { randomBytes } from 'crypto';

const createHashedPassword = (password) => {
    let salt = randomBytes(16).toString('hex');
    let hash = sha256(password + salt).toString();
    return { salt, hash };
};

const compareHashedPassword = (password, salt, hash) => {
    return sha256(password + salt).toString() === hash;
};

export { createHashedPassword, compareHashedPassword };