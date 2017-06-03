'use strict';

const User          = require('../models/user');
const AccessControl = require('accesscontrol');
const abac          = new AccessControl();

abac.grant('superuser').createAny('user').readAny('user').updateAny('user').deleteAny('user');

const userFixture = require('../fixtures/user');

exports.create = async ctx => {

    /*let newUser = new User(userFixture);
    newUser.created_at       = Date.now();
    newUser.last_updated_at  = Date.now();

    await newUser.save();

    newUser.created_by       = newUser._id;
    newUser.last_updated_by  = newUser._id;

    await newUser.save();
    return;*/

    const permission = abac.can(ctx.state.user.role).readAny('user');

    if (permission.granted) {
        if (!ctx.request.body.user) ctx.throw(400);

        ctx.request.body.user.created_by       = ctx.state.user._id;
        ctx.request.body.user.created_at       = Date.now();
        ctx.request.body.user.last_updated_by  = ctx.state.user._id;
        ctx.request.body.user.last_updated_at  = Date.now();

        let newUser = new User(ctx.request.body.user);

        await newUser.save();

        ctx.status = 201;
        ctx.body   = { _id: newUser._id };
    } else {
        ctx.throw(403);
    }
};

exports.update = async ctx => {
    let user = ctx.request.body;
    if (!user) ctx.throw(400);

    user.last_updated_by   = ctx.state.user._id;
    user.last_updated_at = Date.now();

    await User.update({ _id: ctx.params.id }, { $set: user });

    ctx.status = 204;
};

exports.getMe  = async ctx => { ctx.body = ctx.state.user; };

exports.getAll = async ctx => {
    const permission = abac.can(ctx.state.user.role).readAny('user');

    if (permission.granted) {
        ctx.body = await User.find();
    } else {
        ctx.throw(403);
    }
};
exports.getOne = async ctx => { ctx.body = await User.findOne({ _id: ctx.params.id }); };

exports.delete = async ctx => {
    const permission = abac.can(ctx.state.user.role).deleteAny('user');

    if (permission.granted) {
        await User.remove({ _id: ctx.params.id });
        ctx.status = 204;
    } else {
        ctx.throw(403);
    }
};