const express = require('express');
const app = express();
const DBL = require('@top-gg/sdk');
const cors = require('cors');
const User = require('../database/schemas/User');
const webhook = new DBL.Webhook('6u4rjhtdggj964trhum'); // random string because yes

const port = 5001 || 5003 // available ports for Slayer's Raspberry

module.exports = async bot => {
    app.use("/api/", require("./routes/api")(bot));

    app.post('/dblwebhook', webhook.middleware(), async (req, res) => {
        let amount = req.vote.isWeekend ? 2000 : 1000

        if (req.vote.type === 'test') return console.log(req.vote);

        const userSettings = await User.findOne({ discordId: req.vote.user });

        console.log(req.vote.user)

        if (!userSettings) return User.create({ discordId: req.vote.user, wallet: amount });
        await userSettings.updateOne({ wallet: userSettings.wallet + amount || amount })
    });

    app.listen(port);
    process.send({ name: "info", msg: `Webserver running on ${port}` });
}