'use strict';

module.exports = (sequelize, DataTypes) => {
    var Currency = sequelize.define('Currency', {
        name: DataTypes.STRING,
        sign: DataTypes.STRING,

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
        },
    });

    Currency.associate = function(models) {
    };

    return Currency;
};