/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===          SERVER          ===
 ================================
*/

'use strict';

if (parseInt(process.versions.node) < 7 || parseFloat(process.versions.v8) < 5.4) {
    /* jshint -W101 */
    console.log('\n*********************************************\n*  Для запуска требуется Node.js v7 и выше  *\n*  Для запуска требуется V8 v5.4 и выше     *\n*  Пожалуйста обновитесь.                   *\n*********************************************\n');
    process.exit();
}

const koa           = require('koa');
const app           = new koa();
const helmet        = require('koa-helmet');
const Router        = require('koa-router');
const config        = require('config');
const locale        = require('koa-locale');
const i18n          = require('koa-i18n');
const bunyan        = require('bunyan');
const devLogger     = require('koa-logger');
const CLS           = require('continuation-local-storage');
const ns            = CLS.createNamespace('app');
const uuid          = require('uuid');
const responseTime  = require('koa-response-time');
const conditional   = require('koa-conditional-get');
const etag          = require('koa-etag');
const compose       = require('koa-compose');
const userAgent     = require('koa-useragent');
const fs            = require('fs');
const path          = require('path');
const join          = path.join;
const isDevelopment = process.env.NODE_ENV === 'development';
const webpack       = require('webpack');
const webpackConfig = require('./webpack.config');

require('events').EventEmitter.defaultMaxListeners = Infinity;

app.keys = [config.secret];

if (isDevelopment) {
    app.use(responseTime());
    app.use(devLogger());

    const compiler = webpack(webpackConfig);
    app.use(require('koa-webpack-dev-middleware')(compiler, { publicPath: webpackConfig.output.publicPath }));
    app.use(require('koa-webpack-hot-middleware')(compiler));
} else {
    app.use(helmet())
}

if (process.env.TRACE) require('./libs/trace')();

app.use(conditional());
app.use(etag());

locale(app);

app.use(i18n(app, {
    directory: './i18n',
    locales: ['ru', 'en'], //  `ru` defualtLocale, must match the locales to the filenames
    extension: '.json',
    defaultLocale: config.defaultLocale,
    //We can change position of the elements in the modes array. If one mode is detected, no continue to detect.
    modes: [
        'query',                //  optional detect querystring - `/?locale=en-US`
        'cookie',               //  optional detect cookie      - `Cookie: locale=zh-TW`
        'subdomain',            //  optional detect subdomain   - `zh-CN.koajs.com`
        'header',               //  optional detect header      - `Accept-Language: zh-CN,zh;q=0.5`
        'url',                  //  optional detect url         - `/en`
        'tld'                   //  optional detect tld(the last domain) - `koajs.cn`
        //function() {}         //  optional custom function (will be bound to the koa context)
    ]
}));

app.use(async (ctx, next) => {
    ctx.i18n.locale =  ctx.getLocaleFromCookie()
                    || ctx.getLocaleFromHeader()
                    || ctx.getLocaleFromQuery();

    ctx.i18n.locale = ctx.i18n.locale ? ctx.i18n.locale.slice(0,2).toLowerCase() : config.defaultLocale;

    await next();
});

app.use(userAgent);

let log = bunyan.createLogger({
    name: 'BARREL',
    requestId: uuid.v1(),
    streams: [
        {
            level: 'error',
            path: join(config.projectRoot, './logs/errors.log')
        }
    ]
});

process.on('unhandledRejection', err => {
    if (isDevelopment) console.error(err);
    log.error(err);
});

app.use(async (ctx, next) => {
    let context = ns.createContext();
    ns.enter(context);
    ns.bindEmitter(ctx.req);
    ns.bindEmitter(ctx.res);
    try {

        ns.set('locale', ctx.i18n.getLocale());
        ns.set('logger', log);

        await next();

    } finally {

        if(ns.get('logger').requestId != log.requestId) {
            console.error('CLS: wrong context', ns.get('logger').requestId, 'should be', ctx.log.requestId);
        }
        ns.exit(context);
    }
});

/**
  DEFAULT MIDDLEWARES
**/
const middlewares = [];

fs.readdirSync(join(__dirname, 'middlewares'))
    .forEach(middleware => { middlewares.push(require(`./middlewares/${middleware}`)); });

app.use(compose(middlewares));

app.use(async (ctx, next) => {
    ctx.log = ns.get('logger');
    await next();
});

/**
  ROUTES
**/
const router = new Router();

const Routes = () => {
    let routes = [];
    let stats = fs.readdirSync(`${config.projectRoot}/handlers`);
    stats.forEach(stat => {
        if (fs.lstatSync(`${config.projectRoot}/handlers/${stat}`).isDirectory()) {
            routes.push(`${config.projectRoot}/handlers/${stat}/router.js`);
        }
    });

    return routes;
};

/* jshint -W064 */
Routes().forEach(route => {
    let routing = require(route);
    if (Array.isArray(routing)) {
        routing.forEach(r => {
            app.use(r.routes());
        });
    } else {
        app.use(routing.routes());
    }
});

router.post('/error', async ctx => { ctx.throw(0, ctx.request.body); });
app.use(router.routes());


// const socket = require('./libs/socket.js');
const server = app.listen(config.port);
console.log('SERVER LISTENING ON PORT:', config.port);
// socket(server);


