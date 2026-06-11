# Token Usage Guidelines

This document explains practical steps and tools in this repository to reduce "token eating" when using language models.

## High-level principles
- Send only the minimum necessary context.
- Replace long files with concise summaries or snippets.
- Use retrieval (embeddings) for large doc bases.
- Prefer smaller or cheaper models for non-critical tasks.
- Limit generation size with `max_tokens` and stop sequences.

## Tools added
- `tools/token_audit.py` — Scan repository to estimate token counts per file.
  - Usage: `python tools/token_audit.py --path . --top 20 --threshold 1200`
- `tools/prepare_context.py` — Create a short snippet of a file within a token budget.
  - Usage: `python tools/prepare_context.py README.md --max-tokens 800 --out snippet.txt`

## Prompting best practices
- Short system prompt: Keep it to 1–2 short sentences.
  - Example: "You are an assistant that answers concisely. Goal: help debug frontend code."
- Summary-first: For ongoing work, keep a 2–4 line summary of prior context and send it instead of full chat history.
  - Example: "Context: Working on checkout flow; need to fix payment API. Files changed: src/CartAndCheckout.tsx (see snippet)."
- Ask for constrained output: "Respond in 4 lines" or "Return a 6-item checklist".
- Send diffs, not files: Use `git diff --unified=0` and include only changed hunks.

## Workflow examples
1. Audit repo for large files

```bash
python tools/token_audit.py --path . --top 30 --threshold 1200
```

2. Prepare a snippet for a large file before calling the model

```bash
python tools/prepare_context.py src/components/ProductDetailView.tsx --max-tokens 700 --out snippet.txt
# then send snippet.txt contents with a short prompt
```

3. Save and reuse summaries

- After generating a model summary for a file, store it in `docs/_summaries/` and reuse rather than re-sending the file.

## Token accounting
- Use the `tools/token_audit.py` to estimate token costs before API calls.
- If you need precise counting, install `tiktoken` in the environment and the tools will use it automatically.

## Advanced: Retrieval Augmented Generation (RAG)
- Index docs with embeddings (e.g., OpenAI/Vertex AI embeddings).
- At query time, retrieve top-k passages (k=3 recommended) and send only those.
- Keep passage length small (200–400 tokens each).

## Quick Checklist
- [ ] Use short system prompts
- [ ] Send summaries not files
- [ ] Limit `max_tokens` on every call
- [ ] Prefer smaller models where acceptable
- [ ] Cache model outputs you reuse
- [ ] Instrument and monitor token usage

---

If you want, I can:
- Run the token audit now and report the top token-heavy files, or
- Add a small CI check (GitHub Action) that warns on large files being committed.

Tell me which to do next.
