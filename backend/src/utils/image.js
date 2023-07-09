import { query } from '../db.js';

const getImageForComment = async (data, commentId) => {
    let obj = data;
    const sql = `SELECT data FROM images WHERE commentid = '${commentId}'`;
    const rows = await query(sql);

    if (rows.length > 0) {
        obj.image = rows[0].data;
    }

    return obj;
}

export { getImageForComment }