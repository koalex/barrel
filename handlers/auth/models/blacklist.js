'use strict';

const fs        = require('fs');
const config    = require('config');
const mongoose  = require('../../../libs/mongoose');
const path      = require('path');
const join      = path.join;
const basename  = path.basename;
const CLS       = require('continuation-local-storage');
const i18n      = new (require('i18n-2'))({
    directory: join(__dirname, '../i18n'),
    locales: fs.readdirSync(join(__dirname, '../i18n')).map(localeFileName => basename(localeFileName, '.json')),
    defaultLocale: config.defaultLocale,
    extension: '.json'
});

const blackTokenSchema = new mongoose.Schema({
        token: { type: String }
    },
    { versionKey: false });

blackTokenSchema.path('token').validate(function (v) {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));
    if (!v || String(v).trim() === '') this.invalidate('token', i18n.__('TOKEN_REQUIRED'));
}, null);

module.exports = mongoose.model('BlackToken', blackTokenSchema);

