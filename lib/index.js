'use strict';

const {createHook, executionAsyncId} = require('async_hooks');

const contexts = new Map();

const hook = createHook({
  init: (asyncId, type, triggerAsyncId) => {
    contexts.set(asyncId, contexts.has(triggerAsyncId) ? contexts.get(triggerAsyncId) : new Map());
  },
  destroy: (asyncId) => {
    contexts.delete(asyncId);
  }
});

hook.enable();

module.exports = {
  get: (key) => {
    return contexts.get(executionAsyncId()).get(key);
  },
  set: (key, value) => {
    contexts.get(executionAsyncId()).set(key, value);
  },
  fork: () => {
    const asyncId = executionAsyncId();

    contexts.set(asyncId, new Map(contexts.get(asyncId)));
  }
};
