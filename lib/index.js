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

module.exports = new Proxy({
  fork: () => {
    contexts.set(executionAsyncId(), new Map(getContext()));
  }
}, {
  get: (target, name, receiver) => {
    if (Reflect.has(target, name)) {
      return Reflect.get(target, name, receiver);
    }

    const context  = getContext();
    const property = Reflect.get(context, name, context);

    return typeof property === 'function' ? property.bind(context) : property;
  },
  has: (target, property) => {
    const context = getContext();

    return Reflect.has(target, property) || Reflect.has(context, property);
  }
});
