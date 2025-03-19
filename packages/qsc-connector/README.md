# `@oscar-js/qsc-connector`

[![NPM Published Version][npm-img]][npm-url]

## About

This module provides a simple way to connect to a Q-sys Remote Control Server providing a easy to use interface where you can start adding the application's business logic.

## Install

Using `npm`:

```bash
npm install @oscar-js/qsc-connector
```

## Usage

To include it as part of a Node.js app, use the following:

```typescript
import QSC from '@oscar-js/qsc-connector';

const qsc = await QSC({
  host: '<my-host>',
  port: '<my-port>',
});

qsc.emitter.on('message', (message) => console.log(message));

const messageId = qsc.call({
  method: 'Component.Get',
  params: {
    Name: '<component-name>',
    Controls: [{ Name: '<control-name>' }],
  },
})
```

[npm-url]: https://www.npmjs.com/package/@oscar-js/qsc-connector
[npm-img]: https://badge.fury.io/js/%40oscar-js%2Fqsc-connector.svg
