# asynctx

> Node.js context shared between related asynchronous resources

## Features

- _Lightweight_ - Zero dependencies, less than 5 kB
- _Simple_ - Native Map based API
- _Automatic_ - New context created for each contextless resource and propagated to its descendants
- _Performant_ - Implementation based on async hooks and native Map

## Requirements

- Node.js 10.12.0 or later

## Context life cycle

Contexts lifecycle is based directly on [asynchronous resources](https://nodejs.org/docs/latest-v10.x/api/async_hooks.html#async_hooks_terminology) lifecycle.

- Each time an asynchronous resource is created from the root resource, a new context is created and assigned to it.
- Each time an asynchronous resource is created from another one, the new resource inherits the context from its parent.
- Each time an asynchronous resource is destroyed, its reference to its context is removed.
- When a context is not referenced by any resource, it is deleted.

```js
// Root resource, no context

setImmediate(() => { // A new context is created
  setTimeout(() => { // Context is inherited from parent resource
    // ...
  }, 1000);
});
```

## License

See [License](LICENSE)
