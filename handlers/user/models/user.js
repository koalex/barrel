/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===        USER MODEL        ===
 ================================
*/

'use strict';

const fs       = require('fs');
const mongoose = require('../../../libs/mongoose');
const history  = require('mongoose-version');
const crypto   = require('crypto');
const config   = require('config');
const uuid     = require('uuid');
const path     = require('path');
const join     = path.join;
const basename = path.basename;
const CLS      = require('continuation-local-storage');
const i18n     = new (require('i18n-2'))({
  directory: join(__dirname, '../i18n'),
  locales: fs.readdirSync(join(__dirname, '../i18n')).map(localeFileName => basename(localeFileName, '.json')),
  defaultLocale: config.defaultLocale,
  extension: '.json'
});
const isDevelopment = process.env.NODE_ENV === 'development';

const userSchema = new mongoose.Schema({
    active: { type: Boolean, default: false, required: true },
    deleted: { type: Boolean, default: false, required: true },
    name: { type: String, trim: true },
    surname: { type: String, trim: true },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatar: { type: String },
    role: { type: String },
    phone: { type: String, trim: true },
    skype: { type: String, trim: true },
    accounts: {
        vk               : {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        },
        facebook         : {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        },
        twitter          : {
            id           : String,
            token        : String,
            displayName  : String,
            username     : String
        },
        google           : {
            id           : String,
            token        : String,
            email        : String,
            name         : String
        }
    },
    settings: { },
    push_id: { type: String },
    password_reset_token: { type: String },
    password_reset_expiration: { type: Date },
    email_confirmation_token: { type: String, default: uuid() }, // FIXME: uuid() or uuid ?
    token_uuid: { type: String },
    password_hash: { type: String, required: true },
    salt: { required: true, type: String },
    created_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    socket_ids: { type: [ String ] },
    last_activity: { type: Date, default: Date.now },
    last_updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    last_updated_at: { type: Date, required: true, default: Date.now },
    last_ip_address: { type: String },

    // for transactions implementation
    updated: { type: mongoose.Schema.Types.Mixed, default: null},
    tx: { type: mongoose.Schema.Types.ObjectId, default: null }
},
{
    versionKey: false,
    autoIndex: isDevelopment,
    id: false,
    minimize: true,
    // safe: { j: 1, w: 2, wtimeout: 10000 }, // only if replica
    retainKeyOrder: true
});


userSchema.virtual('passwordConfirmation')
    .set(function (v) { this._passwordConfirmation = v; })
    .get(function ()  { return this._passwordConfirmation; });

userSchema.virtual('password')
    .set(function (password) {
        this._password     = password;
        this.salt          = crypto.randomBytes(config.crypto.hash.length).toString('base64');
        this.password_hash = crypto.pbkdf2Sync(password, this.salt, config.crypto.hash.iterations, config.crypto.hash.length, 'sha512');
    })
    .get(function () { return this._password; });

userSchema.methods.checkPassword = function (password) {
    if (!password) return false;
    if (!this.password_hash) return false;
    return String(crypto.pbkdf2Sync(password, this.salt, config.crypto.hash.iterations, config.crypto.hash.length, 'sha512')) === this.password_hash;
};

userSchema.path('password_hash').validate(function (v) {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    let validateMessages = [];

    if (this._password || this._passwordConfirmation) {

        if (this._password.length < 6) validateMessages.push(i18n.__('MIN_6_CHAR'));
        if (this._password.length > 20) validateMessages.push(i18n.__('MAX_20_CHAR'));
        if (!/([0-9]{1,})/.test(this._password)) validateMessages.push(i18n.__('MUST_CONTAINS_DIGIT'));
        if (!/([a-zа-яA-ZА-Я]{1,})/.test(this._password)) validateMessages.push(i18n.__('MUST_CONTAINS_LETTER'));
        if (this._password !== this._passwordConfirmation) validateMessages.push(i18n.__('PASSWORDS_DO_NOT_MATCH'));

        if (validateMessages.length !== 0) this.invalidate('password', validateMessages.join(', '));

    }
}, null);

userSchema.path('name').validate(function (v) {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));
    if (!v || String(v).trim() === '') this.invalidate('name', i18n.__('NAME_REQUIRED'));
    if (v.length > 100) this.invalidate('name', i18n.__('NAME_TO_LONG'));
}, null);

userSchema.path('surname').validate(function (v) {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));
    if (!v || String(v).trim() === '') this.invalidate('surname', i18n.__('SURNAME_REQUIRED'));
    if (v.length > 100) this.invalidate('surname', i18n.__('SURNAME_TO_LONG'));
}, null);

userSchema.path('email').validate(function (v) {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));
    if (!v || String(v).trim() === '') this.invalidate('email', i18n.__('EMAIL_REQUIRED'));
    if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v)) this.invalidate('email', i18n.__('WRONG_EMAIL'));
}, null);

userSchema.path('phone').validate(function (v) {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));
    if (!v || String(v).trim() === '') this.invalidate('phone', i18n.__('PHONE_REQUIRED'));
    if (v.length > 20 || v.length < 4 || !String(v).match(/\d/g) || String(v).match(/\d/g).length < 4 || String(v).match(/\d/g).length > 20) this.invalidate('phone', i18n.__('WRONG_PHONE'));
}, null);

userSchema.path('role').validate(function (v) {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));
    if (!v || String(v).trim() === '') this.invalidate('role', i18n.__('ROLE_REQUIRED'));
    if (!config.roles.some(role => role === v)) this.invalidate('role', i18n.__('WRONG_ROLE'));
}, null);

userSchema.methods.toJSON = function () {
    let data = this.toObject();
    delete data.updated;
    delete data.tx;
    delete data.password_hash;
    delete data.salt;
    delete data.email_confirmation_token;
    delete data.password_reset_token;
    delete data.password_reset_expiration;
    delete data.socket_ids;

    /*delete data.last_ip_address;
    delete data.push_id;
    delete data.token_uuid;

    // TODO: only for superuser & admin
    /*delete data.last_updated_by;
    delete data.last_updated_at;
    delete data.created_by;*/
    return data;
};

userSchema.plugin(history, {
    collection: 'users_history',
    suppressVersionIncrement: true,
    suppressRefIdIndex: false,
    strategy: 'array',
    ignorePaths: [
        'last_ip_address',
        'last_activity',
        'salt',
        'push_id',
        'token_uuid',
        'password_reset_token',
        'password_reset_expiration',
        'email_confirmation_token',
        'updated',
        'tx'
    ]
});

module.exports = mongoose.model('User', userSchema);