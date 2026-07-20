import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface RawDocument {
  id: string;
  source?: string | null;
  updatedAt?: string;
}

export interface ExtractedDocument {
  docId: string;
  updatedAt?: string;
  people: Array<{ name: string; company: string }>;
  usages: Array<{ company: string; product: string }>;
}

export interface NormalizedRecord {
  key: string;
  docId: string;
  name: string;
  company: string;
  companyId: string;
  products: string[];
  updatedAt: string;
}

export interface SearchDocument extends NormalizedRecord {
  enrichment: { score: number; category: string; version: string };
}

export class HarnessError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "HarnessError";
  }
}

const documents: RawDocument[] = [
  {
    id: "sample_001",
    source: "Ada Lovelace works at Analytical Engines. Analytical Engines uses Notes.",
    updatedAt: "2025-01-10T09:00:00Z",
  },
  {
    id: "sample_002",
    source: "Grace Hopper works at Compiler Systems. Compiler Systems uses Debugger.",
    updatedAt: "2025-01-11T10:00:00Z",
  },
  {
    id: "sample_003",
    source: "Margaret Hamilton works at Apollo Software. Katherine Johnson works at Apollo Software.",
    updatedAt: "2025-01-12T11:00:00Z",
  },
];

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function listDocumentIds(): Promise<string[]> {
  return documents.map(({ id }) => id);
}

export async function fetchDocument(id: string): Promise<RawDocument> {
  const document = documents.find((candidate) => candidate.id === id);
  if (!document) throw new HarnessError(`unknown document ${id}`, "FETCH_NOT_FOUND", 404);
  return structuredClone(document);
}

export async function extract(raw: RawDocument): Promise<ExtractedDocument> {
  if (typeof raw.source !== "string") {
    throw new HarnessError(`document ${raw.id} has no source text`, "EXTRACT_NO_SOURCE");
  }

  const people = [...raw.source.matchAll(/([A-Z][a-z]+ [A-Z][a-z]+) works at ([^.]+)\./g)]
    .map((match) => ({ name: match[1], company: match[2] }));
  const usages = [...raw.source.matchAll(/([^.]+?) uses ([^.]+)\./g)]
    .map((match) => ({ company: match[1].replace(/^.*\.\s*/, ""), product: match[2] }));

  return { docId: raw.id, updatedAt: raw.updatedAt, people, usages };
}

export async function normalize(extracted: ExtractedDocument): Promise<NormalizedRecord[]> {
  const updatedAt = new Date(extracted.updatedAt ?? "").toISOString();
  const products = new Map(extracted.usages.map((usage) => [slug(usage.company), [usage.product]]));

  return extracted.people.map((person) => ({
    key: `${extracted.docId}#person:${slug(person.name)}`,
    docId: extracted.docId,
    name: person.name,
    company: person.company,
    companyId: slug(person.company),
    products: products.get(slug(person.company)) ?? [],
    updatedAt,
  }));
}

export async function enrich(record: NormalizedRecord): Promise<SearchDocument> {
  const score = [...record.key].reduce((total, character) => total + character.charCodeAt(0), 0) % 100;
  return {
    ...record,
    enrichment: { score, category: score % 2 === 0 ? "customer" : "prospect", version: "sample" },
  };
}

const outputDirectory = join(process.cwd(), "index-output");
const indexPath = join(outputDirectory, "index.json");
const writesPath = join(outputDirectory, "writes.jsonl");

export async function indexDocument(document: SearchDocument): Promise<void> {
  mkdirSync(outputDirectory, { recursive: true });
  const index = await readIndex();
  index[document.key] = document;
  writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  appendFileSync(writesPath, `${JSON.stringify(document)}\n`);
}

export async function readIndex(): Promise<Record<string, SearchDocument>> {
  if (!existsSync(indexPath)) return {};
  return JSON.parse(readFileSync(indexPath, "utf8"));
}
