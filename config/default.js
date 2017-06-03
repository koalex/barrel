/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
/*
 ================================
 ===      DEFAULT CONFIG     ====
 ================================
*/

'use strict';

const join  = require('path').join;

module.exports =  {
             port: process.env.NODE_PORT ? process.env.NODE_PORT : 3000,
         siteName: 'BARREL',
         siteDesc: 'BARREL – умные насосы',
       siteAuthor: 'Konstantin Aleksandrov',
        authorUrl: 'https://vk.com/itplace',
      projectRoot: process.cwd(),
       publicRoot: join(process.cwd(), './public'),
    templatesRoot: join(process.cwd(), './client'),
        filesRoot: join(process.cwd(), '../files'),
           secret: 'flashback',

    roles: ['superuser', 'admin', 'vendor', 'distributor', 'companyadmin', 'manager', 'customer'],
    defaultLocale: 'ru',
    mongoose: {
        dbName: 'barrel',
        options: {
            server: {
                socketOptions: {
                    keepAlive: 1
                },
                poolSize: 5
            }
        }
    },
    crypto: {
        hash: {
            length: 128
        }
    },

    androidTopColor: '#02a4ec',
    copyright: 'Barrel group'
};


