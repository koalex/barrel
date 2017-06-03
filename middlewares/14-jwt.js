/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ==================================
 ===   Access Control via JWT   ===
 ==================================
 */

'use strict';

const config      = require('config');
const passport    = require('koa-passport');
const normalize   = require('path').normalize;
const jwt         = require('jsonwebtoken');
const BlackList   = require('../handlers/auth/models/blacklist');

passport.use('jwt', require('../handlers/auth/strategies/jwt'));

module.exports = async (ctx, next) => {
    let url = normalize(ctx.request.url);

    if (url.startsWith('/api-TEST') && !url.startsWith('/api/signin')) {

        await passport.authenticate('jwt', async (err, user, info, status) => {

            if (err) ctx.throw(err);
            if (!user) ctx.throw(401);
            if (info && info.name && info.name === 'TokenExpiredError') ctx.throw(401);

            let token  = ctx.request.body.access_token || ctx.query.access_token || ctx.headers['x-access-token'] || ctx.cookies.get('x-access-token');

            let denied = await BlackList.findOne({ token: token });

            if (denied || (jwt.verify(token, config.secret).token_uuid !== user.token_uuid)) {
                ctx.throw(401);
                return;
            }

            user.last_activity   = Date.now();
            user.last_ip_address = ctx.request.ip;

            await user.save();

            ctx.state.user = user;

            await next();

        })(ctx, next);

    } else {
        await next();
    }
};