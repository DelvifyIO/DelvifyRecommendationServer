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
        image_url: DataTypes.STRING,
        product_url: DataTypes.STRING,
        currency: DataTypes.STRING,
        similar_sku: DataTypes.STRING,

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

    Product.associate = function(model) {
        model.Product.belongsTo(model.Category, { as: 'category', constraints: false });
    };

    return Product;
};