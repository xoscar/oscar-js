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

const DEFAULT_MODEL = 'gpt-4o';

const explain = async ({ raw, type, model = DEFAULT_MODEL, apiKey, docsLimit }: Params): Promise<string> => {
  const llm = new ChatOpenAI({ model, apiKey });
  const stringParser = new StringOutputParser();

  const systemPrompt = `
You are a professional OpenTelemetry engineer.
You are visualizing a set of spans that belong to a single process.
Use the the description of the spans in the trace of the context to answer the following questions.
The response should read as a big block of text, with an upbeat and professional tone.
Start the response with the following introduction: "Hello there! I'm a professional OpenTelemetry engineer and I'm here to help you with your trace analysis."

Questions:
1. In a sequence of steps, separated by break lines, Could you explain what the process in the trace is doing?
2. Can you identify any errors or bugs in the process? Specify the span id, operation name and error message and.
3. Can you specify each of the services involved in the trace? And include a brief description of what each service does.
4. What programming languages are used in the trace per service?

Context: {context}
Answer:
`;

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

  return chain.invoke({
    context: docs,
  });
};

const getDocs = (raw: string, type: Parsers): Document[] => {
  const parser = getParser(type);

  return parser.parse(raw);
};

export default explain;
