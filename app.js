require('dotenv').config();
const express = require('express');
const app = express();
const DBL = require('@top-gg/sdk');
const mongoose = require('mongoose');
const User = require('./database/schemas/User');
const webhook = new DBL.Webhook(process.env.DBL_STRING);
const logger = require('./logger');
const fetch = require('node-fetch');

const port = process.env.PORT || process.env.port - 1 + 2

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI environment variable required');
if (!process.env.DBL_STRING) throw new Error('DBL_STRING environment variable required');
if (!process.env.TOKEN) throw new Error('TOKEN environment variable required');
if (!process.env.PORT) throw new Error('PORT environment variable required. How can you run the app without a port? Wake up');


mongoose.connection.on('connected', () => logger.log('Mongoose connected', { color: 'green', tags: ['INFO', 'DATABASE'] }))

app.post('/dblwebhook', webhook.middleware(), async (req) => {
    let credits = req.vote.isWeekend ? 2000 : 1000;

    const apiUser = await fetch(`https://discord.com/api/v8/users/${req.vote.user}`, {
        headers: {
          Authorization: `Bot ${process.env.TOKEN}`
        }
    }).then(res => res.json());

    logger.log(`${apiUser.username} (${req.vote.user}) just voted ${process.env.BOT_NAME || 'your bot'}! Rewarded the user with $${credits}!`, { color: 'green', tags: ['DBL', 'DATABASE'] })

    const userSettings = await User.findOne({ discordId: req.vote.user });
    if (!userSettings) return User.create({ discordId: req.vote.user, wallet: credits, votes: 1, lastVoted: Date.now() });

    await userSettings.updateOne({ wallet: userSettings.wallet + credits || credits,  votes: userSettings.votes + 1 || 1, lastVoted: Date.now()});
});

app.listen(port, () => {
    logger.log(`Webserver running on ${port}`, { color: 'green', tags: ['INFO', 'SERVER'] });

    mongoose.connect(process.env.MONGODB_URI, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch(err => {
        throw new Error(err)
    });
});