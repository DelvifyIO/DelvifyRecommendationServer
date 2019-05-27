'use strict';

module.exports = (sequelize, DataTypes) => {
    var Checkout = sequelize.define('Checkout', {
        uid: DataTypes.STRING,
        item_id: DataTypes.INTEGER,
        price: DataTypes.FLOAT,
        quantity: DataTypes.INTEGER,

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('NOW()'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('NOW()'),
        },
    },{
        timestamps: true,
    });

    Checkout.associate = function(models) {
    };

    return Checkout;
};