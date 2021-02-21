# asynctx

> Node.js context shared between related asynchronous resources

## Table of contents

* [Features](#features)
* [Requirements](#requirements)
* [Context life cycle](#context-life-cycle)
* [Usage](#usage)
* [API](#api)
* [License](#license)

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

## Usage

```js
const ctx = require('asynctx');

setImmediate(() => {
  setTimeout(() => {
    console.log(ctx.get('foo')); // => bar
  }, 20);

  setTimeout(() => {
    ctx.set('foo', 'bar');
  }, 10);
});
```

## API

### Base

`asynctx` extends [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

### `exists()`

> Check if a context exists for the current asynchronous resource.

```js
asynctx.exists() -> boolean
```

### `fork()`

> Creates a new context branch for the current asynchronous resource and its descendants.
>
> The parent context content will be copied into the forked context.
> Modifications on the fork will not alter the parent context.
>
> Warning: contexts are shallow copied, references are shared between parent and forked contexts.

```js
asynctx.fork() -> void
```

## License

See [License](LICENSE)
