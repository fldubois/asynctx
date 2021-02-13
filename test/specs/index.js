'use strict';

const {executionAsyncId} = require('async_hooks');

const chance = require('chance')();
const rewire = require('rewire');

const {expect} = require('chai');

const ctx = rewire('../../lib');

const contexts = ctx.__get__('contexts');

describe('asynctx', function () {

  beforeEach('clear context', function () {
    contexts.get(executionAsyncId()).clear();
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

  it('should throw an error on property access if context does not exist', function () {
    expect(() => {
      contexts.delete(executionAsyncId());
      Reflect.get(ctx, chance.word());
    }).to.throw(Error, 'Context not found');
  });

  describe('fork()', function () {

    it('should fork the current context', function (done) {
      const parent = contexts.get(executionAsyncId());
      const key    = chance.word();
      const value  = chance.word();

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

  describe('Map properties', function () {

    it('size', function () {
      expect(ctx.size).to.be.a('number').that.equal(0);

      const current = contexts.get(executionAsyncId());

      for (let i = 0; i < 5; i++) {
        current.set(chance.word(), chance.word());
      }

      expect(ctx.size).to.be.a('number').that.equal(5);
    });

    it('[@@toStringTag]', function () {
      expect(ctx[Symbol.toStringTag]).to.equal('Map');
    });

  });

  describe('Map methods', function () {
    let current = null;
    let entries = null;

    beforeEach('initialize fixtures', function () {
      current = contexts.get(executionAsyncId());
      entries = chance.n(() => [chance.word(), chance.word()], 5);

      for (const [key, value] of entries) {
        current.set(key, value);
      }
    });

    it('clear()', function () {
      expect(current.size).to.equal(5);

      ctx.clear();

      expect(current.size).to.equal(0);
    });

    it('delete()', function () {
      const [[key, value]] = entries;

      expect(current.get(key)).to.equal(value);

      ctx.delete(key);

      expect(current.get(key)).to.be.an('undefined');
    });

    it('entries()', function () {
      expect(Array.from(ctx.entries())).to.deep.equal(entries);
    });

    it('forEach()', function () {
      ctx.forEach((value, key) => expect([key, value]).to.deep.equal(entries.shift()));

      expect(entries).to.have.a.lengthOf(0);
    });

    it('get()', function () {
      const [[key, value]] = entries;

      expect(ctx.get(key)).to.equal(value);
    });

    it('has()', function () {
      const key = chance.word();

      expect(ctx.has(key)).to.equal(false);

      current.set(key, chance.word());

      expect(ctx.has(key)).to.equal(true);
    });

    it('keys()', function () {
      const keys = entries.map(([key]) => key);

      expect(Array.from(ctx.keys())).to.deep.equal(keys);
    });

    it('set()', function () {
      const key   = chance.word();
      const value = chance.word();

      ctx.set(key, value);

      expect(current.get(key)).to.equal(value);
    });

    it('values()', function () {
      const values = entries.map(([, value]) => value);

      expect(Array.from(ctx.values())).to.deep.equal(values);
    });

    it('[@@iterator]()', function () {
      expect(Array.from(ctx)).to.deep.equal(entries);
    });

  });

});
