let mongoose = require('mongoose');

let engagementSchema = new mongoose.Schema({
    pid: Number,
    sku: mongoose.Mixed,
    clickAt: Date,
    addAt: Date,
    purchaseAt: Date,
});

let userSchema = new mongoose.Schema({
    uid: {
        type: mongoose.Mixed,
        unique: true,
    },
    location: Object,
    device: Object,
    engagements: [engagementSchema],
});

export default mongoose.model('User', userSchema);
