'use strict';

const {executionAsyncId} = require('async_hooks');

const chance = require('chance')();
const rewire = require('rewire');

const {expect} = require('chai');

const ctx = rewire('../../lib');

const contexts = ctx.__get__('contexts');

describe('asynctx', function () {
  let key   = null;
  let value = null;

  beforeEach('clear contexts', function () {
    const current = contexts.get(executionAsyncId());

    Object.keys(current).forEach((k) => delete current[k]);
  });

  beforeEach('initialize fixtures', function () {
    key   = chance.word();
    value = chance.word();
  });

  it('should expose context manipulation functions', function () {
    expect(ctx).to.respondTo('get', 'set', 'fork');
  });

  it('should propagate context between async resources', function (done) {
    setImmediate(() => {
      contexts.get(executionAsyncId())[key] = value;
    });

    setTimeout(() => {
      expect(contexts.get(executionAsyncId())[key]).to.equal(value);

      done();
    }, 1);
  });

  describe('get()', function () {

    it('should retrieve complete context', function () {
      contexts.get(executionAsyncId())[key] = value;

      expect(ctx.get()).to.deep.equal({[key]: value});
    });

    it('should retrieve single value', function () {
      contexts.get(executionAsyncId())[key] = value;

      expect(ctx.get(key)).to.equal(value);
    });

  });

  describe('set()', function () {

    it('should set context key to specified value', function () {
      ctx.set(key, value);

      expect(contexts.get(executionAsyncId())).to.have.a.property(key, value);
    });

  });

  describe('fork()', function () {

    it('should fork the current context', function (done) {
      const parent = contexts.get(executionAsyncId());

      parent[key] = value;

      setImmediate(() => {
        ctx.fork();

        const current = contexts.get(executionAsyncId());

        expect(current).to.not.equal(parent);
        expect(current).to.have.a.property(key, value);
      });

      setTimeout(() => {
        const current = contexts.get(executionAsyncId());

        expect(current).to.equal(parent);
        expect(current).to.have.a.property(key, value);

        done();
      }, 1);
    });

  });

});
