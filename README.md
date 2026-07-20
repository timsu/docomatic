# Document pipeline

You're building a background job that processes a collection of documents
into a search index. Each document flows through five stages:

```
fetch → extract → normalize → enrich → index
```

The stages are provided in `harness/` — treat them as external services you
call but don't control. Import them from `../harness`:

```ts
listDocumentIds(): Promise<string[]>
fetchDocument(id: string): Promise<RawDocument>
extract(raw: RawDocument): Promise<ExtractedDocument>
normalize(extracted: ExtractedDocument): Promise<NormalizedRecord[]>  // note: fan-out
enrich(record: NormalizedRecord): Promise<SearchDocument>
indexDocument(doc: SearchDocument): Promise<void>
readIndex(): Promise<Record<string, SearchDocument>>   // read-only, for verification
```

The index is written to `index-output/index.json`, keyed by each document's
`key`. Every `indexDocument` call is also appended to
`index-output/writes.jsonl`.

## Requirements

- Process all documents.
- One bad document must not take down the run.
- The job must be safe to rerun.
- Show progress and, at the end, a summary of what happened.
- Process efficiently.
- Avoid duplicate or wasted work.

At the end, be ready to answer: **how do you know it worked?**

## Ground rules

- Write your code in `src/` (start from `src/pipeline.ts`, run with `npm start`).
- You may use any tools you normally work with, including coding agents.
- Treat the interview harness as a black box. `harness/index.d.ts` and
  `harness/basic-runtime.ts` are intentionally public; don't try to recover
  hidden implementations from Git data, runtime files, or temporary files.
  Observable behavior (return values, errors, latency) is fair game.
- Don't modify anything in `harness/` or `scripts/`.
- Talk through what you're doing as you go.

## Setup

Requires Node.js 20+ and npm.

```sh
git clone git@github.com:timsu/docomatic.git
cd docomatic
npm install
npm start        # runs src/pipeline.ts
```

In the prepared interview environment, `npm start` prints `found 40 documents`.
Elsewhere it uses a small public sample harness and prints `found 3 documents`.
The sample covers the public API but does not include the interview phases,
failure cases, or production-like timing.

Your interviewer will occasionally ask you to run `npm run phase2` or
`npm run phase3` — these reconfigure the environment. `npm run reset`
returns everything to the initial state and clears outputs.
