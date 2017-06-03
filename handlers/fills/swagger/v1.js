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
        "/fills": {
            "post": {
                "tags": i18n.__('SWAGGER.paths./fills.post.tags'),
                "operationId": "sendFill",
                "summary": i18n.__('SWAGGER.paths./fills.post.summary'),
                "description": i18n.__('SWAGGER.paths./fills.post.description'),
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "parameters": [
                    {
                        "name": "body",
                        "in": "body",
                        "required": true,
                        "description": i18n.__('SWAGGER.paths./fills.post.parameters.0.description'),
                        "schema": {
                            "$ref": "#/definitions/Fill"
                        }
                    }
                ],
                "responses": {
                    "204": {
                        "description": i18n.__('SWAGGER.paths./fills.post.responses.204.description'),
                    },
                    "400": {
                        "description": i18n.__('SWAGGER.paths./fills.post.responses.400.description'),
                    }
                }
            },
            "get": {
                "tags": i18n.__('SWAGGER.paths./fills.get.tags'),
                "operationId": "getFills",
                "summary": i18n.__('SWAGGER.paths./fills.get.summary'),
                "description": i18n.__('SWAGGER.paths./fills.get.description'),
                "produces": [
                    "application/json"
                ],
                "responses": {
                    "200": {
                        "description": i18n.__('SWAGGER.paths./fills.get.responses.200.description'),
                        "schema": {
                            "$ref": "#/definitions/FillGet"
                        }
                    }
                }
            }
        }
    }
};

exports.definitions = () => {
    i18n.setLocale(CLS.getNamespace('app').get('locale'));

    return {
        "Fill": {
            "type": "object",
            "required": [
                "sn", "dt", "ctrl_dt", "f", "dt_c"
            ],
            "properties": {
                "sn": {
                    "type": "string",
                    "example": "abc-001",
                    "description": i18n.__('SWAGGER.definitions.Fill.properties.sn.description')
                },
                "dt": {
                    "type": "number",
                    "example": 1480483346,
                    "description": i18n.__('SWAGGER.definitions.Fill.properties.dt.description')
                },
                "ctrl_dt": {
                    "type": "number",
                    "example": 1480482337,
                    "description": i18n.__('SWAGGER.definitions.Fill.properties.ctrl_dt.description')
                },
                "f": {
                    "type": "number",
                    "example": 1000,
                    "description": i18n.__('SWAGGER.definitions.Fill.properties.f.description')
                },
                "dt_c": {
                    "type": "number",
                    "example": 0,
                    "description": i18n.__('SWAGGER.definitions.Fill.properties.dt_c.description')
                }
            }
        },
        "FillGet": {
            "type": "object",
            "required": [
                "dt"
            ],
            "properties": {
                "_id": {
                    "type": "string",
                    "example": "583d6949c8c52273aee02df1",
                    "description": i18n.__('SWAGGER.definitions.FillGet.properties._id.description')
                },
                "sn": {
                    "type": "string",
                    "example": "abc-001",
                    "description": i18n.__('SWAGGER.definitions.FillGet.properties.sn.description')
                },
                "dt": {
                    "type": "string",
                    "example": "2016-11-12T18:34:13.354Z",
                    "description": i18n.__('SWAGGER.definitions.FillGet.properties.dt.description')
                },
                "f": {
                    "type": "number",
                    "example": 1000,
                    "description": i18n.__('SWAGGER.definitions.FillGet.properties.f.description')
                },
                "ip": {
                    "type": "string",
                    "example": "::ffff:80.91.183.136",
                    "description": i18n.__('SWAGGER.definitions.FillGet.properties.ip.description')
                },
                "c_dt": {
                    "type": "string",
                    "example": "2016-11-28T07:51:57.750Z",
                    "description": i18n.__('SWAGGER.definitions.FillGet.properties.c_dt.description')
                }
            }
        }
    }
};