'use strict';

module.exports = (sequelize, DataTypes) => {
    var Product = sequelize.define('Product', {
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        unit: DataTypes.INTEGER,
        is_available: DataTypes.BOOLEAN,
        price: DataTypes.FLOAT,
        from_price: DataTypes.FLOAT,
        sku: DataTypes.STRING,

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

    Product.associate = function(models) {
        models.db2.Product.hasMany(models.db2.Image, { as: 'images', constraints: false });
        models.db2.Product.belongsTo(models.db2.Category, { as: 'category', constraints: false });
        models.db2.Product.belongsTo(models.db2.Currency, { as: 'currency', constraints: false });
    };

    return Product;
};