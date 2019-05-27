'use strict';

module.exports = (sequelize, DataTypes) => {
    var AddCart = sequelize.define('AddCart', {
        uid: DataTypes.STRING,
        origin: DataTypes.ENUM(
            'WIDGET',
            'PRODUCT_DETAIL',
        ),
        item_id: DataTypes.INTEGER,
        checked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

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

    AddCart.associate = function(models) {
    };

    return AddCart;
};