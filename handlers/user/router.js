/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ✰✰✰ ***/

/*
 ================================
 ===        USER ROUTER       ===
 ================================
*/

'use strict';

const Router        = require('koa-router');
const Api           = new Router({ prefix: '/api' });
const users         = require('./controllers/users');

Api.get('/me',                        users.getMe);
// Api.get('/users',                     users.getAll);
Api.get('/users/:id',                 users.getOne);
Api.get('/users',                    users.create);
Api.put('/users/:id',                 users.update);
Api.del('/users/:id',                 users.delete);

module.exports = [Api];