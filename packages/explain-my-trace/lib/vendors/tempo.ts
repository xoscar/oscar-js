import { Metadata, Parser } from '../parser';
import { TempoTrace } from './types';
import { Document } from '@langchain/core/documents';

const Jaeger = (): Parser => ({
  parse(raw) {
    const { batches } = JSON.parse(raw) as TempoTrace;
    const docs: Document<Metadata>[] = [];

    batches.forEach(({ instrumentationLibrarySpans, resource }) => {
      const serviceName = resource.attributes.find(({ key }) => key === 'service.name')?.value?.stringValue;
      const language = resource.attributes.find(({ key }) => key === 'telemetry.sdk.language')?.value?.stringValue;

      instrumentationLibrarySpans.forEach(({ spans }) => {
        spans.forEach(({ spanId, parentSpanId, kind, name, events = [] }) => {
          const errors = events.reduce<string[]>((acc, { attributes }) => {
            if (attributes.find(({ key }) => key.startsWith('exception'))) {
              const exceptionType = attributes.find(({ key }) => key === 'exception.type')?.value?.stringValue;
              const exceptionMessage = attributes.find(({ key }) => key === 'exception.message')?.value?.stringValue;
              const exceptionStack = attributes.find(({ key }) => key === 'exception.stacktrace')?.value?.stringValue;
              return [...acc, `${exceptionType}: ${exceptionMessage} ${exceptionStack}`];
            }

            return acc;
          }, []);

          docs.push(
            new Document({
              pageContent: `
                name: ${name}
                serviceName: ${serviceName}
                childOf: ${parentSpanId}
                spanId: ${spanId}
                kind: ${kind}
                errors: ${errors}
                language: ${language}
`,
              metadata: {
                serviceName,
                childOf: parentSpanId,
                spanId,
                kind,
                errors,
                language,
              },
              id: spanId,
            })
          );
        });
      });
    });

    return docs;
  },
});

export default Jaeger;
