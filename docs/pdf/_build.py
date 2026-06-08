#!/usr/bin/env python3
"""Genera PDFs de toda la documentacion en docs/.

Render MD -> HTML estilado -> Chrome headless -> PDF.
El informe-tecnico.html se pasa directo a Chrome.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import markdown

DOCS = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent

CSS = """
* { box-sizing: border-box; }
body {
  font-family: -apple-system, "Segoe UI", Roboto, system-ui, sans-serif;
  line-height: 1.55;
  color: #1f2433;
  max-width: 880px;
  margin: 0 auto;
  padding: 28px 36px;
  font-size: 12.5px;
}
h1, h2, h3, h4 { color: #0f1430; letter-spacing: -0.01em; margin-top: 1.6em; }
h1 { font-size: 26px; border-bottom: 2px solid #7c5cff; padding-bottom: 6px; margin-top: 0; }
h2 { font-size: 19px; }
h3 { font-size: 16px; }
h4 { font-size: 14px; }
p, li { color: #2a3050; }
a { color: #5b3df0; text-decoration: none; }
code {
  background: #f1f3fb;
  border: 1px solid #e1e6f5;
  border-radius: 4px;
  padding: 1px 5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  color: #4a2fd0;
}
pre {
  background: #0f1430;
  color: #e6ebff;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 10.5px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}
pre code {
  background: transparent;
  border: none;
  color: inherit;
  padding: 0;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}
table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11.5px; }
th, td { text-align: left; padding: 7px 9px; border-bottom: 1px solid #e1e6f5; }
th { background: #f6f7fc; color: #1f2433; font-weight: 600; }
blockquote {
  border-left: 3px solid #7c5cff;
  padding-left: 12px;
  color: #4a5076;
  margin: 12px 0;
}
hr { border: none; border-top: 1px solid #e1e6f5; margin: 22px 0; }
.cover {
  border: 1px solid #e1e6f5;
  background: linear-gradient(135deg, #f3f0ff, #e6f8fb);
  border-radius: 12px;
  padding: 18px 22px;
  margin-bottom: 22px;
}
.cover .chip {
  display: inline-block;
  background: #fff;
  border: 1px solid #d8defa;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 11px;
  color: #5b3df0;
  margin-right: 6px;
}
@page { size: A4; margin: 16mm 14mm; }
"""


# Titulos amigables (con tildes) por archivo
PRETTY_TITLES = {
    "5p-coverage":            "Cobertura del modelo 5P",
    "access-matrix":          "Matriz de accesos",
    "ai-integration":         "Integración con IA",
    "api-curls":              "Curls de prueba de la API",
    "backend-onboarding":     "Backend onboarding",
    "backlog":                "Backlog",
    "frontend-guide":         "Guía para el frontend",
    "gap-engine-mvp":         "Gap engine MVP",
    "informe-tecnico":        "Informe técnico (resumen)",
    "resources-design":       "Diseño de recursos",
    "scope-equipos":          "Scope entre equipos",
    "training-module-design": "Diseño del módulo de entrenamiento",
}


def render_md_to_html(md_path: Path) -> str:
    md_text = md_path.read_text(encoding="utf-8")

    # Remover el primer H1 del MD para no duplicar el titulo con la cover
    lines = md_text.splitlines()
    if lines and lines[0].lstrip().startswith("# "):
        lines = lines[1:]
        while lines and not lines[0].strip():
            lines = lines[1:]
    md_text = "\n".join(lines)

    html_body = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "toc", "sane_lists"],
    )
    title = PRETTY_TITLES.get(md_path.stem, md_path.stem.replace("-", " ").title())
    return f"""<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"/>
<title>{title}</title>
<style>{CSS}</style>
</head><body>
<div class="cover">
  <span class="chip">Capacity AR</span>
  <span class="chip">{md_path.name}</span>
  <h1>{title}</h1>
</div>
{html_body}
</body></html>
"""


def html_to_pdf(html_path: Path, pdf_path: Path) -> None:
    cmd = [
        "google-chrome",
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        f"file://{html_path}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    if result.returncode != 0:
        raise RuntimeError(f"chrome failed: {result.stderr}")


def main() -> int:
    md_files = sorted(DOCS.glob("*.md"))
    html_files = [DOCS / "informe-tecnico.html"]

    failures: list[str] = []

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        for md in md_files:
            print(f"[md ] {md.name}")
            html = render_md_to_html(md)
            tmp_html = tmp_path / f"{md.stem}.html"
            tmp_html.write_text(html, encoding="utf-8")
            stem = md.stem if md.stem != "informe-tecnico" else "informe-tecnico-resumen"
            pdf_out = OUT / f"{stem}.pdf"
            try:
                html_to_pdf(tmp_html, pdf_out)
            except Exception as exc:  # noqa: BLE001
                failures.append(f"{md.name}: {exc}")

        for html in html_files:
            if not html.exists():
                continue
            print(f"[html] {html.name}")
            pdf_out = OUT / f"{html.stem}.pdf"
            try:
                html_to_pdf(html, pdf_out)
            except Exception as exc:  # noqa: BLE001
                failures.append(f"{html.name}: {exc}")

    if failures:
        print("\nFALLAS:")
        for f in failures:
            print(f"  - {f}")
        return 1

    print(f"\nOK · PDFs en {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
