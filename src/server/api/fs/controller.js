import request from 'request';
import csv from 'csvtojson';
import xml2js from 'xml2js';
import fetch from 'node-fetch';
import { RDSDataService } from 'aws-sdk';
import fs from 'fs';
import parser from './parser';

const resourceArn = process.env.RESOURCE_ARN;
const secretArn = process.env.SECRET_ARN;
const database = process.env.DATABASE;

const rdsdataservice = new RDSDataService({apiVersion: '2018-08-01', region: 'us-east-1', accessKeyId: process.env.RDS_ACCESS_KEY, secretAccessKey: process.env.RDS_SECRET_ACCESS_KEY });

const parseCatalog = async (req, res) => {
    const { userID } = req.params;
    const { productAPI, type } = req.body;
    if (!req.file && !productAPI) {
        return res.status(400).send('No file and productAPI');
    }
    try {
        const result = await fetch(productAPI);
        let newProducts = [];
        if (type === 'csv') {
            try {
                const text = await result.text();
                newProducts = await csv({ flatKeys: true }).fromString(text);
            } catch (e) {
                console.error(e);
                throw new Error('Incorrect format. Please provide a csv file.');
            }
        } else if (type === 'xml') {
            try {
                const text = await result.text();
                const xmlParser = new xml2js.Parser();
                xmlParser.parseString(text, (err, result) => {
                    if (err || !result) throw new Error('Unable to parse XML.');
                    let json = null;
                    if (result.rss || result['rdf:RDF']) {
                        // rss1
                        if (result['rdf:RDF']) {
                            result = result['rdf:RDF'];
                        }
                        const channel = result.rss.channel[0];
                        const items = channel.item;
                        items.forEach((item) => {
                            const parsedItem = {};
                            Object.keys(item).forEach((key) => {
                                parsedItem[key] = item[key][0];
                            });
                            newProducts.push(parsedItem);
                        })
                    } else {
                        json = result;
                        while (!Array.isArray(json)) {
                            json = json[Object.keys(json)[0]];
                        }
                        if (!Array.isArray(json)) {
                            throw new Error('Unable to parse XML.');
                        }
                        newProducts = json.map(item => {
                            Object.keys(item).forEach((key) => {
                                item[key] = item[key].join();
                            });
                            return item;
                        });
                    }
                });
            } catch (e) {
                console.error(e);
                throw new Error('Incorrect format. Please provide a xml file.');
            }
        } else {
            try {
                const json = await result.json();
                let products = [];
                if (Array.isArray(json)){
                    products = json;
                } else {
                    Object.keys(json).forEach((key) => {
                        if (Array.isArray(json[key])) {
                            products = json[key];
                        }
                    });
                };
                if (products.length <= 0) throw new Error('No products');
                newProducts = products.map((product) => {
                    return parser(product).product;
                });
            } catch (e) {
                console.error(e);
                throw new Error('Incorrect format. Please provide a json file.');
            }
        }
        res.json(newProducts);
    } catch (err) {
        return res.status(400).send(err.message);
    }
};

const uploadCatalog = (req, res) => {
    const { userID } = req.params;
    if (!req.file) {
        return res.status(400).send('No file');
    }
    const file = req.file;
    const formData = { file: {
        value: file.buffer,
            options: {
                filename: file.originalname
            },
    } };
    request.post({ url: `http://18.162.143.188:5000/${userID}/uploadCatalog`, formData: formData }, (err, httpResponse, body) => {
        if (err) {
            return res.status(400).send(err.message);
        }
        res.send({ message: body });
    });
};

const storeCatalog = async (req, res) => {
    const { userID } = req.params;
    if (!req.file) {
        return res.status(400).send('No file');
    }
    const { buffer } = req.file;
    try {
        let products = JSON.parse(buffer.toString('utf8'));
        res.send({ message: 'uploaded' });
        try {
            let count = 0;
            const { transactionId } = await rdsdataservice.beginTransaction({ resourceArn, secretArn, database }).promise();
            while (products.length > 0) {
                const storeProducts = products.splice(0, 1000);
                const { updateResults } = await rdsdataservice.batchExecuteStatement({
                    resourceArn,
                    secretArn,
                    database,
                    sql: 'INSERT INTO Products(userID, SKU, Name, Brand, Description, Category, Image, OriginalUrl, Price, Currency) ' +
                        'VALUES (:userID, :sku, :name, :brand, :description, :category, :image, :originalUrl, :price, :currency) ' +
                        'ON DUPLICATE KEY UPDATE Name=:name, Brand=:brand, Description=:description, Image=:image, OriginalUrl=:originalUrl, Price=:price, Currency=:currency',
                    parameterSets: storeProducts.map((product) => { return ([
                        { name: "userID", value: { stringValue: userID } },
                        { name: "sku", value: { stringValue: product.SKU } },
                        { name: "name", value: { stringValue: product.Name } },
                        { name: "brand", value: { stringValue: product.Brand } },
                        { name: "description", value: { stringValue: product.Description } },
                        { name: "category", value: { stringValue: product.Category } },
                        { name: "image", value: { stringValue: product.Image } },
                        { name: "originalUrl", value: { stringValue: product.OriginalUrl } },
                        { name: "price", value: { doubleValue: product.Price } },
                        { name: "currency", value: { stringValue: product.Currency } },
                    ]); }),
                    transactionId,
                }).promise();
                console.log(`Stored items: ${count += updateResults.length}`);
            }
            const result = await rdsdataservice.commitTransaction({ resourceArn, secretArn, transactionId }).promise();
            console.log(`Done. Stored items: ${count}`);
        } catch (e) {
            console.error(e);
        }
    } catch (err) {
        console.error(err);
        return res.status(400).send(err.message);
    }
};

module.exports = {
    uploadCatalog,
    parseCatalog,
    storeCatalog,
};