#!/usr/bin/env python3
"""Une los PDFs de docs/pdf/ en uno solo con portada + indice + bookmarks."""
from __future__ import annotations

import io
import sys
from datetime import date
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

HERE = Path(__file__).resolve().parent
OUT = HERE / "capacity-ar-documentacion.pdf"

# Orden + titulos amigables
ORDER = [
    ("informe-tecnico.pdf",            "Informe técnico (interactivo)"),
    ("informe-tecnico-resumen.pdf",    "Informe técnico (resumen)"),
    ("scope-equipos.pdf",              "Scope entre equipos"),
    ("backend-onboarding.pdf",         "Backend onboarding"),
    ("ai-integration.pdf",             "Integración con IA"),
    ("5p-coverage.pdf",                "Cobertura del modelo 5P"),
    ("gap-engine-mvp.pdf",             "Gap engine MVP"),
    ("training-module-design.pdf",     "Diseño del módulo de entrenamiento"),
    ("resources-design.pdf",           "Diseño de recursos"),
    ("access-matrix.pdf",              "Matriz de accesos"),
    ("frontend-guide.pdf",             "Guía para el frontend"),
    ("api-curls.pdf",                  "Curls de prueba de la API"),
    ("backlog.pdf",                    "Backlog"),
]

ACCENT = colors.HexColor("#7c5cff")
INK = colors.HexColor("#0f1430")
INK_DIM = colors.HexColor("#4a5076")
BG = colors.HexColor("#f3f0ff")


def build_front_matter(toc_entries: list[tuple[str, int]]) -> bytes:
    """Devuelve los bytes del PDF con portada + indice."""
    buf = io.BytesIO()
    styles = getSampleStyleSheet()
    h_cover = ParagraphStyle(
        "Cover", parent=styles["Title"],
        fontName="Helvetica-Bold", fontSize=28, leading=34,
        textColor=INK, spaceAfter=10,
    )
    h_sub = ParagraphStyle(
        "Sub", parent=styles["Normal"],
        fontName="Helvetica", fontSize=13, leading=18,
        textColor=INK_DIM, spaceAfter=18,
    )
    chip = ParagraphStyle(
        "Chip", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=10,
        textColor=ACCENT, spaceAfter=14,
    )
    h_section = ParagraphStyle(
        "Section", parent=styles["Heading2"],
        fontName="Helvetica-Bold", fontSize=18,
        textColor=INK, spaceBefore=18, spaceAfter=12,
    )

    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=22 * mm, bottomMargin=18 * mm,
        title="Capacity AR · Documentación consolidada",
        author="Equipo 2 · Ingeniería de Software",
    )

    story: list = []

    # ---- Portada ----
    story.append(Spacer(1, 60))
    story.append(Paragraph("TRABAJO PRÁCTICO · INGENIERÍA DE SOFTWARE", chip))
    story.append(Paragraph("Sistema CapacityAR", h_cover))
    story.append(Paragraph(
        "Documentación técnica consolidada del backend del MVP. "
        "Plataforma de aprendizaje adaptativo (5P + ITS con HITL) "
        "para insertar jóvenes de barrios vulnerables al sector IT en Argentina.",
        h_sub,
    ))
    story.append(Spacer(1, 20))
    meta_rows = [
        ["Repositorio", "github.com/marcelocassiovieira/capacitaya"],
        ["Producción", "capacity-ar-ap.onrender.com"],
        ["Stack", "Python 3.12 · FastAPI · PostgreSQL (Neon) · Render"],
        ["IA",  "Groq + Gemini con fallback automático a Mock"],
        ["Fecha", date.today().isoformat()],
        ["Documentos", f"{len(toc_entries)} secciones"],
    ]
    meta_table = Table(meta_rows, colWidths=[35 * mm, 130 * mm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), BG),
        ("TEXTCOLOR", (0, 0), (0, -1), INK),
        ("TEXTCOLOR", (1, 0), (1, -1), INK_DIM),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#e1e6f5")),
    ]))
    story.append(meta_table)

    # ---- Indice ----
    story.append(Spacer(1, 30))
    story.append(Paragraph("Índice", h_section))

    toc_rows = []
    for i, (title, page) in enumerate(toc_entries, start=1):
        toc_rows.append([
            Paragraph(f"<b>{i:>2}.</b>&nbsp;&nbsp;{title}", styles["BodyText"]),
            Paragraph(f"<font color='#4a5076'>p. {page}</font>",
                      ParagraphStyle("p", parent=styles["BodyText"], alignment=2)),
        ])
    toc_table = Table(toc_rows, colWidths=[140 * mm, 25 * mm])
    toc_table.setStyle(TableStyle([
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, colors.HexColor("#e1e6f5")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(toc_table)

    doc.build(story)
    return buf.getvalue()


def main() -> int:
    # Validar presencia
    missing = [name for name, _ in ORDER if not (HERE / name).exists()]
    if missing:
        print("Faltan PDFs:", missing, file=sys.stderr)
        return 1

    # 1) calcular paginas de cada doc para indice
    readers = []
    pages_per_doc = []
    for name, title in ORDER:
        r = PdfReader(HERE / name)
        readers.append((r, title))
        pages_per_doc.append(len(r.pages))

    # 2) construir front matter (portada + indice) con paginas tentativas
    #    el front matter ocupa N paginas; lo generamos, contamos paginas, y re-calculamos.
    def compute_toc(front_pages: int) -> list[tuple[str, int]]:
        toc = []
        offset = front_pages + 1
        for (_, title), pcount in zip(readers, pages_per_doc):
            toc.append((title, offset))
            offset += pcount
        return toc

    # Iterar hasta que el numero de paginas del front matter se estabilice
    front_pages_guess = 2
    for _ in range(5):
        toc = compute_toc(front_pages_guess)
        front_bytes = build_front_matter(toc)
        front_pages_real = len(PdfReader(io.BytesIO(front_bytes)).pages)
        if front_pages_real == front_pages_guess:
            break
        front_pages_guess = front_pages_real

    # 3) merge final con bookmarks
    writer = PdfWriter()
    front_reader = PdfReader(io.BytesIO(front_bytes))
    for p in front_reader.pages:
        writer.add_page(p)
    writer.add_outline_item("Portada e índice", 0)

    cursor = len(front_reader.pages)
    for (reader, title), pcount in zip(readers, pages_per_doc):
        first_page = cursor
        for p in reader.pages:
            writer.add_page(p)
        writer.add_outline_item(title, first_page)
        cursor += pcount

    writer.add_metadata({
        "/Title": "Capacity AR · Documentación consolidada",
        "/Author": "Equipo 2 · Ingeniería de Software",
        "/Subject": "Backend MVP · Plataforma de capacitación adaptativa (5P + ITS)",
    })

    with OUT.open("wb") as f:
        writer.write(f)

    total_pages = cursor
    print(f"OK -> {OUT.name}  ({total_pages} paginas, {OUT.stat().st_size//1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
