'use strict';

const {executionAsyncId} = require('async_hooks');

const chance = require('chance')();
const rewire = require('rewire');

const {expect} = require('chai');

const ctx = rewire('../../lib');

const contexts = ctx.__get__('contexts');

describe('asynctx', function () {

  const key = chance.word();

  it('should expose context manipulation functions', function () {
    expect(ctx).to.respondTo('get', 'set', 'fork');
  });

  it('should propagate context between async resources', function (done) {
    const value = chance.word();

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
      const value = chance.word();

      contexts.get(executionAsyncId())[key] = value;

      expect(ctx.get()).to.deep.equal({[key]: value});
    });

    it('should retrieve single value', function () {
      const value = chance.word();

      contexts.get(executionAsyncId())[key] = value;

      expect(ctx.get(key)).to.equal(value);
    });

  });

  describe('set()', function () {

    it('should set context key to specified value', function () {
      const value = chance.word();

      ctx.set(key, value);

      expect(contexts.get(executionAsyncId())).to.have.a.property(key, value);
    });

  });

  describe('fork()', function () {

    it('should fork the current context', function (done) {
      const value = chance.word();

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
