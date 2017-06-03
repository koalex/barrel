/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
/*
 ================================
 ===    PRODUCTION CONFIG    ====
 ================================
 */

'use strict';

const defer = require('config/defer').deferConfig;

module.exports =  {
    // db.createUser({user: "koalex",pwd: "koalexbarrelpump1111", roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]})
    // db.createUser({user: "barrel",pwd: "barrelpump1111", roles: [ { role: "readWrite", db: "barrel" } ]})
    mongoose: {
        uri: defer(cfg => { return `mongodb://barrel:barrelpump1111@localhost:27017/${cfg.mongoose.dbName}`; }),
    },
    crypto: {
        hash: {
            iterations: 12000 // may be slow(!): iterations = 12000 take ~60ms to generate strong password
        }
    }
};


