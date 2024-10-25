import { Document } from '@langchain/core/documents';
import Jaeger from './vendors/jaeger';
import Tempo from './vendors/tempo';

export type Parsers = 'jaeger' | 'tempo';

export interface Parser {
  parse(raw: string): Document<Metadata>[];
}

export interface Metadata {
  serviceName?: string;
  childOf?: string;
  spanId?: string;
  kind?: string;
  errors?: string[];
  language?: string;
}

const parserMap: Record<Parsers, Parser> = {
  jaeger: Jaeger(),
  tempo: Tempo(),
};

const getParser = (type: Parsers): Parser => {
  const parser = parserMap[type];

  if (!parser) {
    throw new Error(`Parser for type ${type} not found`);
  }

  return parser;
};

export default getParser;
