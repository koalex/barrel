/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===   GLOBAL ERR HANDLER     ===
 ================================
 */

'use strict';

const isDevelopment   = process.env.NODE_ENV === 'development';
const normalize       = require('path').normalize;

function validationErr (err, errKeys) {

    let msgs = [];

    errKeys.forEach(errKey => { msgs.push(err.errors[errKey].message); });

    return msgs;

}

module.exports = async (ctx, next) => {

    try {

        await next();

        if (ctx.response && ctx.response.status && ctx.response.status == 404) ctx.throw(404);

    } catch (err) {

        if (isDevelopment) console.error(err);

        if (err.errorType) { // Browser error

            let report = {
                status: err.status,
                agent: err.agent,
                url: err.url,
                file: err.file,
                line: err.line,
                column: err.column,
                stack: err.stack,
                errorType: err.errorType,
                message: err.message,
                originalMessage: err.originalMessage,
                referer: ctx.get('referer'),
                cookie: ctx.get('cookie')
            };

            ctx.log.error(report);

        } else {
            let report = {
                status: err.status,
                message: err.message,
                stack: err.stack,
                url: ctx.request.url,
                referer: ctx.get('referer'),
                cookie: ctx.get('cookie')
            };

            if (!err.expose) report.requestVerbose = ctx.request; // dev error

            ctx.log.error(report);
        }

        let preferredType = ctx.accepts('html', 'json');
        let url           = normalize(ctx.request.url);

        if (url.startsWith('/api')) preferredType = 'json';

        if (preferredType === 'json') {
            if (err.code === 11000) err.status = 409;

            let message     = err.name === 'ValidationError' || err.name === 'ValidatorError' ? validationErr(err, Object.keys(err.errors)) : isDevelopment ? err.message : 'Server error';
            let statusCode  = err.name === 'ValidationError' || err.name === 'ValidatorError' ? 400 : err.status ? err.status : err.statusCode ? err.statusCode : 0;

            if (Array.isArray(message)) message = message.join(', ');

            ctx.status = statusCode;

            ctx.body = { message: message };

            if (err.description) ctx.body.description = err.description;
        } else {
            // may be error if headers are already sent...
            ctx.set('X-Content-Type-Options', 'nosniff');

            ctx.status = err.expose ? err.status : 500;

            if (!isDevelopment) {
                if (ctx.status >= 500) {
                    ctx.status = 500;
                    //err.message = 'Server error ...';
                }
            }

            return ctx.render('error', {
                status: ctx.status,
                message: err.name === 'ValidationError' || err.name === 'ValidatorError' ? validationErr(err, Object.keys(err.errors)) : isDevelopment ? err.message : 'Server error'
            });
        }

    }

};
