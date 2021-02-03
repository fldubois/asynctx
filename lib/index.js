'use strict';

const {createHook, executionAsyncId} = require('async_hooks');

const contexts = new Map();

const hook = createHook({
  init: (asyncId, type, triggerAsyncId) => {
    contexts.set(asyncId, contexts.has(triggerAsyncId) ? contexts.get(triggerAsyncId) : {});
  },
  destroy: (asyncId) => {
    contexts.delete(asyncId);
  }
});

hook.enable();

module.exports = {
  get: (key = null) => {
    const ctx = contexts.get(executionAsyncId());

    return key === null ? ctx : ctx[key];
  },
  set: (key, value) => {
    const ctx = contexts.get(executionAsyncId());

    ctx[key] = value;
  }
};
