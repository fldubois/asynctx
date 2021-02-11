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

const getContext = () => {
  const asyncId = executionAsyncId();

  if (!contexts.has(asyncId)) {
    throw new Error('Context not found');
  }

  return contexts.get(asyncId);
};

module.exports = {
  get: (key) => {
    return getContext().get(key);
  },
  set: (key, value) => {
    getContext().set(key, value);
  },
  fork: () => {
    contexts.set(executionAsyncId(), new Map(getContext()));
  }
};
