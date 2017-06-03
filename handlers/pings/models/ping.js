/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===        PING MODEL        ===
 ================================
*/

'use strict';

const mongoose = require('../../../libs/mongoose');

// TODO: VCC=2.66V, WiFi_mode=station, MQTT_broker=not connected, Heap_free_size=39424 bytes, Uptime=882 seconds
const pingSchema = new mongoose.Schema({
  sn: { type: String, required: true }, // серийный номер
  dt: { type: Date, required: true }, // дата и время пинга UTC
  c_dt: { type: Date, default: Date.now }, // время записи в БД
  ctrl: {
    type: String
    /*fw: { // firmaware
      type: String,
      required: true
    },
    c: { // chip
      type: String,
      required: true
    },
    b: { // board
      type: String,
      required: true
    },
    i_ip: { // internal IP
      type: String,
      required: true
    },
    ssid: {
      type: String,
      required: true
    }*/
  },
  f_s: { // flow sensor
    s: { // settings

    }
  },
  ip: { type: String, required: true }, // ip адрес, с которого были отправлены данные

  // for transactions implementation
  updated: { type: mongoose.Schema.Types.Mixed, default: null},
  tx: { type: mongoose.Schema.Types.ObjectId, default: null }
},
{ versionKey: false });

pingSchema.methods.toJSON = function () {
  let data = this.toObject();
  delete data.updated;
  delete data.tx;
  return data;
};

module.exports = mongoose.model('Ping', pingSchema);

