'use strict';

const chance = require('chance')();

const {expect} = require('chai');

const ctx = require('../../lib');

describe('asynctx', function () {

  const key = chance.word();

  it('should expose get and set functions', function () {
    expect(ctx).to.respondTo('get', 'set');
  });

  describe('get()', function () {

    it('should retrieve complete context', function () {
      const value = chance.word();

      ctx.set(key, value);

      expect(ctx.get()).to.deep.equal({[key]: value});
    });

    it('should retrieve single value', function () {
      const value = chance.word();

      ctx.set(key, value);

      expect(ctx.get(key)).to.equal(value);
    });

  });

  describe('set()', function () {

    it('should set context key to specified value', function () {
      const value = chance.word();

      ctx.set(key, value);

      expect(ctx.get(key)).to.equal(value);
    });

  });

});
