let mongoose = require('mongoose');
let timestampPlugin = require('./plugins/timestamp');

let widgetSchema = new mongoose.Schema({
    merchantId: String,
    location: {
        type: String,
        enum: ['HOME_PAGE', 'PRODUCT_PAGE', 'CART_PAGE'],
    },
    noOfItems: Number,
    heading: String,
    type: {
        type: String,
        enum: ['SIMILAR', 'TRENDING', 'BEST_SELLING', 'INVENTORY'],
    },
});

let addToCartButtonSchema = new mongoose.Schema({
    label: String,
    onAddToCart: String,
});

let currencySchema = new mongoose.Schema({
    code: String,
    sign: String,
});

let attributeSchema = new mongoose.Schema({
    key: String,
    name: String,
});

let configSchema = new mongoose.Schema({
    widgets: [widgetSchema],
    createdBy: Number,
    addToCartButton: addToCartButtonSchema,
    currencies: [currencySchema],
    themedColor: String,
    gaUtmCode: String,
    affiliatePrefix: String,
    attributes: [attributeSchema],
});

configSchema.plugin(timestampPlugin);
const configModel = mongoose.model('Config', configSchema);

export default configModel;
