#!/usr/bin/env python3
"""
prepare_context.py

Helpers to create small, focused contexts from large files:
- trims by token budget (fallback heuristics)
- extracts a short summary using heuristics (head + important blocks)

Usage:
  python tools/prepare_context.py path/to/file.md --max-tokens 800 --out snippet.txt

This is intentionally offline-friendly: it doesn't call external APIs.
"""
import argparse
from pathlib import Path
import math

try:
    import tiktoken
    def estimate_tokens(text):
        enc = tiktoken.encoding_for_model("gpt-4o-mini") if hasattr(tiktoken, 'encoding_for_model') else tiktoken.get_encoding('gpt2')
        return len(enc.encode(text))
except Exception:
    def estimate_tokens(text):
        return max(1, math.ceil(len(text)/4))


def create_snippet(text: str, max_tokens: int) -> str:
    # Simple strategy: keep top sections by length up to max_tokens
    tokens = estimate_tokens(text)
    if tokens <= max_tokens:
        return text
    # Otherwise split by double newlines (paragraphs) and pick first + important paragraphs
    paras = [p.strip() for p in text.split('\n\n') if p.strip()]
    out = []
    cur = 0
    for p in paras:
        t = estimate_tokens(p)
        if cur + t <= max_tokens or not out:
            out.append(p)
            cur += t
        else:
            break
    snippet = '\n\n'.join(out)
    # If still too long, hard truncate characters
    if estimate_tokens(snippet) > max_tokens:
        approx_chars = max_tokens * 4
        snippet = snippet[:approx_chars]
    return snippet


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('file', help='File to prepare')
    parser.add_argument('--max-tokens', type=int, default=800)
    parser.add_argument('--out', help='Output file', default=None)
    args = parser.parse_args()

    p = Path(args.file)
    if not p.exists():
        print('File not found:', args.file)
        return
    text = p.read_text(errors='ignore')
    snippet = create_snippet(text, args.max_tokens)
    if args.out:
        Path(args.out).write_text(snippet)
        print('Wrote snippet to', args.out)
    else:
        print(snippet)

if __name__ == '__main__':
    main()
