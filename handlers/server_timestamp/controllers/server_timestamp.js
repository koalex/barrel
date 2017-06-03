/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
 /* 
   ================================
   ===       MODULE NAME       ====
   ================================
   https://github.com/progrium/timeapi/tree/master
*/

'use strict';

const config   = require('config');
const moment   = require('moment');
const request  = require('co-request');
const join     = require('path').join;
const CLS      = require('continuation-local-storage');
const fs       = require('fs');
const basename = require('path').basename;
const i18n     = new (require('i18n-2'))({
    directory: join(__dirname, '../i18n'),
    locales: fs.readdirSync(join(__dirname, '../i18n')).map(localeFileName => basename(localeFileName, '.json')),
    defaultLocale: config.defaultLocale,
    extension: '.json'
});

let disabled = false;

module.exports = async ctx => {
    if (ctx.query.disabled == 1) disabled = true;
    if (ctx.query.disabled == 0) disabled = false;
    if (disabled) {
        ctx.throw(500);
        return;
    }
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    let response  = await request('http://chronic.herokuapp.com/utc/now');
    let timeUTC   = response.body.match(/[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}/)[0];
    let timeUTCs  = moment.utc(timeUTC).unix();

    if (typeof timeUTCs !== 'number') ctx.throw(500, i18n.__('GET_UTC_ERR'));

    let timeDiff = (Date.now() / 1000|0) - timeUTCs;

    if (timeDiff > 30 || timeDiff < -30) ctx.throw(500, i18n.__('UTC_SYNC_ERR'));

    ctx.body = JSON.stringify({ ts: timeUTCs });
};