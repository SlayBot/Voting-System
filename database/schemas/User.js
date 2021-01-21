const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true
    },
    wallet: Number,
    bank: Number,
    lastDaily: Number,
    lastWeekly: Number,
    lastMonthly: Number,
    lastRep: Number,
    lastWork: Number,
    lastCrime: Number,
    lastVoted: Number,
    votes: Number
});


module.exports = mongoose.model('User', userSchema);