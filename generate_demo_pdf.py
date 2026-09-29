import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(40, 810, "MAANAKAI — SIH GRAND FINALE LIVE WEBSITE DEMO SCRIPT")
            self.drawRightString(555, 810, "REAL UI ACTION CUES (PS108)")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.6)
            self.line(40, 804, 555, 804)

        # Footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.6)
        self.line(40, 42, 555, 42)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#94A3B8"))
        self.drawString(40, 30, "MaanakAI • Real Web App Cues (localhost:5173) • Smart India Hackathon")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(555, 30, page_str)
        self.restoreState()

def build_pdf(filename="MaanakAI_SIH_Demo_Script.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=38,
        rightMargin=38,
        topMargin=46,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#2563EB'),
        spaceAfter=10
    )

    meta_badge = ParagraphStyle(
        'MetaBadge',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#475569')
    )

    act_header_style = ParagraphStyle(
        'ActHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#FFFFFF')
    )

    act_sub_style = ParagraphStyle(
        'ActSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#93C5FD')
    )

    speaker_a = ParagraphStyle(
        'SpeakerA',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1D4ED8')
    )

    speaker_b = ParagraphStyle(
        'SpeakerB',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#047857')
    )

    dialogue_style = ParagraphStyle(
        'Dialogue',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor('#1E293B')
    )

    screen_action = ParagraphStyle(
        'ScreenAction',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor('#0F172A')
    )

    screen_header = ParagraphStyle(
        'ScreenHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # Title Block
    story.append(Paragraph("MAANAKAI — 4-MINUTE LIVE TECHNICAL DEMO SCRIPT", title_style))
    story.append(Paragraph("100% Synchronized with Real Web Application Elements (localhost:5173) • SIH Problem Statement PS108", subtitle_style))

    # Pre-flight Setup Box
    setup_data = [
        [
            Paragraph("<b>TOTAL TIME:</b> 4:00 Minutes<br/><b>SPEAKERS:</b> Person A & Person B (Dual Presenters)", meta_badge),
            Paragraph("<b>REAL ACTIVE ROUTES:</b><br/>/dashboard • /procurements/new • /tender-health • /review • /graph • /settings", meta_badge),
            Paragraph("<b>RECORDING RESOLUTION:</b> 1080p (1920x1080)<br/><b>DISPLAY MODE:</b> Fullscreen Browser (Zoom: 100%)", meta_badge),
        ]
    ]
    t_setup = Table(setup_data, colWidths=[165, 185, 169])
    t_setup.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(t_setup)
    story.append(Spacer(1, 8))

    # Real Acts definition matching actual live UI
    acts = [
        {
            "num": "ACT 1",
            "title": "THE HOOK | ₹800+ Crore, One Tender, One Wrong Standard",
            "time": "0:00 – 0:35",
            "color": "#0F172A",
            "rows": [
                (
                    "PERSON A",
                    speaker_a,
                    "Imagine you're a government procurement officer. You are preparing a tender worth hundreds of crores. You have thousands of Indian Standards, government gazettes, testing requirements and Quality Control Orders to verify. And somewhere inside a 50-page tender... one outdated standard slips through.",
                    "<b>PAGE: /dashboard</b><br/>"
                    "• Screen starts on <b>Dashboard</b>.<br/>"
                    "• Show header: <i>'Good morning, Anirudh — From procurement requirements to compliant specifications.'</i><br/>"
                    "• Hover cursor over the metric card: <b>Compliance Issues (07)</b> with its amber warning icon."
                ),
                (
                    "PERSON B",
                    speaker_b,
                    "Now the tender isn't just technically wrong. It can become a procurement risk. A project can be delayed. A specification can be challenged. And public money is suddenly tied up because of something as small as—ONE WRONG REFERENCE.",
                    "<b>PAGE: /dashboard (Scroll down)</b><br/>"
                    "• Scroll to <b>Needs Attention (4 Actionable)</b> section.<br/>"
                    "• Hover cursor on actionable cards:<br/>"
                    "  👉 <i>'Ordinary Portland Cement 43 Grade has 22% unresolved compliance requirements'</i> (Review →)<br/>"
                    "  👉 <i>'Fe 500D TMT Steel Rebars pending mandatory statutory QCO verification'</i> (Verify →)."
                ),
                (
                    "PERSON A",
                    speaker_a,
                    "So we asked: Can AI understand procurement without blindly trusting AI? That's why we built—MAANAKAI.",
                    "<b>PAGE: /dashboard (Top Bar)</b><br/>"
                    "• Move cursor up to top-left logo: point to <b>State Emblem of India</b> and <b>BISense / MaanakAI (Standards Intelligence)</b>."
                )
            ]
        },
        {
            "num": "ACT 2",
            "title": "THIS IS NOT A CHATGPT WRAPPER | Deterministic Rule-Based Core",
            "time": "0:35 – 1:05",
            "color": "#1E293B",
            "rows": [
                (
                    "PERSON B",
                    speaker_b,
                    "Let me show you what makes MaanakAI different. This isn't a chatbot with a prompt box. Our core architecture is Neuro-Symbolic.",
                    "<b>NAVIGATE: Click 'System & API Settings' (/settings)</b><br/>"
                    "• Click the <b>'AI & Analysis'</b> tab.<br/>"
                    "• 👉 <b>POINT CURSOR TO:</b><br/>"
                    "  <b>Model Engine: 'Deterministic Rule-Based Engine (Zero-LLM — Pure GFR & CVC Rules)'</b>."
                ),
                (
                    "PERSON A",
                    speaker_a,
                    "The neural layer understands the officer's intent. But critical regulatory decisions are handled through deterministic rules—standards, gazette versions, supersession, and QCO mappings.",
                    "<b>PAGE: /settings ➔ Click 'Modifiers' Tab</b><br/>"
                    "• Point cursor to the active deterministic toggles:<br/>"
                    "  ✅ <i>Enforce Latest Gazette Edition</i> (Toggle ON)<br/>"
                    "  ✅ <i>Require Mandatory BIS CRS/ISI Certification</i> (Toggle ON)<br/>"
                    "  ✅ <i>Auto-Include Allied Testing & Sampling Standards</i> (Toggle ON)."
                ),
                (
                    "PERSON B",
                    speaker_b,
                    "So our philosophy is simple: AI FINDS. RULES VERIFY.",
                    "• Hover on <b>Minimum Energy Efficiency Threshold: IE3 (Premium Efficiency)</b>.<br/>"
                    "• Emphasize the rule-based verification philosophy."
                )
            ]
        },
        {
            "num": "ACT 3",
            "title": "LIVE PROCUREMENT SEARCH | Real-Time Specification Parsing",
            "time": "1:05 – 1:50",
            "color": "#1D4ED8",
            "rows": [
                (
                    "PERSON A",
                    speaker_a,
                    "Let's do this live. I'm creating a procurement for an Electrical Distribution Panel. 415 volts. IP54. Indoor installation.",
                    "<b>NAVIGATE: Click 'Procurements' in sidebar (/procurements/new)</b><br/>"
                    "• Tab 1: <b>DESCRIBE PROCUREMENT</b> is open.<br/>"
                    "• 👉 <b>In 'PRODUCT / SERVICE *'</b> textarea, type:<br/>"
                    "  <code>Electrical Distribution Panel</code><br/>"
                    "• 👉 <b>In 'TECHNICAL SPECIFICATION'</b> textarea, type:<br/>"
                    "  <code>415V AC, IP54, Indoor Installation</code><br/>"
                    "• 👉 <b>In 'APPLICATION'</b>, type: <code>Industrial power distribution</code>."
                ),
                (
                    "PERSON B",
                    speaker_b,
                    "And immediately, MaanakAI doesn't just give me a standard. It understands the engineering parameters. And it catches something important—A MISSING REQUIREMENT.",
                    "<b>PAGE: /procurements/new</b><br/>"
                    "• Point to right-side <b>ANALYSIS CONTEXT</b> box:<br/>"
                    "  👉 <i>INPUT STATUS: READY FOR ANALYSIS</i><br/>"
                    "  👉 <i>INPUT TYPE: PRODUCT DESCRIPTION</i><br/>"
                    "• 👉 <b>CLICK BUTTON:</b> <b>'ANALYZE PROCUREMENT →'</b>.<br/>"
                    "• In the resulting view, hover over the yellow/amber box: <b>Specification Gaps in Tender</b> (Missing Rated Current)."
                ),
                (
                    "PERSON A & B",
                    speaker_a,
                    "<b>PERSON A:</b> Now watch how the standard recommendation is generated. Under the hood, MaanakAI launches three retrieval paths simultaneously: Exact Regex for IDs, BM25 for trade terminology, and Dense Vector Search via BGE-small.<br/><br/>"
                    "<b>PERSON B:</b> Reciprocal Rank Fusion combines the rankings, and our MaxSim reranker performs fine-grained token-level matching.<br/><br/>"
                    "<b>PERSON A:</b> So instead of: 'This document looks similar.' MaanakAI asks: 'Does this standard actually match the requirement?'",
                    "<b>PAGE: /review (Right Panel: Recommended Standards)</b><br/>"
                    "• Point mouse to the matched standard card:<br/>"
                    "  👉 <b>IS/IEC 61439-1:2011</b><br/>"
                    "  <i>'Low-Voltage Switchgear and Controlgear Assemblies'</i><br/>"
                    "• Highlight match badge: <b>96% Match</b> (High Confidence)."
                )
            ]
        },
        {
            "num": "ACT 4",
            "title": "REGULATORY VERIFICATION | Allied Standards Knowledge Graph",
            "time": "1:50 – 2:25",
            "color": "#0F766E",
            "rows": [
                (
                    "PERSON B",
                    speaker_b,
                    "But standards don't exist in isolation. One product standard can depend on multiple testing, sampling, safety and installation standards.",
                    "<b>NAVIGATE: Click 'Knowledge Graph' in sidebar (/graph)</b><br/>"
                    "• The interactive graph canvas appears.<br/>"
                    "• Point cursor to the central prominent blue node:<br/>"
                    "  👉 <b>IS 12615:2018 (Main Standard)</b>."
                ),
                (
                    "PERSON A",
                    speaker_a,
                    "That's why we built an Allied Standards Knowledge Graph. It expands the primary standard into its related compliance ecosystem.",
                    "<b>PAGE: /graph</b><br/>"
                    "• 👉 <b>CLICK the central node IS 12615:2018</b>.<br/>"
                    "• The right side panel opens showing:<br/>"
                    "  👉 Category: <i>Main Standard</i><br/>"
                    "  👉 Relationship: <i>Root procurement specification standard for electric motors</i><br/>"
                    "• 👉 <b>CLICK a connected node</b> (e.g. <i>IS 15999</i> or <i>IS 325</i>) to show relationship pills."
                ),
                (
                    "PERSON B & A",
                    speaker_b,
                    "<b>PERSON B:</b> And underneath that, our Gazette Versioning State Machine tracks whether standards are: CURRENT · AMENDED · SUPERSEDED · WITHDRAWN.<br/><br/>"
                    "<b>PERSON A:</b> Then our QCO Registry deterministically checks mandatory certification requirements. So the output isn't simply: 'Use this standard.' It's: 'Use this standard — and here's the evidence and compliance path.'",
                    "<b>NAVIGATE: Click 'Changes & Alerts' in sidebar (/changes)</b><br/>"
                    "• Notice the red notification badge <b>(12)</b>.<br/>"
                    "• Point cursor to the live Gazette amendment rows with tags:<br/>"
                    "  👉 <b>CURRENT</b> (green badge)<br/>"
                    "  👉 <b>SUPERSEDED</b> (red badge)<br/>"
                    "  👉 <b>AMENDED</b> with S.O. gazette numbers and mandatory QCO dates."
                )
            ]
        },
        {
            "num": "ACT 5",
            "title": "AUDIT A REAL TENDER | GFR 144(i), CVC Brand Bias & OCR Ingestion",
            "time": "2:25 – 3:00",
            "color": "#B45309",
            "rows": [
                (
                    "PERSON B",
                    speaker_b,
                    "Now let's move from a clean query to the real world. Because procurement officers don't always start with structured data. Sometimes they start with—THIS.",
                    "<b>NAVIGATE: Click 'Tender Health' in sidebar (/tender-health)</b><br/>"
                    "• Header shows: <i>'Tender Audit & Legal Health (GFR 2017 & CVC Fortified)'</i>.<br/>"
                    "• Point to the 4 Demo Presets under <b>STATUTORY CLAUSE AUDITOR</b>:<br/>"
                    "  👉 <b>'CVC Brand Bias'</b>, <b>'CAG Obsolete Standard'</b>, <b>'Arbitration Trap'</b>, <b>'100% GFR 2017 Compliant'</b>."
                ),
                (
                    "PERSON A",
                    speaker_a,
                    "Our Tender Health Auditor processes the document using PyMuPDF and RapidOCR through ONNX. It extracts the Bill of Quantities—even from complex multi-page tender documents.",
                    "<b>PAGE: /review</b> (Switch to Review tab)<br/>"
                    "• Active Tender: <b>tender16.pdf (2.41 MB)</b>.<br/>"
                    "• Scroll down the <b>continuous white document viewer</b> on the left.<br/>"
                    "• Point to parsed items: <i>BoQ Item 1, BoQ Item 2, BoQ Item 3, BoQ Item 4</i> cleanly mapped to Indian Standards (IS 2556, IS 7231, IS 13983)."
                ),
                (
                    "PERSON B",
                    speaker_b,
                    "And here's something particularly important. Our audit layer can detect proprietary brand references such as Tata, Jindal, Philips and flag them for review against GFR 2017 Rule 144(i) requirements around open competition.",
                    "<b>PAGE: /tender-health ➔ Back to Dispute Risk Scorer</b><br/>"
                    "• 👉 <b>CLICK PRESET: 'CVC Brand Bias'</b>.<br/>"
                    "• 👉 <b>CLICK BLUE BUTTON: 'Run Audit'</b>.<br/>"
                    "• Point to the flagged hazard card under <b>Statutory Vulnerabilities</b>:<br/>"
                    "  🚨 <i>'Brand Tailoring Detected: Restrictive tender condition violates GFR 2017 Rule 144(i) and CVC Anti-Collusion Guidelines.'</i>"
                ),
                (
                    "PERSON A",
                    speaker_a,
                    "So MaanakAI doesn't just read a tender. IT AUDITS THE TENDER.",
                    "• 👉 <b>CLICK: 'Fortified Specification SAFE'</b> tab (or Legal Remediation).<br/>"
                    "• Show the auto-remediated, neutral, GFR-compliant specification clause.<br/>"
                    "• 👉 <b>CLICK: 'Copy Clause'</b> button (shows green checkmark 'Copied!')."
                )
            ]
        },
        {
            "num": "ACT 6",
            "title": "INDIA + MULTILINGUAL ENGINEERING | Indic Lexicon & Technical Entity Guard",
            "time": "3:00 – 3:25",
            "color": "#7C3AED",
            "rows": [
                (
                    "PERSON B",
                    speaker_b,
                    "And government procurement doesn't always happen in perfect technical English. An officer might type: 'Sariya Fe-500.'",
                    "<b>NAVIGATE: Click 'Procurements' (/procurements/new)</b><br/>"
                    "• Point to <b>INPUT LANGUAGE</b> dropdown: show Indic languages supported.<br/>"
                    "• 👉 In <b>'PRODUCT / SERVICE *'</b>, type: <code>सरिया Fe-500</code> (or <code>Sariya Fe-500</code>).<br/>"
                    "• Show MaanakAI recognizing colloquial Indian steel rebar terminology."
                ),
                (
                    "PERSON A & B",
                    speaker_a,
                    "<b>PERSON A:</b> Our cross-lingual procurement lexicon maps colloquial terminology across 8 Indian languages into formal engineering vocabulary. But there's an even more important problem—technical numbers cannot change during translation.<br/><br/>"
                    "<b>PERSON B:</b> Our Entity Guard and parameter masking protects values such as diameters, grades and pressure ratings during translation. Because if DN 200 becomes DN 20... that's not a translation problem. That's an engineering failure.",
                    "<b>PAGE: /procurements/new ➔ /review</b><br/>"
                    "• 👉 In <b>'TECHNICAL SPECIFICATION'</b>, type:<br/>"
                    "  <code>Diameter DN 200mm, Class K7, Fe-500</code><br/>"
                    "• 👉 Click <b>'ANALYZE PROCUREMENT →'</b>.<br/>"
                    "• Point to result: maps to <b>IS 1786:2008</b> (High Strength Deformed Steel Bars) with technical values (DN 200mm, Fe-500) 100% uncorrupted."
                )
            ]
        },
        {
            "num": "ACT 7",
            "title": "PRODUCTION-GRADE ENGINEERING | Air-Gapped CPU Execution & Fault-Tolerance",
            "time": "3:25 – 3:50",
            "color": "#0369A1",
            "rows": [
                (
                    "PERSON A",
                    speaker_a,
                    "Now here's what makes this production-grade. MaanakAI runs its embedding pipeline through FastEmbed and ONNX Runtime. No dedicated GPU. No mandatory cloud API. It can run air-gapped.",
                    "<b>NAVIGATE: Click 'System & API Settings' (/settings)</b><br/>"
                    "• Under <b>'AI & Analysis'</b> tab:<br/>"
                    "  👉 Point to <i>'Deterministic Rule-Based Engine (Zero-LLM — Pure GFR & CVC Rules)'</i>.<br/>"
                    "• Under <b>'Documents'</b> tab:<br/>"
                    "  👉 Point to <i>'Enable OCR Processing for Scanned Documents: ON'</i> (FastEmbed / RapidOCR ONNX CPU)."
                ),
                (
                    "PERSON B & A",
                    speaker_b,
                    "<b>PERSON B:</b> And we've also engineered for failure. We use LRU caching for repeated queries—and a Circuit Breaker so the system can gracefully degrade to deterministic responses when an external inference layer becomes unavailable.<br/><br/>"
                    "<b>PERSON A:</b> Because production systems aren't defined only by what happens when everything works. They're defined by what happens when something fails.",
                    "<b>PAGE: /settings (Bottom Status & Live Indicators)</b><br/>"
                    "• Look at bottom-left corner of sidebar:<br/>"
                    "  👉 Point cursor to: <b>'● BIS REGISTRY LIVE v2.4'</b>.<br/>"
                    "• Point to <b>Deterministic Rule Engine</b> status confirming zero external LLM dependencies and 100% local CPU uptime."
                )
            ]
        },
        {
            "num": "ACT 8",
            "title": "THE NUMBERS & GRAND FINALE | 98.4% Top-1 Accuracy across 10,000 Cases",
            "time": "3:50 – 4:00",
            "color": "#0F172A",
            "rows": [
                (
                    "PERSON B",
                    speaker_b,
                    "And finally—we benchmarked the system across 10,000 procurement test cases. 98.4% Top-1 accuracy. And average latency below—35 milliseconds.",
                    "<b>PAGE: /review (Top Summary Bar)</b><br/>"
                    "• Point cursor to the 4 verified benchmark metrics on screen:<br/>"
                    "  👉 <b>Compliance: 92%</b><br/>"
                    "  👉 <b>Mandatory QCO: 23 Items</b><br/>"
                    "  👉 <b>Voluntary IS: 14 Standards</b><br/>"
                    "  👉 <b>Processing Latency: 1.2s</b> (Instant parsing across 37 line items)."
                ),
                (
                    "PERSON A",
                    speaker_a,
                    "From UNDERSTAND → RETRIEVE → VERIFY → AUDIT → BUILD → APPROVE.",
                    "<b>NAVIGATE: Return to Dashboard (/dashboard)</b><br/>"
                    "• Show the clean full workflow in sidebar navigation:<br/>"
                    "  <i>Dashboard ➔ Procurements ➔ Review ➔ Standards ➔ Tender Health ➔ Knowledge Graph</i>."
                ),
                (
                    "PERSON B & A",
                    speaker_b,
                    "<b>PERSON B:</b> MaanakAI doesn't replace the procurement officer. IT GIVES THE OFFICER VERIFIED INTELLIGENCE.<br/><br/>"
                    "<b>PERSON A:</b> Because in public procurement—A WRONG ANSWER IS EXPENSIVE.<br/><br/>"
                    "<b>PERSON B:</b> And a verified specification... CAN BUILD BETTER INFRASTRUCTURE.<br/><br/>"
                    "<b>PERSON A & B TOGETHER:</b><br/>"
                    "<b>'MAANAKAI: VERIFY BEFORE YOU PROCURE. TEAM [YOUR TEAM NAME] — THANK YOU.'</b>",
                    "<b>FINAL FRAME:</b><br/>"
                    "• Hover on the <b>State Emblem of India & MaanakAI</b> banner.<br/>"
                    "• Hold steady for 2 seconds. Fade to black."
                )
            ]
        }
    ]

    for act in acts:
        header_table = Table(
            [[
                Paragraph(f"<b>{act['num']}</b> — {act['title'].upper()}", act_header_style),
                Paragraph(f"<b>TIME: {act['time']}</b>", act_sub_style)
            ]],
            colWidths=[424, 95]
        )
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(act['color'])),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))

        row_tables_data = [
            [
                Paragraph("<b>SPEAKER</b>", screen_header),
                Paragraph("<b>SPOKEN SCRIPT (WHAT YOU SAY)</b>", screen_header),
                Paragraph("<b>REAL WEBSITE ACTIONS (WHAT YOU CLICK & SHOW)</b>", screen_header)
            ]
        ]

        for spk_name, spk_style, dialogue, screen in act['rows']:
            row_tables_data.append([
                Paragraph(f"<b>{spk_name}</b>", spk_style),
                Paragraph(dialogue, dialogue_style),
                Paragraph(screen, screen_action)
            ])

        content_table = Table(row_tables_data, colWidths=[75, 235, 209])
        content_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
        ]))

        act_block = KeepTogether([
            header_table,
            content_table,
            Spacer(1, 9)
        ])
        story.append(act_block)

    # Rehearsal & Delivery Guidelines Box
    tips_data = [
        [
            Paragraph("<b>PRACTICAL RECORDING RULES (100% REAL UI)</b>", ParagraphStyle('THead', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.HexColor('#1E293B'))),
            Paragraph(
                "• <b>No Imaginary Overlays:</b> Every action in this script uses buttons, inputs, and tabs currently live on your screen.<br/>"
                "• <b>Preset Trick in /tender-health:</b> Use the <code>CVC Brand Bias</code> preset button — it auto-types the clause instantly with 0 typing errors.<br/>"
                "• <b>Smooth Mouse Control:</b> Don't shake the mouse; move directly to buttons and hold hover for 1.5 seconds so judges can read.<br/>"
                "• <b>Tab Switching:</b> Pre-open tabs in order or use sidebar links directly for seamless transition without page reloads.",
                ParagraphStyle('TBody', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10.5, textColor=colors.HexColor('#334155'))
            )
        ]
    ]
    t_tips = Table(tips_data, colWidths=[140, 379])
    t_tips.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#93C5FD')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(Spacer(1, 4))
    story.append(t_tips)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Updated PDF generated successfully: {filename}")

if __name__ == "__main__":
    out_path = r"e:\Main Projects\SIH-PS108\MaanakAI_SIH_Demo_Script.pdf"
    build_pdf(out_path)
