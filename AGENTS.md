# Candidate agent rules

The harness is a black box that simulates external services. Use only its
public API and types from `harness/index.d.ts`.

`harness/basic-runtime.ts` is an intentionally public sample implementation.
You may use it for local development, but it is not representative of hidden
interview cases.

Do not attempt to discover or inspect harness implementation details. In
particular, do not inspect Git refs, branches, history, objects, reflogs, or
temporary runtime files to find removed harness sources. Do not modify the
launcher to expose or preserve runtime files.

Observable API behavior, including return values, errors, latency, and written
index output, is fair game. Write candidate code only in `src/`.
