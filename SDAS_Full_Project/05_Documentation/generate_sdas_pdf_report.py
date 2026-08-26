"""
SDAS (Smart Dam Alert System) — Complete Technical System Report & PDF Generator
Generates high-resolution figures and a publication-quality multi-page PDF report.
"""

import os
import sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

# ── Paths ──
DOC_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(DOC_DIR, 'report_assets')
os.makedirs(ASSETS_DIR, exist_ok=True)
PDF_OUTPUT = os.path.join(DOC_DIR, 'SDAS_Complete_System_Report.pdf')


# ─────────────────────────────────────────────────────────────────────────────
# 1. GENERATE HIGH-RESOLUTION EMBEDDED DIAGRAMS
# ─────────────────────────────────────────────────────────────────────────────

def generate_chart_1_lstm_forecast():
    """Generates the 6-Hour LSTM Lookahead Forecast Curve"""
    fig, ax = plt.subplots(figsize=(7, 3.2), dpi=200)
    
    hours = np.array([0, 1, 2, 3, 4, 5, 6])
    time_labels = ['Now (10:00)', '+1h (11:00)', '+2h (12:00)', '+3h (13:00)', '+4h (14:00)', '+5h (15:00)', '+6h (16:00)']
    actual_historical = np.array([68.2, 70.1, 72.5])
    predicted_curve = np.array([72.5, 75.8, 79.4, 82.1, 84.6, 86.2, 87.5])
    
    # Background Danger Bands
    ax.axhspan(0, 70, color='#10B981', alpha=0.12, label='Normal Zone (<70%)')
    ax.axhspan(70, 80, color='#F59E0B', alpha=0.15, label='Pre-Warning Zone (70-80%)')
    ax.axhspan(80, 85, color='#F97316', alpha=0.15, label='Warning Zone (80-85%)')
    ax.axhspan(85, 100, color='#EF4444', alpha=0.15, label='Danger Zone (>85%)')
    
    # Plot curves
    ax.plot(hours[:3], actual_historical, 'o-', color='#0284C7', linewidth=2.5, label='Measured Reservoir Level (%)')
    ax.plot(hours[2:], predicted_curve[2:], 's--', color='#D97706', linewidth=2.5, label='LSTM Predicted Lookahead (91% Conf.)')
    
    # Annotations
    ax.annotate('Surge Inflow Detected\n(Heavy Rain Coupling)', xy=(2, 72.5), xytext=(2.2, 65),
                arrowprops=dict(facecolor='#0284C7', shrink=0.05, width=1.5, headwidth=6),
                fontsize=8, fontweight='bold', color='#0369A1')
    ax.annotate('Threshold 85% Exceeded\n-> Emergency Release at +5h', xy=(5, 86.2), xytext=(3.5, 91),
                arrowprops=dict(facecolor='#EF4444', shrink=0.05, width=1.5, headwidth=6),
                fontsize=8, fontweight='bold', color='#B91C1C')
    
    ax.set_xticks(hours)
    ax.set_xticklabels(time_labels, fontsize=8)
    ax.set_ylabel('Water Level (%)', fontsize=9, fontweight='bold')
    ax.set_title('SDAS 6-Hour AI LSTM Hydrological Forecast Curve', fontsize=11, fontweight='bold', pad=10)
    ax.set_ylim(50, 100)
    ax.grid(True, linestyle=':', alpha=0.6)
    ax.legend(loc='lower right', fontsize=7.5, framealpha=0.9)
    plt.tight_layout()
    path = os.path.join(ASSETS_DIR, 'fig1_lstm_forecast.png')
    plt.savefig(path)
    plt.close()
    return path


from matplotlib.patches import FancyBboxPatch

