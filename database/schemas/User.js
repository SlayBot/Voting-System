const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: { type: String,  required: true },
    wallet: { type: String },
    lastVoted: { type: Number },
    votes: { type: Number }
});


module.exports = mongoose.model('User', userSchema);
