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
        "/pings": {
            "post": {
                "tags": i18n.__('SWAGGER.paths./pings.post.tags'),
                "operationId": "sendPing",
                "summary": i18n.__('SWAGGER.paths./pings.post.summary'),
                "description": i18n.__('SWAGGER.paths./pings.post.description'),
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
                        "description": i18n.__('SWAGGER.paths./pings.post.parameters.0.description'),
                        "schema": {
                            "$ref": "#/definitions/Ping"
                        }
                    }
                ],
                "responses": {
                    "204": {
                        "description": i18n.__('SWAGGER.paths./pings.post.responses.204.description')
                    },
                    "400": {
                        "description": i18n.__('SWAGGER.paths./pings.post.responses.400.description')
                    }
                }
            },
            "get": {
                "tags": i18n.__('SWAGGER.paths./pings.get.tags'),
                "operationId": "getPings",
                "summary": i18n.__('SWAGGER.paths./pings.get.summary'),
                "description": i18n.__('SWAGGER.paths./pings.get.description'),
                "produces": [
                    "application/json"
                ],
                "responses": {
                    "200": {
                        "description": i18n.__('SWAGGER.paths./pings.get.responses.200.description'),
                        "schema": {
                            "$ref": "#/definitions/PingGet"
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
        "Ping": {
            "type": "object",
            "required": [
                "dt"
            ],
            "properties": {
                "sn": {
                    "type": "string",
                    "example": "abc-001",
                    "description": i18n.__('SWAGGER.definitions.Ping.properties.sn.description')
                },
                "dt": {
                    "type": "number",
                    "example": 1480483346,
                    "description": i18n.__('SWAGGER.definitions.Ping.properties.dt.description')
                },
                "dt_c": {
                    "type": "number",
                    "example": 0,
                    "description": i18n.__('SWAGGER.definitions.Ping.properties.dt_c.description')
                },
                "ctrl": {
                    "type": "string",
                    "example": "STA,Suvorova8,6,AES,05051985,00:e0:4c:87:01:22,192.168.0.8,192.168.0.1",
                    "description": i18n.__('SWAGGER.definitions.Ping.properties.ctrl.description')

                    /*"type": "object",
                    "$ref": "#/definitions/Controller",
                    "description": i18n.__('SWAGGER.definitions.Ping.properties.ctrl.description')*/
                },
                "f_s": {
                    "type": "object",
                    "$ref": "#/definitions/FlowSensor",
                    "description": i18n.__('SWAGGER.definitions.Ping.properties.f_s.description')
                }
            }
        },
        "PingGet": {
            "type": "object",
            "required": [
                "dt"
            ],
            "properties": {
                "_id": {
                    "type": "string",
                    "example": "583d6949c8c52273aee02df1",
                    "description": i18n.__('SWAGGER.definitions.PingGet.properties._id.description')
                },
                "sn": {
                    "type": "string",
                    "example": "abc-001",
                    "description": i18n.__('SWAGGER.definitions.PingGet.properties.sn.description')
                },
                "dt": {
                    "type": "string",
                    "example": "2016-11-12T18:34:13.354Z",
                    "description": i18n.__('SWAGGER.definitions.PingGet.properties.dt.description')
                },
                "ctrl": {
                    "type": "string",
                    "example": "STA,Suvorova8,6,AES,05051985,00:e0:4c:87:01:22,192.168.0.8,192.168.0.1",
                    "description": i18n.__('SWAGGER.definitions.Ping.properties.ctrl.description')
                    /*"type": "object",
                    "$ref": "#/definitions/Controller",
                    "description": i18n.__('SWAGGER.definitions.PingGet.properties.ctrl.description')*/
                },
                "f_s": {
                    "type": "object",
                    "$ref": "#/definitions/FlowSensor",
                    "description": i18n.__('SWAGGER.definitions.PingGet.properties.f_s.description')
                },
                "ip": {
                    "type": "string",
                    "example": "::ffff:80.91.183.136",
                    "description": i18n.__('SWAGGER.definitions.PingGet.properties.ip.description')
                },
                "c_dt": {
                    "type": "string",
                    "example": "2016-11-28T07:51:57.750Z",
                    "description": i18n.__('SWAGGER.definitions.PingGet.properties.c_dt.description')
                }
            }
        },

        "Controller": {
            "type": "object",
            "required": [
                "fw"
            ],
            "properties": {
                "fw": {
                    "type": "string",
                    "example": "1.0",
                    "description": i18n.__('SWAGGER.definitions.Controller.properties.fw.description')
                },
                "c": {
                    "type": "string",
                    "example": "esp12e",
                    "description": i18n.__('SWAGGER.definitions.Controller.properties.c.description')
                },
                "b": {
                    "type": "string",
                    "example": "1.7",
                    "description": i18n.__('SWAGGER.definitions.Controller.properties.b.description')
                },
                "i_ip": {
                    "type": "string",
                    "example": "192.168.0.1",
                    "description": i18n.__('SWAGGER.definitions.Controller.properties.i_ip.description')
                },
                "ssid": {
                    "type": "string",
                    "example": "ciscoWIFI",
                    "description": i18n.__('SWAGGER.definitions.Controller.properties.ssid.description')
                }
            }
        },

        "FlowSensor": {
            "type": "object",
            "required": [
                "s"
            ],
            "properties": {
                "s": {
                    "type": "object",
                    "description": i18n.__('SWAGGER.definitions.FlowSensor.properties.s.description')
                }
            }
        }
    }
};