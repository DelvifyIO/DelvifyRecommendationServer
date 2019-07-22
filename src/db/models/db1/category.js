'use strict';

module.exports = (sequelize, DataTypes) => {
    var Category = sequelize.define('Category', {
        name: DataTypes.STRING,

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

    Category.associate = function(models) {
        models.db1.Category.hasMany(models.db1.Product, { as: 'products', constraints: false, foreignKey: 'categoryId' });
    };

    return Category;
};