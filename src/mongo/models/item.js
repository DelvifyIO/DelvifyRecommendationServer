let mongoose = require('mongoose');

let statSchema = new mongoose.Schema({
    display: {
        type: Number,
        default: 0,
    },
    enlarge: {
        type: Number,
        default: 0,
    },
    click: {
        type: Number,
        default: 0,
    },
    add_cart_from_detail: {
        type: Number,
        default: 0,
    },
    add_cart_from_widget: {
        type: Number,
        default: 0,
    },
    purchase: {
        type: Number,
        default: 0,
    }
});

statSchema.virtual('add_cart').get(function() {
    return this.add_cart_from_detail + ' ' + this.add_cart_from_widget
});

let itemSchema = new mongoose.Schema({
    pid: {
        type: Number,
    },
    sku: {
        type: String,
    },
    stat: statSchema,
});

export default mongoose.model('Item', itemSchema);
