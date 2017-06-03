/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===           ROUTER         ===
 ================================
 */

'use strict';

const config   = require('config');
const Router   = require('koa-router');
const fs       = require('fs');
const join     = require('path').join;
const basename = require('path').basename;
const CLS      = require('continuation-local-storage');
const i18n     = new (require('i18n-2'))({
    directory: join(__dirname, './i18n'),
    locales: fs.readdirSync(join(__dirname, './i18n')).map(localeFileName => basename(localeFileName, '.json')),
    defaultLocale: config.defaultLocale,
    extension: '.json'
});

const API = new Router({ prefix: '/api' });

API.get('/:version/docs', async ctx => {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    ctx.type = 'html';
    ctx.render('swagger/swagger', {
        path: ctx.req.url,
        pageTitle: i18n.__('PAGE_TITLE')
    });
});

API.get('/:version/docs/api.json', async ctx => require('./controllers/docs')(ctx));

module.exports = [API];

