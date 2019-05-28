'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('Categories', [{"name":"succulents"},{"name":"seasonal flowers"},{"name":"birthday flowers"},{"name":"premium flowers"},{"name":"get well flowers"},{"name":"new baby flowers"},{"name":"roses"},{"name":"flower bouquets"},{"name":"flower arrangements"},{"name":"plants"},{"name":"flower baskets"},{"name":"sympathy flowers"},{"name":"funeral flowers"},{"name":"gourmet hampers"},{"name":"luxe collection"}], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    const drop = queryInterface.dropTable('Categories');
    const create = queryInterface.createTable('Categories', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: Sequelize.STRING,
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(),
      }
    });
    return Promise.all([drop, create]);
  }
};
