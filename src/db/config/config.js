require('dotenv/config');

module.exports = {
    host     : 'localhost',
    username : process.env.DATABASE_NAME,
    password : process.env.DATABASE_PASSWORD,
    database : 'delvify',
    dialect  : 'mysql',
};