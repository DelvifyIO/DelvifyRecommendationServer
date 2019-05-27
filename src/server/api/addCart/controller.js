var express = require('express');
var models = require('../../../db/models');
var moment = require('moment');

const queries = ['item_id'];
const paginations = ['limit', 'offset'];

const getAddCarts = (req, res) => {

    const where = _.pick(req.query, queries);
    const pagination = _.pick(req.query, paginations);
    _.each(_.keys(pagination), (key) => {
        pagination[key] = parseInt(pagination[key]);
    });
    const timeRange = req.query.in ; //in hours
    if (timeRange) {
        where['createdAt'] = {
            [models.Sequelize.Op.gte]: moment().subtract(timeRange, 'hours').toDate()
        }
    }

    models.AddCart.findAll({
        where,
        ...pagination,
    })
        .then(function (addCarts) {
            if (addCarts) {
                res.send(addCarts);
            }
            else {
                res.status(404);
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const insertAddCart = (req, res) => {
    models.AddCart.create({
        ...req.body,
    }).then(function (response) {
        res.send(response);
    });
};

module.exports = {
    getAddCarts,
    insertAddCart,
};