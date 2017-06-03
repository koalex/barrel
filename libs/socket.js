/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===           SOCKET         ===
 ================================
 */

'use strict';

const config 		= require('config');
const socketIO 		= require('socket.io');
const socketEmitter = require('socket.io-emitter');
const socketIORedis = require('socket.io-redis');
const redisClient 	= require('redis').createClient({ host: 'localhost', port: 6379 });
const Cookies 		= require('cookies');
const User          = require('../handlers/user/models/user');
const jwt           = require('jsonwebtoken');
const BlackList     = require('../handlers/auth/models/blacklist');


function Socket (server) {
    let io = socketIO(server);

    io.adapter(socketIORedis({ host: 'localhost', port: 6379 }));

    io.of('/api').use((socket, next) => {
        // return next();
        (async () => {
            let handshakeData = socket.request; // http request
            const cookies     = new Cookies(handshakeData, {}, config.secret);

            let token;

            if (handshakeData.query && handshakeData.query.access_token) token = handshakeData.query.access_token;
            if (handshakeData._query && handshakeData._query.access_token) token = handshakeData._query.access_token;
            if (handshakeData.headers && handshakeData.headers['x-access-token']) token = handshakeData.headers['x-access-token'];
            if (cookies.get('x-access-token')) token = cookies.get('x-access-token');

            if (!token) return await next(new Error({ status: 401, message: 'Unauthorized' }));

            // FIXME: проверить на срок действия токена
            let jwt_payload = jwt.verify(token, config.secret);

            let denied = await BlackList.findOne({ token: token }).lean().exec();

            let user = await User.findOne({ _id: jwt_payload.user_id, active: true });

            if (denied || (jwt_payload.token_uuid !== user.token_uuid)) {
                return await next(new Error({ status: 401, message: 'Unauthorized' }));
            }

            user.last_activity   = Date.now();
            user.last_ip_address = socket.request.ip;
            user.socket_ids      = user.socket_ids ? user.socket_ids.concat(socket.id) : [socket.id];

            await user.save();

            socket.user = user;

            socket.on('disconnect', () => {

                (async () => {
                    try {
                        let user = await User.findOne({ _id: user._id }); // no matter active or not

                        if (user) {
                            user.socket_ids.splice(user.socket_ids.indexOf(socket.id), 1);
                            await user.save();
                        }
                    } catch (err) {
                        console.error('session clear error', err);
                    }
                })();

            });

            await next();

        })();

    });

    io.of('/api').on('connection', socket => {
        socket.emit('test', 123);
    });

    return io;
}

Socket.emitter = socketEmitter(redisClient);
Socket.emitter.redis.on('error', err => { console.error(err); });


/*

Socket.emitter.volatile.in('room').emit()
Socket.emitter.volatile.to('room').emit()
Socket.emitter.volatile.of('room').emit()

// Every sockets but the sender
Socket.emitter.broadcast.in('room').emit()
Socket.emitter.broadcast.to('room').emit()
Socket.emitter.broadcast.of('room').emit()

Socket.emitter.json.in('room').emit()
Socket.emitter.json.to('room').emit()
Socket.emitter.json.of('room').emit()

*/


module.exports = Socket;
