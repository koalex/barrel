'use strict';

const Ping      = require('../models/ping');
const config    = require('config');
const fs        = require('fs');
const join      = require('path').join;
const basename  = require('path').basename;
const request   = require('co-request');
const moment    = require('moment');
const CLS       = require('continuation-local-storage');
const i18n      = new (require('i18n-2'))({
    directory: join(__dirname, '../i18n'),
    locales: fs.readdirSync(join(__dirname, '../i18n')).map(localeFileName => basename(localeFileName, '.json')),
    defaultLocale: config.defaultLocale,
    extension: '.json'
});

let disabled = false;

exports.post = async ctx => {
    if (disabled) {
        ctx.throw(500);
        return;
    }
    let ping = ctx.request.body;

    if (!ping || (ping.dt_c > 2 || ping.dt_c < 0)) ctx.throw(400);

    // FIXME: move to model validation
    i18n.setLocale(CLS.getNamespace('app').get('locale'));
    switch (ping.dt_c) {
        case 0:
            ping.dt = moment.unix(ping.dt).valueOf();
            break;
        case 1:
            ping.dt = moment.unix(ping.dt - 60).valueOf();
            break;
        case 2:
            let response  = await request('http://chronic.herokuapp.com/utc/now');
            let timeUTC   = response.body.match(/[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/)[0];
            let timeUTCs  = moment.utc(timeUTC).unix();

            if (typeof timeUTCs !== 'number') ctx.throw(500, i18n.__('GET_UTC_ERR'));

            let timeDiff = (Date.now() / 1000|0) - timeUTCs;

            if (timeDiff > 30 || timeDiff < -30) ctx.throw(500, i18n.__('UTC_SYNC_ERR'));

            ping.dt = moment.utc(Number(timeUTCs + '000')).subtract(ping.dt, 'seconds').valueOf();
            break;
        default:
            ctx.throw(400, i18n.__('WRONG_SYNC_CODE'));
    }

    let newPing    = new Ping(ping);
        newPing.ip = ctx.request.ip;

    await newPing.save();

    ctx.status = 204;
};

exports.get = async ctx => {
    if (ctx.query.disabled == 1) disabled = true;
    if (ctx.query.disabled == 0) disabled = false;
    if (disabled) {
        ctx.throw(500);
        return;
    }
    ctx.body = await Ping.find();

};