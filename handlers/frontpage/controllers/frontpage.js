/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
 /*
   ================================
   ===       MODULE NAME       ====
   ================================
*/

'use strict';

const config      = require('config');
const CLS         = require('continuation-local-storage');
const fs          = require('fs');
const join        = require('path').join;
const basename    = require('path').basename;
const pkg         = require(join(config.projectRoot, 'package.json'));

const i18n        = new (require('i18n-2'))({
    directory: join(__dirname, '../i18n'),
    locales: fs.readdirSync(join(__dirname, '../i18n')).map(localeFileName => basename(localeFileName, '.json')),
    defaultLocale: config.defaultLocale,
    extension: '.json'
});

module.exports = async ctx => {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    ctx.type = 'html';
    ctx.render('index', {
        PAGE_TTILE: i18n.__('PAGE_TITLE'),
        APP_DESCRIPTION: i18n.__('APP_DESCRIPTION'),
        COPYRIGHT: i18n.__('COPYRIGHT'),
        CITY: i18n.__('CITY'),
        COUNTRY: i18n.__('COUNTRY'),
        STREET_ADDRESS: i18n.__('STREET_ADDRESS'), // Карла Маркса 7
        PLACENAME: i18n.__('PLACENAME'), // город Новосибирск, Россия
        REGION: i18n.__('REGION'), // RU-город Новосибирск
        author: pkg.author.name,
        homepage: pkg.homepage,
        appName: pkg.name,

    });
};