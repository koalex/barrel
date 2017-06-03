/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
 /* 
   ================================
   ===       MODULE NAME       ====
   ================================ 
*/

'use strict';

const fs        = require('fs');
const crypto    = require('crypto');
const config    = require('config');
const path      = require('path');
const join      = path.join;
const basename  = path.basename;
const moment    = require('moment');
const CLS       = require('continuation-local-storage');
const User      = require('../../user/models/user');
const mailer    = require('../../../libs/nodemailer');

const i18n      = new (require('i18n-2'))({
    directory: join(__dirname, '../i18n'),
    locales: fs.readdirSync(join(__dirname, '../i18n')).map(localeFileName => basename(localeFileName, '.json')),
    defaultLocale: config.defaultLocale,
    extension: '.json'
});

exports.email = async ctx => {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    let user = await User.findOne({ active: false, email_confirmation_token: ctx.request.body.email });

    if (!user){
        ctx.throw(404);
    } else {

        user.email_confirmation_token  = undefined;

        await user.save();

        await mailer(null, user.email, i18n.__('password_change_mail.SUBJECT'), null, `<p>${i18n.__('password_change_mail.TEXT1')} <a href="http://${ctx.request.headers.host}/password_reset/${token}">${ctx.request.headers.host}/password_reset/${token}</a> ${i18n.__('password_change_mail.TEXT2')}</p>`);

        ctx.body = { message: i18n.__('password_change_mail.TEXT3') + user.email + i18n.__('password_change_mail.TEXT4') };

    }
};

/*
exports.email = async ctx => {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    let user = await User.findOne({ active: false, email: ctx.request.body.email });

    if (!user){
        ctx.throw(400, i18n.__('USER_NOT_FOUND'));
    } else {

        let token = await new Promise((resolve, reject) => {
            crypto.randomBytes(20, (err, buf) => {
                if (err) reject(err);
                resolve(buf.toString('hex'));
            });
        });

        user.password_reset_token      = token;
        user.password_reset_expiration = Date.now() + 3600000; // 1 hour

        await user.save();

        await mailer(null, user.email, i18n.__('password_change_mail.SUBJECT'), null, `<p>${i18n.__('password_change_mail.TEXT1')} <a href="http://${ctx.request.headers.host}/password_reset/${token}">${ctx.request.headers.host}/password_reset/${token}</a> ${i18n.__('password_change_mail.TEXT2')}</p>`);

        ctx.body = { message: i18n.__('password_change_mail.TEXT3') + user.email + i18n.__('password_change_mail.TEXT4') };

    }
};*/
