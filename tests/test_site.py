#!/usr/bin/env python3
"""Structure and link validation for the PhD website.

Standard library only (no pip installs) so it runs anywhere. Checks:
  1. index.html parses without errors.
  2. All required <section> ids are present.
  3. Every in-page nav anchor (href="#id") targets an existing id.
  4. Local resource links resolve to a file on disk (user placeholders exempt).

Run: python tests/test_site.py
Exit code 0 = all pass, 1 = failures.
"""

from __future__ import annotations

import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"

# Sections that must exist (see developer-guide.md "Adding a new section").
REQUIRED_SECTIONS = ["about", "news", "publications", "consulting", "cv"]

# User-supplied files allowed to be absent in the repo.
ALLOWED_MISSING = {"assets/img/bram.jpg", "assets/files/cv.pdf"}


class SiteParser(HTMLParser):
    """Collects element ids, anchor targets, and local resource references."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: set[str] = set()
        self.anchor_targets: list[str] = []   # href="#id"
        self.local_resources: list[str] = []  # href/src to local files

    def handle_starttag(self, tag: str, attrs) -> None:
        a = dict(attrs)
        if "id" in a and a["id"]:
            self.ids.add(a["id"])
        for attr in ("href", "src"):
            val = a.get(attr)
            if not val:
                continue
            if val.startswith("#"):
                if len(val) > 1:
                    self.anchor_targets.append(val[1:])
                continue
            parsed = urlparse(val)
            if parsed.scheme in ("http", "https", "mailto", "tel", "data"):
                continue
            # Relative path to a local file (strip query/fragment).
            self.local_resources.append(parsed.path)


def parse_index() -> tuple[SiteParser, list[str]]:
    errors: list[str] = []
    if not INDEX.exists():
        return SiteParser(), [f"index.html not found at {INDEX}"]
    parser = SiteParser()
    try:
        parser.feed(INDEX.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001 - report any parse failure
        errors.append(f"index.html failed to parse: {exc}")
    return parser, errors


def check_required_sections(parser: SiteParser) -> list[str]:
    return [
        f"missing required section id='{sid}'"
        for sid in REQUIRED_SECTIONS
        if sid not in parser.ids
    ]


def check_anchor_targets(parser: SiteParser) -> list[str]:
    errors = []
    for target in parser.anchor_targets:
        if target not in parser.ids and target != "top":
            errors.append(f"nav anchor '#{target}' has no matching element id")
    # 'top' is the <main id="top"> brand link; verify it really exists.
    if "top" in parser.anchor_targets and "top" not in parser.ids:
        errors.append("anchor '#top' has no matching element id")
    return errors


def check_local_resources(parser: SiteParser) -> list[str]:
    errors = []
    for rel in parser.local_resources:
        norm = rel.lstrip("/")
        if norm in ALLOWED_MISSING:
            continue
        if not (ROOT / norm).exists():
            errors.append(f"local resource not found: {rel}")
    return errors


def main() -> int:
    parser, errors = parse_index()
    if not errors:
        errors += check_required_sections(parser)
        errors += check_anchor_targets(parser)
        errors += check_local_resources(parser)

    if errors:
        print("FAIL — {} problem(s):".format(len(errors)), file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    print("PASS — index.html structure, anchors, and local links all valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
