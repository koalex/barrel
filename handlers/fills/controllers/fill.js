'use strict';

const Fill      = require('../models/fill');
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

    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    let fillsData = ctx.request.body;

    if (!fillsData || (fillsData.dt_c > 2 || fillsData.dt_c < 0) || !fillsData.sn || !fillsData.ctrl_dt) ctx.throw(400);

    let response  = await request('http://chronic.herokuapp.com/utc/now');
    let timeUTC   = response.body.match(/[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/)[0];
    let timeUTCs  = moment.utc(timeUTC).unix();

    if (typeof timeUTCs !== 'number') ctx.throw(500, i18n.__('GET_UTC_ERR'));

    let timeDiff = (Date.now() / 1000|0) - timeUTCs;

    if (timeDiff > 30 || timeDiff < -30) ctx.throw(500, i18n.__('UTC_SYNC_ERR'));

    switch (fillsData.dt_c) {
        case 0:
            fillsData.dt = moment.unix(fillsData.dt - 30).valueOf();
            break;
        case 1:
            fillsData.dt = moment.unix(fillsData.dt - 30).valueOf();
            break;
        case 2:
            // fill.dt = moment.utc(Number(timeUTCs + '000')).subtract(fill.dt, 'seconds').valueOf();
            // timeUTCs - (fill.ctrl_dt - fill.dt) TS1(счетчик МК) - TS2(когда был налив) = T ; TS3(таймстемп сервера) - Т = время налива;
            fillsData.dt = moment.utc(Number(timeUTCs + '000')).subtract((fillsData.ctrl_dt - fillsData.dt), 'seconds').valueOf();
            break;
        default:
            ctx.throw(400, i18n.__('WRONG_SYNC_CODE'));
            return;
    }

    try {
        let newFill     = new Fill(fillsData);
            newFill.ip  = ctx.request.ip;

        await newFill.save();
    } catch (err) {
        ctx.log.error(fillsData);
    }

    ctx.status = 204;
};

exports.get = async ctx => {
    if (ctx.query.disabled == 1) disabled = true;
    if (ctx.query.disabled == 0) disabled = false;
    if (disabled) {
        ctx.throw(500);
        return;
    }

    // TODO: сделать параметр для вывода наливов с ошибками

    ctx.body = await Fill.find({ err: false });

};