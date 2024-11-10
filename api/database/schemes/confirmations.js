const mongoose = require('mongoose');

const confirmationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('confirmations', confirmationSchema);