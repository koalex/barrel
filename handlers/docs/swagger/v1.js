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

module.exports = () => {
  i18n.setLocale(CLS.getNamespace('app').get('locale'));

  return {
    "swagger": "2.0",
    "info": {
      "title": i18n.__('SWAGGER.info.title'),
      "description": i18n.__('SWAGGER.info.description'),
      "version": "1.0"
    },
    "host": null,
    "basePath": "/api/v1",
    "tags": [
      {
        "name": i18n.__('SWAGGER.tags.0.name'),
        "description": i18n.__('SWAGGER.tags.0.description')
      },
      {
        "name": i18n.__('SWAGGER.tags.1.name'),
        "description": i18n.__('SWAGGER.tags.1.description')
      },
      {
        "name": i18n.__('SWAGGER.tags.2.name'),
        "description": i18n.__('SWAGGER.tags.2.description')
      }
    ],
    "schemes": ["http"],

    "paths": {},

    "definitions": {},

    "externalDocs": {
      "description": i18n.__('SWAGGER.externalDocs.description'),
      "url": "/files/TZ.docx"
    }

  }
};