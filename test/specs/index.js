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

  beforeEach('clear context', function () {
    contexts.get(executionAsyncId()).clear();
  });

  beforeEach('initialize fixtures', function () {
    key   = chance.word();
    value = chance.word();
  });

  it('should expose context manipulation functions', function () {
    expect(ctx).to.respondTo('get', 'set', 'fork');
  });

  it('should propagate context between async resources', function (done) {
    const parent = contexts.get(executionAsyncId());

    setImmediate(() => {
      expect(contexts.get(executionAsyncId())).to.equal(parent);
    });

    setTimeout(() => {
      expect(contexts.get(executionAsyncId())).to.equal(parent);

      done();
    }, 1);
  });

  describe('get()', function () {

    it('should retrieve value', function () {
      contexts.get(executionAsyncId()).set(key, value);

      expect(ctx.get(key)).to.equal(value);
    });

  });

  describe('set()', function () {

    it('should set context key to specified value', function () {
      ctx.set(key, value);

      expect(contexts.get(executionAsyncId()).get(key)).to.equal(value);
    });

  });

  describe('fork()', function () {

    it('should fork the current context', function (done) {
      const parent = contexts.get(executionAsyncId());

      parent.set(key, value);

      setImmediate(() => {
        ctx.fork();

        const current = contexts.get(executionAsyncId());

        expect(current).to.not.equal(parent);
        expect(current.get(key)).to.equal(value);

        current.set(key, chance.word());
      });

      setTimeout(() => {
        const current = contexts.get(executionAsyncId());

        expect(current).to.equal(parent);
        expect(current.get(key)).to.equal(value);

        done();
      }, 1);
    });

  });

});
