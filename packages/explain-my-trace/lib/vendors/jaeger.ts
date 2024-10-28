import { Metadata, Parser } from '../parser';
import { JaegerTrace } from './types';
import { Document } from '@langchain/core/documents';

const Jaeger = (): Parser => ({
  parse(raw) {
    const { data: [{ spans = [], processes = {} }] = [] } = JSON.parse(raw) as JaegerTrace;

    return spans.map(({ operationName, processID, references, spanID, tags, logs = [] }) => {
      const { serviceName = '', tags: processTags = [] } = processes[processID];
      const language = processTags.find(({ key }) => key === 'telemetry.sdk.language')?.value;
      const parentId = references.find(({ refType }) => refType === 'CHILD_OF')?.spanID;
      const kind = tags.find(({ key }) => key === 'span.kind')?.value;

      const errors: string[] = [];
      logs.forEach(({ fields }) => {
        const error = fields.reduce<string>((acc, { key, value }) => {
          if (key.startsWith('exception')) {
            return `${acc} ${key}: ${value}`;
          }

          return acc;
        }, '');

        if (!!error) errors.push(error);
      });

      return new Document<Metadata>({
        pageContent: `
              name: ${operationName}
              serviceName: ${serviceName}
              childOf: ${parentId}
              spanId: ${spanID}
              kind: ${kind}
              language: ${language}
              errors: ${errors}
`,
        metadata: {
          serviceName,
          childOf: parentId,
          spanId: spanID,
          kind: tags.find(({ key }) => key === 'span.kind')?.value,
          language,
        },
        id: spanID,
      });
    });
  },
});

export default Jaeger;
