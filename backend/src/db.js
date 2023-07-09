import mysql from 'mysql';

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'cs304'
});

const query = async (sql) => {
    return new Promise((resolve) => {
        connection.query(sql, function (error, results) {
            if (error) throw error;
            resolve(JSON.parse(JSON.stringify(results)));
        });
    })
}

const transaction = async (callback) => {
    return new Promise((resolve, reject) => {
        connection.beginTransaction(async (err) => {
            if (err) {
                reject(err);
            }
            await callback();
            connection.commit((err) => {
                if (err) {
                    connection.rollback(() => {
                        reject(err);
                    });
                }
                resolve();
            });
        });
    });
}

export { connection, query, transaction }