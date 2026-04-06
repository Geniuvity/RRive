from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import inch
import uuid
import os
import tempfile


def create_pdf(title: str, content: str):
    """
    Creates a PDF file from a title and text content.
    Saves the PDF in the system's temp directory with a random name.
    Returns the full file path and filename for later upload or deletion.
    """

    file_name = f"{title}_{uuid.uuid4().hex[:6]}.pdf"
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, file_name)

    # Using SimpleDocTemplate for proper margins and wrapping
    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch
    )

    styles = getSampleStyleSheet()

    # Title style
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Heading1"],
        fontSize=16,
        spaceAfter=20,
    )

    # Body style - handles wrapping automatically
    body_style = ParagraphStyle(
        "CustomBody",
        parent=styles["Normal"],
        fontSize=11,
        leading=16,   
        spaceAfter=10,
    )

    story = []

    # Add title
    story.append(Paragraph(title.replace("_", " ").title(), title_style))
    story.append(Spacer(1, 0.2 * inch))

    # Add content - split by newlines, each paragraph wraps correctly
    for line in content.split("\n"):
        line = line.strip()
        if line:
            # Escape special HTML chars for ReportLab
            line = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            story.append(Paragraph(line, body_style))
        else:
            story.append(Spacer(1, 0.1 * inch))

    doc.build(story)

    return file_path, file_name