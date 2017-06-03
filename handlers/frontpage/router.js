/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===           ROUTER         ===
 ================================
 */

'use strict';

const Router = require('koa-router');
const router = new Router();

router.get('/', require('./controllers/frontpage'));

module.exports = [router];

module.exports.socket = socket => {
    socket.io
        .of('/api')
        .on('connection', client => {
            // s.join('some room')
            socket.emitter.of('/api').emit('message', 'OF vasya123456!!!')
            socket.emitter.in('/test').emit('message', 'IN vasya123456!!!')
            socket.emitter.to('/test').emit('message', 'TO vasya123456!!!')
        });

    socket.io
        .of('/public')
        .on('connection', client => {
            socket.emitter.broadcast.of('/public').emit('message', { test: 123 })
        });
};