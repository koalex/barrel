/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ ***/

/*
 ================================
 ===        FILL MODEL        ===
 ================================
*/

'use strict';

const mongoose = require('../../../libs/mongoose');

const fillSchema = new mongoose.Schema({
  sn: { type: String, required: true }, // серийный номер
  f: { type: Number, required: true }, // сколько налито в мл/л
  dt: { type: Date, required: true }, // дата и время налива UTC
  err: { type: Boolean }, // если данные по наливам битые
  // ctrl_dt: { type: Date, required: true }, // время установленное в контроллере, по факту нужен для кода 2
  vcc: { type: Number }, // напряжение батареек
  ip: { type: String }, // ip адрес, с которого были отправлены данные
  c_dt: { type: Date, required: true, default: Date.now }, // время записи в БД

  // for transactions implementation
  updated: { type: mongoose.Schema.Types.Mixed, default: null},
  tx: { type: mongoose.Schema.Types.ObjectId, default: null }
},
{ versionKey: false });

fillSchema.methods.toJSON = function () {
  let data = this.toObject();
  delete data.updated;
  delete data.tx;
  return data;
};

// virtuals: dt_c, ctrl_dt

module.exports = mongoose.model('Fill', fillSchema);

