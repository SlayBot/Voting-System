require('dotenv').config()
const express = require('express');
const app = express();
const DBL = require('@top-gg/sdk');
const mongoose = require('mongoose')
const User = require('./database/schemas/User');
const webhook = new DBL.Webhook(process.env.DBL_STRING); // random string because yes

const port = 5001 || 5003 // available ports for Slayer's Raspberry

if (!process.env.MONGODB_URI) throw Error('MONGODB_URI environment variable required');
if (!process.env.DBL_STRING) throw Error('DBL_STRING environment variable required');

mongoose.connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(console.log('[INFO] Mongoose connected')).catch(err => {
    console.log('[ERROR]' + err)
})

app.post('/dblwebhook', webhook.middleware(), async (req, res) => {
    let amount = req.vote.isWeekend ? 2000 : 1000

    if (req.vote.type === 'test') console.log(req.vote);

    const userSettings = await User.findOne({ discordId: req.vote.user });

    console.log(req.vote.user)

    if (!userSettings) return User.create({ discordId: req.vote.user, wallet: amount });
    await userSettings.updateOne({ wallet: userSettings.wallet + amount || amount })
});

app.listen(port);
console.log(`[INFO] Webserver running on ${port}`)