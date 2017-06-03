/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

const fs       = require('fs');
const config   = require('config');
const join     = require('path').join;
const basename = require('path').basename;
const swaggers = {};
const docs     = {};

fs.readdirSync(join(__dirname, '../swagger')).map(localeFileName => basename(localeFileName, '.js')).forEach(stat => {
    swaggers[stat.toLowerCase()] = require(join(__dirname, '../swagger/' + stat));
});

fs.readdirSync(`${config.projectRoot}/handlers`).forEach(stat => {
    if (stat === basename(join(__dirname, '../'))) return;

    try {
        if (fs.lstatSync(`${config.projectRoot}/handlers/${stat}/swagger`).isDirectory()) {
            let docsFileNames = fs.readdirSync(`${config.projectRoot}/handlers/${stat}/swagger`);

            docsFileNames.forEach(doc => {
                if (!docs[basename(doc, '.js')]) {
                    docs[basename(doc, '.js').toLowerCase()] = [];
                    docs[basename(doc, '.js').toLowerCase()].push(require(`${config.projectRoot}/handlers/${stat}/swagger/${doc}`));
                } else {
                    docs[basename(doc, '.js').toLowerCase()].push(require(`${config.projectRoot}/handlers/${stat}/swagger/${doc}`));
                }
            });
        }
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
});

module.exports = async ctx => {
    ctx.type = 'json';

    if (!docs[ctx.params.version.toLowerCase()])     ctx.throw(404);
    if (!swaggers[ctx.params.version.toLowerCase()]) ctx.throw(404);

    const Swagger = swaggers[ctx.params.version.toLowerCase()]();
    Swagger.host  = ctx.host;

    let paths       = {};
    let definitions = {};

    docs[ctx.params.version].forEach(doc => {
        let _paths       = doc.paths();
        let _definitions = doc.definitions();

        for (let key in _paths) paths[key] = _paths[key];

        for (let key in _definitions) definitions[key] = _definitions[key];
    });

    Swagger.paths       = paths;
    Swagger.definitions = definitions;

    ctx.body = Swagger;
};