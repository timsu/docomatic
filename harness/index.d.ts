export interface RawDocument {
  id: string;
  source?: string | null;
  updatedAt?: string;
}

export interface Person {
  name: string;
  company: string;
}

export interface Usage {
  company: string;
  product: string;
}

export interface ExtractedDocument {
  docId: string;
  updatedAt?: string;
  people: Person[];
  usages: Usage[];
}

export interface NormalizedRecord {
  /** Deterministic identity for this record: `${docId}#person:${slug}` */
  key: string;
  docId: string;
  name: string;
  company: string;
  /** Canonical company slug, e.g. "Acme Corp" -> "acme" */
  companyId: string;
  products: string[];
  updatedAt: string;
}

export interface Enrichment {
  score: number;
  category: string;
  version: string;
}

export interface SearchDocument extends NormalizedRecord {
  enrichment: Enrichment;
}

export class HarnessError extends Error {
  constructor(message: string, code: string, status?: number);
  readonly code: string;
  readonly status?: number;
}

export function listDocumentIds(): Promise<string[]>;
export function fetchDocument(id: string): Promise<RawDocument>;
export function extract(raw: RawDocument): Promise<ExtractedDocument>;
export function normalize(extracted: ExtractedDocument): Promise<NormalizedRecord[]>;
export function enrich(record: NormalizedRecord): Promise<SearchDocument>;
export function indexDocument(doc: SearchDocument): Promise<void>;
export function readIndex(): Promise<Record<string, SearchDocument>>;