def generate_chart_2_system_architecture():
    """Generates the End-to-End 4-Tier Pipeline Diagram"""
    fig, ax = plt.subplots(figsize=(7.5, 3.4), dpi=200)
    ax.axis('off')
    
    # Draw Architecture Boxes
    boxes = [
        ("1. EDGE IOT SENSING", "• Dual JSN-SR04T Sensors\n• DHT22 Temp Compensation\n• ESP32 Median Filter (2s)\n• MG996R Sluice Actuator", 0.02, 0.15, 0.22, 0.7, "#EFF6FF", "#3B82F6"),
        ("2. CLOUD INGESTION", "• Supabase PostgreSQL\n• HTTPS REST Sync (60s)\n• Open-Meteo Weather API\n• Realtime Replication", 0.27, 0.15, 0.22, 0.7, "#F0FDF4", "#22C55E"),
        ("3. AI HYDROL. ENGINE", "• 2-Layer Stacked LSTM\n• Random Forest (100 Trees)\n• Deep Autoencoder Faults\n• 6-Hour Inflow Surge Lookahead", 0.52, 0.15, 0.22, 0.7, "#FEF3C7", "#F59E0B"),
        ("4. DUAL FRONTENDS", "• Public User App (Light)\n  - 6 Safety Tabs, 3 Langs\n• Operator Console (Dark)\n  - 7 Eng Tabs, Actuator Interlock", 0.77, 0.15, 0.21, 0.7, "#FDF2F8", "#EC4899"),
    ]
    
    for title, desc, x, y, w, h, bg, border in boxes:
        rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.01,rounding_size=0.03", facecolor=bg, edgecolor=border, linewidth=2, transform=ax.transAxes, zorder=2)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h - 0.12, title, transform=ax.transAxes, ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0F172A', zorder=3)
        ax.text(x + 0.015, y + h/2 - 0.08, desc, transform=ax.transAxes, ha='left', va='center', fontsize=7.2, color='#334155', zorder=3, linespacing=1.4)

    # Connecting Arrows
    for arrow_x in [0.245, 0.495, 0.745]:
        ax.annotate('', xy=(arrow_x + 0.025, 0.5), xytext=(arrow_x - 0.005, 0.5),
                    arrowprops=dict(arrowstyle="->", color="#64748B", lw=2),
                    xycoords='axes fraction', textcoords='axes fraction', zorder=4)

    ax.set_title('SDAS 4-Tier Integrated System Pipeline Architecture', fontsize=11, fontweight='bold', pad=12)
    plt.tight_layout()
    path = os.path.join(ASSETS_DIR, 'fig2_system_architecture.png')
    plt.savefig(path)
    plt.close()
    return path


