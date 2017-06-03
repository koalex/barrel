'use strict';

const request 	= require('supertest');
const server    = require('../../../server.js');
const apiList   = ['v1'];

let l = apiList.length;
let i = 0;

while (i < l) {
    apiTest(apiList[i]);
    ++i;
}

function apiTest (apiVersion) {
    describe('DOCS MODULE ' + apiVersion.toUpperCase(), () => {
        it('swagger page render', done => {
            request(server)
                .get('/api/' + apiVersion + '/docs')
                .expect(200)
                .expect('Content-Type', /text/)
                .end((err, res) => {
                    if(err) {
                        throw err;
                    } else {
                        done();
                    }
                });
        });

        it('API JSON file request', done => {
            request(server)
                .get('/api/' + apiVersion + '/docs/api.json')
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    if(err) {
                        throw err;
                    } else {
                        // console.log(res.text);
                        done();
                    }
                });
        });
    });
}

