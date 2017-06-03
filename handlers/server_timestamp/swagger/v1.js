'use strict';

const config      = require('config');
const CLS         = require('continuation-local-storage');
const fs          = require('fs');
const join        = require('path').join;
const basename    = require('path').basename;
const i18n        = new (require('i18n-2'))({
    directory: join(__dirname, '../i18n'),
    locales: fs.readdirSync(join(__dirname, '../i18n')).map(localeFileName => basename(localeFileName, '.json')),
    defaultLocale: config.defaultLocale,
    extension: '.json'
});

exports.paths = () => {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    return {
        "/server_timestamp": {
            "get": {
                "tags": i18n.__('SWAGGER.paths.get.tags'),
                "operationId": "getTimestamp",
                "summary": i18n.__('SWAGGER.paths.get.summary'),
                "description": i18n.__('SWAGGER.paths.get.description'),
                "produces": [
                    "application/json"
                ],
                "responses": {
                    "200": {
                        "description": i18n.__('SWAGGER.paths.get.responses.200.description'),
                        "schema": {
                            "$ref": "#/definitions/ServerTimestamp"
                        }
                    },
                    "500": {
                        "description": i18n.__('SWAGGER.paths.get.responses.500.description')
                    }
                }
            }
        }
    }
};

exports.definitions = () => {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    return {
        "ServerTimestamp": {
            "type": "object",
            "required": [
                "ts"
            ],
            "properties": {
                "ts": {
                    "type": "number",
                    "example": 1480483346,
                    "description": i18n.__('SWAGGER.definitions.ServerTimestamp.properties.ts.description')
                }
            }
        }
    }
};