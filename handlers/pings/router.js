/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===      SERVER ROUTER       ===
 ================================
*/

'use strict';

const Router    = require('koa-router');
const APIv1     = new Router({ prefix: '/api/v1' });

APIv1.get('/pings',  require('./controllers/ping').get);
APIv1.post('/pings', require('./controllers/ping').post);

module.exports = [APIv1];