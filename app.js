require('dotenv').config();
const express = require('express');
const app = express();
const DBL = require('@top-gg/sdk');
const mongoose = require('mongoose');
const User = require('./database/schemas/User');
const webhook = new DBL.Webhook(process.env.DBL_STRING);
const logger = require('./logger');
const fetch = require('node-fetch');
const DiscordWebhook = require('webhook-discord');
const Hook = new DiscordWebhook.Webhook(process.env.DISCORD_WEBHOOK_URL)

const port = process.env.PORT || process.env.port - 1 + 2

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI environment variable required');
if (!process.env.DBL_STRING) throw new Error('DBL_STRING environment variable required');
if (!process.env.TOKEN) throw new Error('TOKEN environment variable required');
if (!process.env.PORT) throw new Error('PORT environment variable required. How can you run the app without a port? Wake up');

mongoose.connection.on('connected', () => logger.log('Mongoose connected', { color: 'green', tags: ['INFO', 'DATABASE'] }))

app.post('/dblwebhook', webhook.middleware(), async (req) => {
    let credits = req.vote.isWeekend ? 2000 : 1000;

    const apiUser = await fetch(`https://discord.com/api/v8/users/${req.vote.user}`, {
        headers: { Authorization: `Bot ${process.env.TOKEN}`}
    }).then(res => res.json());

    logger.log(`${apiUser.username} (${req.vote.user}) just voted ${process.env.BOT_NAME || 'your bot'}! Rewarded the user with $${credits}!`, { color: 'green', tags: ['DBL', 'DATABASE'] })

    const msg = new DiscordWebhook.MessageBuilder()
        .setName(process.env.BOT_NAME || 'Voting System')
        .setAvatar('https://res.cloudinary.com/slaybot/image/upload/v1614951440/4c413f886725571f2af26e547030dd1a_avpqwm.png')
        .setColor('#7289DA')
        .setTitle(`${apiUser.username} voted SlayBot`)
        .setDescription(`Thank you **${apiUser.username}#${apiUser.discriminator}** (${apiUser.id}) for voting **${process.env.BOT_NAME}**!\nYou have been rewarded with $${credits} to your wallet`)
    Hook.send(msg);

    await User.findOneAndUpdate({ discordId: req.vote.user }, { wallet: parseInt(userSettings.wallet) + credits || credits,  votes: userSettings.votes + 1 || 1, lastVoted: Date.now() }, { upsert: true })
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
