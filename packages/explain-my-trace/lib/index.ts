#!/usr/bin/env node
import args from 'args';
import explain from './explain';
import { readFileSync } from 'fs';
import { Parsers } from './parser';

args
  .option('apikey', '', undefined)
  .option('path', '', '')
  .option('docslimit', '', undefined)
  .option('model', '', undefined)
  .option('type', '', '')
  .option('format', '', 'pretty');

interface Params {
  apikey?: string;
  path?: string;
  docslimit?: number;
  model?: string;
  type?: Parsers;
  format: 'pretty' | 'json';
}

async function main() {
  const {
    path,
    apikey: apiKey = '',
    docslimit: docsLimit = 0,
    model,
    type = 'tempo',
    format = 'pretty',
  } = args.parse(process.argv) as Params;

  if (!path) {
    throw new Error('Please provide a path to the trace file');
  }

  const raw = readFileSync(path, 'utf8');

  const response = await explain({
    raw,
    apiKey,
    model,
    type,
    docsLimit,
  });

  if (format === 'pretty') {
    const { description, errors, languages, services } = response;

    console.log(`🏢 Description:
${description}
`);
    if (errors.length) {
      console.log('🐞 Errors:');
      errors.forEach(error => {
        console.log(`• ${error.operationName} (${error.spanId}) - ${error.errorMessage}`);
        console.log(`Stack: ${error.stackTrace}`);
      });
    }

    console.log(`
🔧 Services:`);
    services.forEach(service => {
      console.log(`• ${service.serviceName} - ${service.description}`);
    });
    console.log(`
📚 Languages:`);
    languages.forEach(language => {
      console.log(`• ${language.serviceName} - ${language.language}`);
    });
  } else {
    console.log(response);
  }
}

main();
