'use strict';

module.exports = (sequelize, DataTypes) => {
    var Image = sequelize.define('Image', {
        url: DataTypes.STRING,
        url50: DataTypes.STRING,
        url100: DataTypes.STRING,
        url200: DataTypes.STRING,
        url300: DataTypes.STRING,
        url400: DataTypes.STRING,

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

    Image.associate = function(models) {
        // models.User.hasMany(models.Task);
    };

    return Image;
};