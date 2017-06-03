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

exports.forgot = async ctx => {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    if (!/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(ctx.request.body.email)) ctx.throw(400);

    let user = await User.findOne({ email: ctx.request.body.email });

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
};

exports.reset = async ctx => {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    let user = await User.findOne({ password_reset_token: ctx.params.reset_token });

    if (!user) ctx.throw(404);

    if (moment(user.password_reset_expiration).valueOf() - moment(Date.now()).valueOf() < 0) {
        ctx.throw(410, i18n.__('PASSWORD_RESET_ELAPSED'));
    } else {
        user.password                  = ctx.request.body.password;
        user.passwordConfirmation      = ctx.request.body.password;
        user.password_reset_token      = undefined;
        user.password_reset_expiration = undefined;

        await user.save();

        ctx.body = { message: i18n.__('PASSWORD_CHANGE_SUCCESS') };
    }
};