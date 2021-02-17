'use strict';

const {createHook, executionAsyncId} = require('async_hooks');

const symbols = {
  context: Symbol('context')
};

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

class AsyncContext extends Map {
  get [symbols.context]() {
    const asyncId = executionAsyncId();

    if (!contexts.has(asyncId)) {
      throw new Error('Context not found');
    }

    return contexts.get(asyncId);
  }

  exists() {
    return contexts.has(executionAsyncId());
  }

  fork() {
    contexts.set(executionAsyncId(), new Map(this[symbols.context]));
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}

const handler = {
  apply(target, thisArg, args) {
    return Reflect.apply(target, thisArg[symbols.context], args);
  }
};

for (const [property, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(Map.prototype))) {
  if (typeof descriptor.get === 'function') {
    Object.defineProperty(AsyncContext.prototype, property, {...descriptor, get: new Proxy(descriptor.get, handler)});
  } else if (property !== 'constructor') {
    AsyncContext.prototype[property] = new Proxy(Map.prototype[property], handler);
  }
}

module.exports = new AsyncContext();
