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

    if (!fillsData || !fillsData.sn) ctx.throw(400); // проверка наличия SN в нулевом элементе массива

    let fills = fillsData.d;

    if (!Array.isArray(fills)) ctx.throw(400);

    for (let i = 0, l = fills.length; i < l; i++) {
        if (!fills[i] || (fills[i].dt_c > 2 || fills[i].dt_c < 0) || !fills[i].ctrl_dt) ctx.throw(400);

        switch (fills[i].dt_c) {
            case 0:
                'OK';
                break;
            case 1:
                'OK';
                break;
            case 2:
                'OK';
                break;
            default:
                ctx.throw(400, i18n.__('WRONG_SYNC_CODE'));
                return;
        }
    }

    let response  = await request('http://chronic.herokuapp.com/utc/now');
    let timeUTC   = response.body.match(/[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/)[0];
    let timeUTCs  = moment.utc(timeUTC).unix();

    if (typeof timeUTCs !== 'number') ctx.throw(500, i18n.__('GET_UTC_ERR'));

    let timeDiff = (Date.now() / 1000|0) - timeUTCs;

    if (timeDiff > 30 || timeDiff < -30) ctx.throw(500, i18n.__('UTC_SYNC_ERR'));

    for (let i = 0, l = fills.length; i < l; i++) {
        switch (fills[i].dt_c) {
            case 0:
                fills[i].dt = moment.unix(fills[i].dt - 30).valueOf();
                break;
            case 1:
                fills[i].dt = moment.unix(fills[i].dt - 30).valueOf();
                break;
            case 2:
                // fill.dt = moment.utc(Number(timeUTCs + '000')).subtract(fill.dt, 'seconds').valueOf();
                // timeUTCs - (fill.ctrl_dt - fill.dt) TS1(счетчик МК) - TS2(когда был налив) = T ; TS3(таймстемп сервера) - Т = время налива;
                fills[i].dt = moment.utc(Number(timeUTCs + '000')).subtract((fills[i].ctrl_dt - fills[i].dt), 'seconds').valueOf();
                break;
            default:
                ctx.throw(400, i18n.__('WRONG_SYNC_CODE'));
        }

        try {
            fills[i].sn = fillsData.sn;

            let newFill     = new Fill(fills[i]);
                newFill.ip  = ctx.request.ip;

            await newFill.save();
        } catch (err) {
            ctx.log.error(fills[i])
        }
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