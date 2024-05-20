import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.MYSQL_DATABASE_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME
});

const connectDB = async () => {
    connection.connect((err) => {
        if (err) {
            console.log("Error while connecting");
            console.log(err);
        } else {
            console.log('Database connected');
            connection.query('SHOW DATABASES', (err, result) => {
                if (err) {
                    console.log(`Error executing the query - ${err}`);
                } else {
                    console.log("Results: ", result);
                }
            });
        }
    });
};

export default connectDB;
