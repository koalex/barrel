/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
 /* 
   ================================
   ===        DEV CONFIG       ====
   ================================ 
*/

'use strict';

const defer         = require('config/defer').deferConfig;
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
    mongoose: {
        uri: defer(cfg => { return `mongodb://barrel:barrelpump1111@localhost:27017/${cfg.mongoose.dbName}`; }),
        options: {
            server: {
                socketOptions: {
                    connectTimeoutMS: isDevelopment ? 10000 : 0,
                    socketTimeoutMS: isDevelopment ? 10000 : 0
                },
                poolSize: 5
            }
        }
    },
    crypto: {
        hash: {
            iterations: 1
        }
    }
};


