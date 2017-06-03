/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===           ROUTER         ===
 ================================
*/

'use strict';

const Router = require('koa-router');
const APIv1  = new Router({ prefix: '/api/v1' });

APIv1.get('/server_timestamp', require('./controllers/server_timestamp'));

module.exports = [APIv1];