'use strict';

const fs            = require('fs');
const path          = require('path');
const join          = path.join;
const basename      = path.basename;
const config        = require('config');
const LocalStrategy = require('passport-local').Strategy;
const User          = require('../../user/models/user');
const CLS           = require('continuation-local-storage');
const i18n          = new (require('i18n-2'))({
    directory: join(__dirname, '../i18n'),
    locales: fs.readdirSync(join(__dirname, '../i18n')).map(localeFileName => basename(localeFileName, '.json')),
    defaultLocale: config.defaultLocale,
    extension: '.json'
});

module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
},
function (email, password, done) {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    User.findOne({ email: email, active: true }, function (err, user) {

        if (err) return done(err);
        if (!user) return done(null, false, { message: i18n.__('USER_NOT_FOUND') });
        if (!user.checkPassword(password)) return done(null, false, { message: i18n.__('WRONG_PASSWORD') });

        return done(null, user);
    });
});
