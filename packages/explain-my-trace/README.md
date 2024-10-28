# `@oscar-js/explain-my-trace`

[![NPM Published Version][npm-img]][npm-url]

## About

This module provides an a simple way to breakdown OpenTelemetry based traces into human words, explaining the entire process, finding bugs and providing useful insights using OpenAI and LanChain. Currently only supports `Jaeger` and `Tempo` export formats.

## Install

Using `npm`:

```bash
npm install @oscar-js/explain-my-trace
```

Using `npx`:

```bash
# OPENAI_API_KEY=<your-key> or use the --apikey flag
npx @oscar-js/explain-my-trace --path ./trace.json --apikey <your-key> --model "gpt-4o" --type jaeger/tempo --docslimit 10 --format pretty
```

## Usage

To include it as part of a Node.js app, use the following:

```typescript
import explain from '@oscar-js/explain-my-trace';
import trace from './trace.json';

const response = explain({
  raw: JSON.stringify(trace), // the raw string version
  type: 'tempo', // Only tempo and jaeger are available
  apiKey: '<your-openapi-api-key>', // Or it can be hoisted in the process.env as OPENAI_API_KEY
  model: 'gpt-4o', // The model to use, defaults to gpt-4o
  docslimit: 10, // Uses as a limit of documents sent to the model to avoid expensive queries $$$, defaults to 100
});

console.log(response)
```

[npm-url]: https://www.npmjs.com/package/@oscar-js/explain-my-trace
[npm-img]: https://badge.fury.io/js/%40oscar-js%2Fexplain-my-trace.svg
