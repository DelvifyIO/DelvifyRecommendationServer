'use strict';

module.exports = (sequelize, DataTypes) => {
    var Engagement = sequelize.define('Engagement', {
        type: DataTypes.ENUM(
            'DISPLAY',
            'CLICK_PRODUCT',
            'CLICK_DETAIL',
            'ADD_CART',
        ),
        count: DataTypes.INTEGER,
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

    Engagement.associate = function(models) {
    };

    return Engagement;
};