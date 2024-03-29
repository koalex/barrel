/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
 /* 
   ================================
   ===       MODULE NAME       ====
   ================================ 
*/

'use strict';

const config              = require('config');
const User                = require('../../user/models/user');
const JwtStrategy         = require('passport-jwt').Strategy;
// const ExtractJwt          = require('passport-jwt').ExtractJwt;
const opts                = {};
      opts.secretOrKey    = config.secret;
      opts.ignoreExpiration = false;
      opts.jwtFromRequest = req => {
          let token = req.body.access_token || req.query.access_token || req.headers['x-access-token'] || req.cookies.get('x-access-token');
          return token;
      };
      // opts.jwtFromRequest = ExtractJwt.fromHeader('x-access-token');
      // opts.issuer         = 'accounts.barrel.com';
      // opts.audience       = 'barrel.com';

module.exports = new JwtStrategy(opts, (jwt_payload, done) => {
    User.findOne({ _id: jwt_payload.user_id, active: true }, (err, user) => {
        if (err) return done(err, false);

        if (user) {
            done(null, user);
        } else {
            done(null, false);
            // or you could create a new account
        }
    });
});
