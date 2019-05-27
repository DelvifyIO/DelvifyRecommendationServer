'use strict';

module.exports = (sequelize, DataTypes) => {
    var Similarity = sequelize.define('Similarity', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        item_id: DataTypes.INTEGER,
        sim_item_sku: DataTypes.STRING,
        similarity: DataTypes.DOUBLE,

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

    Similarity.associate = function(models) {
        // models.User.hasMany(models.Task);
    };

    return Similarity;
};