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
    return queryInterface.bulkInsert('Categories', [ { name: 'Crop Top' },
      { name: 'Swimwear' },
      { name: 'Playsuits' },
      { name: 'Tees' },
      { name: 'Camis & Tank Tops' },
      { name: 'Kimono' },
      { name: 'Bodysuits' },
      { name: 'COATS & JACKETS' },
      { name: 'Bras & Bra Sets' },
      { name: 'Sexy Lingerie' },
      { name: 'Two Piece Outfits' },
      { name: 'Blouses' },
      { name: 'Skirt' },
      { name: 'Jeans' },
      { name: 'Sweatshirts' },
      { name: 'Jumpsuit' },
      { name: 'Pants' },
      { name: 'Sweaters' },
      { name: 'Sleepwear' },
      { name: 'DRESSES' },
      { name: 'SWIMWEAR' },
      { name: 'TOPS' },
      { name: 'BOTTOMS' },
      { name: 'Accessories' },
      { name: 'INTIMATES' },
      { name: 'Leggings' },
      { name: 'Shorts' },
      { name: 'Tracksuit' },
      { name: 'Panties' },
      { name: 'Active Bottoms' },
      { name: 'Sports Bra' },
      { name: 'Sunglasses' },
      { name: 'Sports Bottoms' } ], {});
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