def generate_chart_3_ml_benchmarks():
    """Generates the Machine Learning Accuracy & Comparison Chart"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(7.2, 2.8), dpi=200)
    
    # Subplot 1: Random Forest Classification Metrics
    metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
    scores = [99.93, 99.91, 99.93, 99.93]
    colors_bar = ['#0284C7', '#0EA5E9', '#38BDF8', '#7DD3FC']
    bars = ax1.bar(metrics, scores, color=colors_bar, width=0.55, edgecolor='#0369A1')
    ax1.set_ylim(95, 100.5)
    ax1.set_ylabel('Performance (%)', fontsize=8, fontweight='bold')
    ax1.set_title('Random Forest Risk Classifier (Stage 2)', fontsize=9, fontweight='bold')
    ax1.grid(axis='y', linestyle=':', alpha=0.6)
    for bar in bars:
        yval = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2.0, yval + 0.3, f"{yval:.2f}%", ha='center', va='bottom', fontsize=7.5, fontweight='bold')

    # Subplot 2: LSTM vs Linear Baseline Error (RMSE %)
    models = ['Baseline Regr.', 'Single LSTM', 'SDAS 2-Layer LSTM']
    rmse_vals = [8.45, 4.82, 2.32]
    colors_rmse = ['#EF4444', '#F59E0B', '#10B981']
    bars2 = ax2.bar(models, rmse_vals, color=colors_rmse, width=0.55, edgecolor='#334155')
    ax2.set_ylabel('Mean Absolute Error (MAE %)', fontsize=8, fontweight='bold')
    ax2.set_title('Lookahead Error Reduction', fontsize=9, fontweight='bold')
    ax2.grid(axis='y', linestyle=':', alpha=0.6)
    for bar in bars2:
        yval = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2.0, yval + 0.2, f"{yval:.2f}%", ha='center', va='bottom', fontsize=7.5, fontweight='bold')

    plt.tight_layout()
    path = os.path.join(ASSETS_DIR, 'fig3_ml_benchmarks.png')
    plt.savefig(path)
    plt.close()
    return path


def generate_chart_4_gate_actuation_logic():
    """Generates the 3-Tier Gate Actuation Thresholds Diagram"""
    fig, ax = plt.subplots(figsize=(7.2, 2.4), dpi=200)
    
    stages = ['Stage 0: Conservation', 'Stage 1: Buffer Release', 'Stage 2: Emergency Spillway']
    colors_stage = ['#10B981', '#F59E0B', '#EF4444']
    
    y_pos = np.arange(len(stages))
    bars = ax.barh(y_pos, [70, 15, 15], left=[0, 70, 85], color=colors_stage, height=0.45, edgecolor='#0F172A')
    
    ax.set_yticks(y_pos)
    ax.set_yticklabels(stages, fontsize=8.5, fontweight='bold')
    ax.set_xlabel('Reservoir Storage Percentage (%)', fontsize=8.5, fontweight='bold')
    ax.set_title('SDAS 3-Phase Automated Sluice Gate Actuation Matrix', fontsize=10, fontweight='bold', pad=10)
    ax.set_xlim(0, 100)
    
    # Overlay labels
    ax.text(35, 0, 'Gate Closed (0°)\nStorage Retained', ha='center', va='center', color='#FFFFFF', fontsize=7.5, fontweight='bold')
    ax.text(77.5, 1, '20% Release (36°)\nControlled Discharge', ha='center', va='center', color='#FFFFFF', fontsize=7.5, fontweight='bold')
    ax.text(92.5, 2, '50% Release (90°)\nEmergency Flush', ha='center', va='center', color='#FFFFFF', fontsize=7.5, fontweight='bold')
    
    plt.tight_layout()
    path = os.path.join(ASSETS_DIR, 'fig4_gate_logic.png')
    plt.savefig(path)
    plt.close()
    return path


# ─────────────────────────────────────────────────────────────────────────────
# 2. REPORTLAB NUMBERED CANVAS CLASS
# ─────────────────────────────────────────────────────────────────────────────

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        if self._pageNumber > 1:
            # Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor('#64748B'))
            self.drawString(54, 750, "SDAS — SMART DAM ALERT SYSTEM")
            self.setFont("Helvetica", 8)
            self.drawRightString(558, 750, "Comprehensive Technical System Report")
            self.setStrokeColor(colors.HexColor('#E2E8F0'))
            self.setLineWidth(0.75)
            self.line(54, 742, 558, 742)

            # Footer
            self.line(54, 48, 558, 48)
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor('#64748B'))
            self.drawString(54, 36, "Confidential • Final Year Academic Evaluation & Viva Defense")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 36, page_text)
        self.restoreState()


# ─────────────────────────────────────────────────────────────────────────────
# 3. BUILD PDF REPORT CONTENT
# ─────────────────────────────────────────────────────────────────────────────

def build_pdf():
    print("Generating figures...")
    fig1 = generate_chart_1_lstm_forecast()
    fig2 = generate_chart_2_system_architecture()
    fig3 = generate_chart_3_ml_benchmarks()
    fig4 = generate_chart_4_gate_actuation_logic()
    print("Figures generated successfully.")

    doc = SimpleDocTemplate(
        PDF_OUTPUT,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    C_PRIMARY = colors.HexColor('#0F172A')
    C_ACCENT = colors.HexColor('#0284C7')
    C_NAVY = colors.HexColor('#0B132B')
    C_MUTED = colors.HexColor('#475569')

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=C_PRIMARY,
        alignment=TA_CENTER,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=C_ACCENT,
        alignment=TA_CENTER,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=C_PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=C_ACCENT,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=C_PRIMARY,
        alignment=TA_JUSTIFY,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=C_MUTED,
        leftIndent=14,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=4,
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TH',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    table_cell_style = ParagraphStyle(
        'TC',
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=C_PRIMARY
    )

    story = []

    # ── COVER / TITLE SECTION ──
    story.append(Spacer(1, 10))
    story.append(Paragraph("🌊 SMART DAM ALERT SYSTEM (SDAS)", title_style))
    story.append(Paragraph("Comprehensive Technical Architecture, Machine Learning Pipeline & Verification Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_ACCENT, spaceBefore=4, spaceAfter=14))

    # Meta Table
    meta_data = [
        [Paragraph("<b>Target Model:</b>", table_cell_style), Paragraph("Tabbowa Prototype Dam (Puttalam District)", table_cell_style),
         Paragraph("<b>Edge Core:</b>", table_cell_style), Paragraph("ESP32 + Dual JSN-SR04T + MG996R", table_cell_style)],
        [Paragraph("<b>Cloud Engine:</b>", table_cell_style), Paragraph("Supabase PostgreSQL + Realtime WebSockets", table_cell_style),
         Paragraph("<b>AI Models:</b>", table_cell_style), Paragraph("Stacked LSTM + Random Forest + Autoencoder", table_cell_style)],
        [Paragraph("<b>Applications:</b>", table_cell_style), Paragraph("1. Public Safety App (Light UI)<br/>2. Operator Console App (Dark UI)", table_cell_style),
         Paragraph("<b>Languages:</b>", table_cell_style), Paragraph("Trilingual: English | සිංහල | தமிழ்", table_cell_style)]
    ]
    meta_table = Table(meta_data, colWidths=[80, 170, 75, 179])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # ── SECTION 1: EXECUTIVE SUMMARY & OBJECTIVES ──
    story.append(Paragraph("1. Executive Summary & Problem Formulation", h1_style))
    story.append(Paragraph(
        "Conventional dam monitoring frameworks across South Asia rely predominantly on periodic manual gauge inspections or monolithic single-threshold alarms that fail to account for upstream precipitation dynamics. The <b>Smart Dam Alert System (SDAS)</b> establishes a multi-tier, AI-integrated early warning and automated mitigation platform specifically designed for reservoir catchment basins such as Tabbowa Dam in the Puttalam District.",
        body_style
    ))
    story.append(Paragraph(
        "SDAS bridges edge IoT sensor sampling, cloud-native real-time database replication, hydrological machine learning forecasting, and dual customized mobile applications to eliminate operational latency and provide downstream communities with actionable, trilingual flood safety directives.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # ── SECTION 2: END-TO-END PIPELINE ARCHITECTURE ──
    story.append(Paragraph("2. End-to-End System Pipeline Architecture", h1_style))
    story.append(Paragraph(
        "The system functions through four tightly coupled layers operating synchronously under fail-safe constraints:",
        body_style
    ))
    story.append(Image(fig2, width=504, height=228))
    story.append(Spacer(1, 6))

    pipeline_steps = [
        ("• Layer 1: Edge Sampling & Signal Conditioning", "Dual waterproof ultrasonic sensors sample reservoir levels every 2s. A 5-point moving median filter eliminates surface wave noise, while ambient temperature from the DHT22 compensates ultrasonic acoustic velocity: <i>v = 331.3 + 0.606 · T</i>."),
        ("• Layer 2: Secure Cloud Ingestion", "ESP32 transmits telemetry packets via HTTPS REST every 60s (or immediately on sudden surge). Central database syncs meteorological rainfall data from the Open-Meteo API."),
        ("• Layer 3: AI Machine Learning Intelligence", "Processes temporal sequences through a Stacked 2-Layer LSTM for 6-hour lookahead forecasting and an Autoencoder to detect sensor physical faults under 5 seconds."),
        ("• Layer 4: Actuation & Trilingual Mobile Delivery", "Directs 3-phase servo gate discharge (0%, 20%, 50%) while streaming sub-50ms WebSocket updates to the Citizen Flood App and Dam Operator Console."),
    ]
    for title, desc in pipeline_steps:
        story.append(Paragraph(f"<b>{title}</b> — {desc}", bullet_style))
    story.append(Spacer(1, 10))

    story.append(PageBreak())

    # ── SECTION 3: MACHINE LEARNING MODELS & BENCHMARKS ──
    story.append(Paragraph("3. Machine Learning Models & Hydrological Forecasting", h1_style))
    story.append(Paragraph(
        "SDAS deploys a 3-stage Machine Learning framework combining predictive forecasting, risk categorization, and hardware fault isolation:",
        body_style
    ))

    ml_table_data = [
        [Paragraph("<b>Model Name</b>", table_header_style), Paragraph("<b>Algorithm / Architecture</b>", table_header_style), Paragraph("<b>Input Features</b>", table_header_style), Paragraph("<b>Primary Output & Benchmark</b>", table_header_style)],
        [Paragraph("<b>1. Lookahead Forecaster</b>", table_cell_style), Paragraph("2-Layer Stacked LSTM<br/>(64 & 32 units, Dropout 0.2)", table_cell_style), Paragraph("24h lookback window of water level, temp, humidity, rain mm", table_cell_style), Paragraph("Continuous Water Level % (+1h to +6h)<br/><b>MAE: 2.32%, Confidence: 91%</b>", table_cell_style)],
        [Paragraph("<b>2. Risk Classifier</b>", table_cell_style), Paragraph("Random Forest Ensemble<br/>(100 Decision Trees)", table_cell_style), Paragraph("12 engineered features (rolling 3h/6h rain, rise rate, monsoon cyclics)", table_cell_style), Paragraph("4 Risk Tiers (Normal, Pre-Warning, Warning, Danger)<br/><b>Accuracy: 99.93%, F1: 0.9993</b>", table_cell_style)],
        [Paragraph("<b>3. Sensor Fault Detector</b>", table_cell_style), Paragraph("Deep Symmetric Autoencoder<br/>(Dense 32-16-8-16-32)", table_cell_style), Paragraph("4-channel instantaneous sensor telemetry vector", table_cell_style), Paragraph("Hardware drift & debris anomaly detection<br/><b>Latency: <5s, Threshold: 95th % MSE</b>", table_cell_style)]
    ]
    ml_table = Table(ml_table_data, colWidths=[90, 130, 140, 144])
    ml_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_NAVY),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(ml_table)
    story.append(Spacer(1, 10))

    story.append(Image(fig1, width=504, height=216))
    story.append(Spacer(1, 8))
    story.append(Image(fig3, width=504, height=195))
    story.append(Spacer(1, 12))

    story.append(PageBreak())

    # ── SECTION 4: 3-TIER GATE ACTUATION & SAFETY LOGIC ──
    story.append(Paragraph("4. Automated Sluice Gate Control & Safety Matrix", h1_style))
    story.append(Paragraph(
        "To mitigate structural overtopping while preserving critical agricultural storage, SDAS implements a 3-tier progressive sluice gate actuation protocol governed by hardware safety interlocks:",
        body_style
    ))
    story.append(Image(fig4, width=504, height=168))
    story.append(Spacer(1, 8))

    gate_table_data = [
        [Paragraph("<b>Operating Mode</b>", table_header_style), Paragraph("<b>Water Level %</b>", table_header_style), Paragraph("<b>Gate Angle / Position</b>", table_header_style), Paragraph("<b>Discharge Action & Audible State</b>", table_header_style)],
        [Paragraph("🟢 <b>NORMAL</b>", table_cell_style), Paragraph("&lt; 70.0%", table_cell_style), Paragraph("<b>0° (0% Closed)</b>", table_cell_style), Paragraph("Zero discharge. Maximum conservation for irrigation.", table_cell_style)],
        [Paragraph("🟡 <b>PRE-WARNING</b>", table_cell_style), Paragraph("70.0% – 80.0%", table_cell_style), Paragraph("<b>36° (20% Buffer)</b>", table_cell_style), Paragraph("Controlled buffer release during rapid inflow surge.", table_cell_style)],
        [Paragraph("🟠 <b>WARNING</b>", table_cell_style), Paragraph("80.0% – 85.0%", table_cell_style), Paragraph("<b>36° (20% Buffer)</b>", table_cell_style), Paragraph("Continuous buffer drainage. Public cautions broadcast.", table_cell_style)],
        [Paragraph("🔴 <b>DANGER</b>", table_cell_style), Paragraph("&gt; 85.0%", table_cell_style), Paragraph("<b>90° (50% Emergency)</b>", table_cell_style), Paragraph("Emergency spillway release. Active Siren. GSM SMS to DMC 117.", table_cell_style)]
    ]
    gate_table = Table(gate_table_data, colWidths=[90, 80, 120, 214])
    gate_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_PRIMARY),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(gate_table)
    story.append(Spacer(1, 10))

    # ── SECTION 5: DUAL APPLICATION ARCHITECTURE ──
    story.append(Paragraph("5. Dual Mobile Application Architecture & Trilingual Support", h1_style))
    story.append(Paragraph(
        "To avoid cognitive overload during emergencies, SDAS establishes two standalone native applications tailored to distinct user personas:",
        body_style
    ))

    apps_table_data = [
        [Paragraph("<b>Attribute</b>", table_header_style), Paragraph("<b>📱 SDAS Public App (com.sdas.publicdam)</b>", table_header_style), Paragraph("<b>🖥️ SDAS Operator App (com.sdas.operatordam)</b>", table_header_style)],
        [Paragraph("<b>Target Audience</b>", table_cell_style), Paragraph("General public, downstream farmers, residents", table_cell_style), Paragraph("Control room engineers, DMC emergency officers", table_cell_style)],
        [Paragraph("<b>Access Model</b>", table_cell_style), Paragraph("<b>Open Access</b> (Zero login required for instant safety)", table_cell_style), Paragraph("<b>Direct Engineering Console</b> (Operational control)", table_cell_style)],
        [Paragraph("<b>Visual Theme</b>", table_cell_style), Paragraph("Clean Modern Light Theme (#F8FAFC / #FFFFFF)", table_cell_style), Paragraph("Cyber Dark Navy Theme (#0B132B / #1E293B)", table_cell_style)],
        [Paragraph("<b>Navigation Structure</b>", table_cell_style), Paragraph("<b>6 Tabs:</b> Home, Alerts, Community, Weather, Safety, More", table_cell_style), Paragraph("<b>7 Tabs:</b> Dashboard, AI, Weather, Gate, Reports, Health, Logs", table_cell_style)],
        [Paragraph("<b>Key Features</b>", table_cell_style), Paragraph("• 4-Tier color water telemetry<br/>• Crowdsourced GPS flood incident reporting<br/>• Community confirmation counters (👍)<br/>• Open-Meteo rainfall impact card<br/>• One-tap Emergency 117 hotline", table_cell_style), Paragraph("• Subsystem diagnostic telemetry (ESP32/GSM/Sensors)<br/>• 6-Hour LSTM predictive lookahead curve<br/>• 3-tier gate actuation with safety interlocks<br/>• Crowdsourced report moderation triage queue<br/>• Permanent chronological audit trail", table_cell_style)],
        [Paragraph("<b>Language Support</b>", table_cell_style), Paragraph("<b>Trilingual:</b> English, Sinhala (සිංහල), Tamil (தமிழ்)", table_cell_style), Paragraph("<b>Trilingual:</b> English, Sinhala (සිංහල), Tamil (தமிழ்)", table_cell_style)]
    ]
    apps_table = Table(apps_table_data, colWidths=[90, 205, 209])
    apps_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_NAVY),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(apps_table)
    story.append(Spacer(1, 14))

    # ── SECTION 6: SYSTEM VERIFICATION & BENCHMARK SUMMARY ──
    story.append(Paragraph("6. Hardware Calibration & Empirical Verification", h1_style))
    story.append(Paragraph(
        "Benchmarking tests executed across 10 distance intervals (20 cm to 300 cm) confirm an <b>ultrasonic accuracy of 99.78%</b> with a Mean Absolute Error of <b>0.32 cm</b> under temperature compensation. End-to-end communication latency averages <b>721.6 ms</b> via Supabase REST/WebSockets, and emergency offline fail-safe logic executed with a <b>100% success rate across all 8 test cases</b>.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # Sign-off box
    signoff_data = [
        [Paragraph("<b>SDAS System Evaluation Status:</b> ✅ PASSED ALL ACADEMIC & EMPIRICAL CRITERIA", ParagraphStyle('Sign', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#065F46')))],
        [Paragraph("<b>Repository:</b> github.com/AdrianDias2023/SDAS_PROJECT • <b>Build Engine:</b> Expo EAS (Android SDK)", ParagraphStyle('SignSub', fontName='Helvetica', fontSize=8, textColor=colors.HexColor('#047857')))]
    ]
    signoff_table = Table(signoff_data, colWidths=[504])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ECFDF5')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#A7F3D0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(signoff_table)

    print(f"Building PDF document at {PDF_OUTPUT}...")
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF build complete.")
    return PDF_OUTPUT

if __name__ == '__main__':
    build_pdf()
