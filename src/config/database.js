module.exports = {
    mysql: {
        development: {
            db2: {
                host     : 'localhost',
                username : 'root',
                password : 'root',
                database : 'delvify2',
                dialect  : 'mysql',
                modelsDir : '/db2',
            },
        },
    },
    db2: {
        host     : 'localhost',
        username : 'root',
        password : 'root',
        database : 'delvify2',
        dialect  : 'mysql',
        modelsDir : '/db2',
    },

    mongoose: {
        development: {
            server: 'localhost:27017',
            database: 'delvify',
        },
    }
};