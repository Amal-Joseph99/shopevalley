#!/usr/bin/env python3
"""
token_audit.py

Scan repository files and estimate token usage per file.
Usage:
  python tools/token_audit.py --path . --top 20 --threshold 1000

Outputs a sorted list of files by estimated tokens and a summary.
"""
import os
import sys
import argparse
import math
from pathlib import Path

def estimate_tokens(text: str) -> int:
    try:
        import tiktoken
        enc = tiktoken.encoding_for_model("gpt-4o-mini") if hasattr(tiktoken, 'encoding_for_model') else tiktoken.get_encoding('gpt2')
        return len(enc.encode(text))
    except Exception:
        # Fallback heuristic: 1 token ≈ 4 characters (English average)
        return max(1, math.ceil(len(text) / 4))


def scan_path(root: Path, exts=None):
    files = []
    for p in root.rglob('*'):
        if p.is_file():
            if exts:
                if p.suffix.lower() in exts:
                    files.append(p)
            else:
                files.append(p)
    return files


def readable(n):
    for unit in ['','K','M','G']:
        if abs(n) < 1000:
            return f"{n}{unit}"
        n = n//1000
    return str(n)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--path', '-p', default='.', help='Path to scan')
    p.add_argument('--top', '-t', type=int, default=20, help='Show top N files by token estimate')
    p.add_argument('--threshold', type=int, default=2000, help='Highlight files exceeding token threshold')
    p.add_argument('--exts', nargs='*', help='Optional file extensions to include (e.g. .md .ts .tsx .py)')
    args = p.parse_args()

    root = Path(args.path)
    exts = None
    if args.exts:
        exts = set([e if e.startswith('.') else '.'+e for e in args.exts])

    files = scan_path(root, exts)
    results = []
    total_tokens = 0
    for f in files:
        try:
            text = f.read_text(errors='ignore')
        except Exception:
            continue
        tokens = estimate_tokens(text)
        results.append((tokens, str(f), len(text)))
        total_tokens += tokens

    results.sort(reverse=True, key=lambda x: x[0])

    print(f"Scanned {len(results)} files under {root.resolve()}")
    print(f"Estimated total tokens: {total_tokens}")
    print()
    print(f"Top {args.top} files by token estimate:")
    for tokens, path, chars in results[:args.top]:
        mark = '⚠️' if tokens >= args.threshold else ''
        print(f"{tokens:8d} tokens {mark} - {path} ({chars} chars)")

    big = [r for r in results if r[0] >= args.threshold]
    if big:
        print('\nFiles exceeding threshold:')
        for tokens, path, chars in big:
            print(f" - {path}: {tokens} tokens ({chars} chars)")
    else:
        print('\nNo files exceed the threshold.')

if __name__ == '__main__':
    main()
