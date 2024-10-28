import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import getParser, { Parsers } from './parser';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';

interface Params {
  raw: string;
  type: Parsers;
  apiKey?: string;
  model?: string;
  docsLimit?: number;
}

interface Error {
  spanId: string;
  operationName: string;
  errorMessage: string;
  stackTrace: string;
}

interface Service {
  serviceName: string;
  description: string;
}

interface Language {
  serviceName: string;
  language: string;
}

interface Response {
  description: string;
  errors: Error[];
  services: Service[];
  languages: Language[];
}

const DEFAULT_MODEL = 'gpt-4o';

const systemPrompt = `
You are a professional OpenTelemetry engineer.
You are visualizing a set of spans that belong to a single process.
Use the the description of the spans in the trace of the context to answer the following questions.
Display the response in a JSON format where each question defines the key and data type, and all responses are encapsulated in a single object.
Avoid adding the code formatting to the response.

Questions:
1. In a sequence of steps, separated by break lines, Could you explain what the process in the trace is doing? key: "description", data type: string
2. Can you identify any errors or bugs in the process? Specify. key: errors, data type: array of objects, with "spanId", "operationName", "errorMessage" and "stackTrace" as keys
3. Can you specify each of the services involved in the trace? And include a brief description of what each service does. key: services, data type: array of objects with "serviceName" and "description" as keys
4. What programming languages are used in the trace per service? key: languages, data type: array of objects, with "serviceName" and "language" as keys

Context: {context}
Answer:
`;

const explain = async ({ raw, type, model = DEFAULT_MODEL, apiKey, docsLimit = 100 }: Params): Promise<Response> => {
  const llm = new ChatOpenAI({ model, apiKey });
  const stringParser = new StringOutputParser();

  const prompt = ChatPromptTemplate.fromMessages([['system', systemPrompt]]);

  const chain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: stringParser,
  });

  const docs = getDocs(raw, type);

  if (docsLimit && docs.length > docsLimit) {
    throw new Error(`The number of documents exceeds the defined limit of ${docsLimit}`);
  }

  const rawResponse = await chain.invoke({
    context: docs,
  });

  return parseResponse(rawResponse);
};

const parseResponse = (response: string): Response => {
  try {
    return JSON.parse(response);
  } catch (e) {
    throw new Error(`Failed to parse the response ${e}`);
  }
};

const getDocs = (raw: string, type: Parsers): Document[] => {
  const parser = getParser(type);

  return parser.parse(raw);
};

export default explain;
