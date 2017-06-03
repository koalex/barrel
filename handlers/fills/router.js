/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===      SERVER ROUTER       ===
 ================================
*/

'use strict';

const Router    = require('koa-router');
const APIv1     = new Router({ prefix: '/api/v1' });

APIv1.get('/fills',  require('./controllers/fill').get);
APIv1.post('/fills', require('./controllers/fill').post);

module.exports = [APIv1];