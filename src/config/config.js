import _ from 'lodash';
import Promise from 'bluebird';
import Sequelize from 'sequelize';

const config = () => {
    global._ = _;
    global.Promise = Promise;
    global.Sequelize = Sequelize;
    Promise.config({
        warnings: false,
        longStackTraces: false,
    });
};

export default config();