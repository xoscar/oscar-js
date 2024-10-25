// JAEGER
export interface JaegerTrace {
  data: Daum[];
  total: number;
  limit: number;
  offset: number;
  errors: any;
}

export interface Daum {
  traceID: string;
  spans: Span[];
  processes: Processes;
  warnings: any;
}

export interface Span {
  traceID: string;
  spanID: string;
  operationName: string;
  references: Reference[];
  startTime: number;
  duration: number;
  tags: Tag[];
  logs: Log[];
  processID: string;
  warnings?: string[];
}

export interface Reference {
  refType: string;
  traceID: string;
  spanID: string;
}

export interface Tag {
  key: string;
  type: string;
  value: any;
}

export interface Log {
  timestamp: number;
  fields: Field[];
}

export interface Field {
  key: string;
  type: string;
  value: any;
}

export type Processes = Record<string, Process>;

export interface Process {
  serviceName: string;
  tags: Tag[];
}

export interface Tag2 {
  key: string;
  type: string;
  value: any;
}

// TEMPO
export interface TempoTrace {
  batches: Batch[];
}

export interface Batch {
  resource: Resource;
  instrumentationLibrarySpans: InstrumentationLibrarySpan[];
}

export interface Resource {
  attributes: Attribute[];
  droppedAttributesCount: number;
}

export interface Attribute {
  key: string;
  value: Value;
}

export interface Value {
  stringValue?: string;
  intValue?: number;
  boolValue?: boolean;
}

export interface InstrumentationLibrarySpan {
  spans: TempoSpan[];
  instrumentationLibrary: InstrumentationLibrary;
}

export interface TempoSpan {
  traceId: string;
  spanId: string;
  parentSpanId: string;
  traceState: string;
  name: string;
  kind: string;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
  attributes: Attribute[];
  droppedAttributesCount: number;
  droppedEventsCount: number;
  droppedLinksCount: number;
  status: Status;
  events?: Event[];
}

export interface Status {
  code: number;
  message: string;
}

export interface Event {
  timeUnixNano: number;
  attributes: Attribute[];
  droppedAttributesCount: number;
  name: string;
}

export interface InstrumentationLibrary {
  name: string;
  version: string;
}
