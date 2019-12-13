module.exports = {
    mysql: {
        development: {
            db1: {
                host     : 'localhost',
                username : 'root',
                password : 'root',
                database : 'delvify',
                dialect  : 'mysql',
                modelsDir : '/db1',
            },
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

    db1: {
        host     : 'localhost',
        username : 'root',
        password : 'root',
        database : 'delvify',
        dialect  : 'mysql',
        modelsDir : '/db1',
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