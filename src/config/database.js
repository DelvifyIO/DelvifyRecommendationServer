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
            db1: {
                server: 'localhost:27017',
                database: 'delvify',
            },
            db2: {
                server: 'localhost:27017',
                database: 'delvify2',
            }
        }
    }
};