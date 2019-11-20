var express = require('express');
var moment = require('moment');

const queries = ['oid', 'pid', 'sku', 'uid'];
const paginations = ['limit', 'offset'];

const getQueries = (req, res) => {
    const { merchantid } = req.params;
    const { query } = require(`../../../mongo/models/${merchantid}`);
    query.find()
        .then(function (queries) {
            if (queries) {
                res.send(queries.map((query) => query.query));
            }
            else {
                res.status(404).send('Not found');
            }
        })
        .catch(function (err) {
            res.status(404).send(err.message);
        });
};

const insertQuery = (req, res) => {
    const { merchantid } = req.headers;
    const { query } = require(`../../../mongo/models/${merchantid}`);
    const { query: queryString } = req.body;

    const newQuery = new query();
    newQuery.query = queryString;
    newQuery.save()
        .then((savedQuery) => {
            res.status(200).send(savedQuery)
        })
        .catch(console.log);
};


module.exports = {
    getQueries,
    insertQuery,
};