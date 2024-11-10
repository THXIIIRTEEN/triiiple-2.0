const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    email: { type: String, required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '1h' } 
});

const Verification = mongoose.model('Verification', verificationSchema);

module.exports = Verification;
