import mysql from "mysql2/promise";
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.MYSQL_DATABASE_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME
});

const createTable = async (schema) => {
    try {
        const results = await pool.query(schema);
        return results;
    } catch (error) {
        console.log(error.message);
    }
};

const checkRecordExists = async (tablename, column, value) => {
    try {
        const query = `SELECT * FROM ${tablename} WHERE ${column} = ?`;
        const results = await pool.query(query, [value]);
        if (results.length)
            return results[0];
        else
            return null;
    } catch (error) {
        console.log(error);
    }
};

const insertRecord = async (tablename, record) => {
    try {
        const query = `INSERT INTO ${tablename} SET ?`;
        const results = await pool.query(query, [record]);
        console.log(results.length);
        if (results.length) {
            return results;
        }
        else
            return null;

    } catch (error) {
        console.log(error);
    }
};

const updatePassword = async (tablename, hashedPassword, email) => {
    try {
        const query = `UPDATE ${tablename} SET password = ? WHERE email = ? `;
        const results = await pool.query(query, [hashedPassword, email]);
        if (results.length) {
            return results;
        } else
            return null;
    } catch (error) {
        console.log(error);
    }
};

export { createTable, checkRecordExists, insertRecord, updatePassword };