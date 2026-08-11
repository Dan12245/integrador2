import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { CRA_LOGO_BASE64 } from "./craLogoBase64";

export interface DailyEntry {
  day: number;
  value: number;
}

export interface MonthPageData {
  year: number;
  month: number; // 1-indexed
  monthName: string;
  entries: DailyEntry[];
  total: number;
}

export interface BuildingInfo {
  id: number;
  alias: string;
  contract_number: string;
  address: string;
  description: string;
}

export interface ReportSection {
  building: BuildingInfo;
  pages: MonthPageData[];
}

// Colors
const PRIMARY_BLUE = rgb(0.16, 0.5, 0.72); // #2980b9
const LIGHT_BLUE = rgb(0.36, 0.68, 0.89); // #5dade2
const DARK_BLUE = rgb(0.11, 0.31, 0.45); // #1b4f72
const TEXT_DARK = rgb(0.17, 0.24, 0.31); // #2c3e50
const TEXT_GRAY = rgb(0.5, 0.55, 0.55); // #7f8c8d
const LINE_GRAY = rgb(0.85, 0.88, 0.89); // #d6dbdf
const FILL_BLUE = rgb(0.83, 0.91, 0.97); // light translucent blue fill

/**
 * Generates a complete PDF document from a list of sections (buildings + pages).
 * Uses pdf-lib for pure JavaScript PDF generation (100% compatible with Cloudflare Workers).
 */
export async function createPdfReport(
  sections: ReportSection[],
  generatedDate: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Decode CRA logo base64
  let logoImage: any = null;
  try {
    const logoBytes = Uint8Array.from(atob(CRA_LOGO_BASE64), (c) => c.charCodeAt(0));
    logoImage = await pdfDoc.embedPng(logoBytes);
  } catch (e) {
    console.error("Error embedding CRA logo image:", e);
  }

  // Count total pages across all sections
  const totalPages = sections.reduce((sum, sec) => sum + sec.pages.length, 0);
  let globalPageNum = 0;

  for (const section of sections) {
    for (const pageData of section.pages) {
      globalPageNum++;

      // Create A4 page (595.28 x 841.89 pt)
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      // 1. Watermark background
      if (logoImage) {
        const logoSize = 340;
        page.drawImage(logoImage, {
          x: (width - logoSize) / 2,
          y: (height - logoSize) / 2,
          width: logoSize,
          height: logoSize,
          opacity: 0.09,
        });
      }

      // 2. Header
      let currentY = height - 45;

      page.drawText(`Water consumption report #${section.building.id}`, {
        x: 40,
        y: currentY,
        size: 20,
        font: fontHelveticaBold,
        color: PRIMARY_BLUE,
      });

      currentY -= 16;
      page.drawText(`Date: ${generatedDate} — ${pageData.monthName} ${pageData.year}`, {
        x: 40,
        y: currentY,
        size: 9.5,
        font: fontHelvetica,
        color: TEXT_GRAY,
      });

      // 3. Building Info
      currentY -= 24;

      // Blue accent line on left of building section
      page.drawLine({
        start: { x: 40, y: currentY + 12 },
        end: { x: 40, y: currentY - 42 },
        thickness: 3,
        color: LIGHT_BLUE,
      });

      page.drawText("Building information", {
        x: 48,
        y: currentY,
        size: 10.5,
        font: fontHelveticaBold,
        color: TEXT_DARK,
      });

      currentY -= 13;
      page.drawText(section.building.alias || "Building", {
        x: 48,
        y: currentY,
        size: 9,
        font: fontHelvetica,
        color: TEXT_GRAY,
      });

      currentY -= 12;
      page.drawText(section.building.address || "No address provided", {
        x: 48,
        y: currentY,
        size: 9,
        font: fontHelvetica,
        color: TEXT_GRAY,
      });

      if (section.building.contract_number) {
        currentY -= 12;
        page.drawText(`Contract: ${section.building.contract_number}`, {
          x: 48,
          y: currentY,
          size: 9,
          font: fontHelvetica,
          color: TEXT_GRAY,
        });
      }

      // 4. Two-Column Layout (Left: Table, Right: Charts)
      const topTableY = currentY - 25;
      const leftColX = 40;
      const leftColWidth = 240;
      const rightColX = 300;
      const rightColWidth = 255;

      // ─── Left Column: Daily Consumption Table ────────────────
      let tableY = topTableY;

      // Table Header line
      page.drawLine({
        start: { x: leftColX, y: tableY },
        end: { x: leftColX + leftColWidth, y: tableY },
        thickness: 1.5,
        color: DARK_BLUE,
      });

      tableY -= 12;
      page.drawText("Day", {
        x: leftColX,
        y: tableY,
        size: 9,
        font: fontHelveticaBold,
        color: DARK_BLUE,
      });

      const headerRightText = "Consumption (m³)";
      const headerRightWidth = fontHelveticaBold.widthOfTextAtSize(headerRightText, 9);
      page.drawText(headerRightText, {
        x: leftColX + leftColWidth - headerRightWidth,
        y: tableY,
        size: 9,
        font: fontHelveticaBold,
        color: DARK_BLUE,
      });

      tableY -= 5;
      page.drawLine({
        start: { x: leftColX, y: tableY },
        end: { x: leftColX + leftColWidth, y: tableY },
        thickness: 0.8,
        color: DARK_BLUE,
      });

      // Table Rows
      const rowHeight = 15;
      const entries = pageData.entries;

      entries.forEach((entry) => {
        tableY -= rowHeight;

        // Thin row separator
        page.drawLine({
          start: { x: leftColX, y: tableY + 3 },
          end: { x: leftColX + leftColWidth, y: tableY + 3 },
          thickness: 0.3,
          color: LINE_GRAY,
        });

        // Day label
        page.drawText(String(entry.day), {
          x: leftColX,
          y: tableY + 5,
          size: 8.5,
          font: fontHelveticaBold,
          color: TEXT_DARK,
        });

        // Value label (formatted to 2 decimals)
        const valStr = entry.value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        const valWidth = fontHelvetica.widthOfTextAtSize(valStr, 8.5);
        page.drawText(valStr, {
          x: leftColX + leftColWidth - valWidth,
          y: tableY + 5,
          size: 8.5,
          font: fontHelvetica,
          color: TEXT_DARK,
        });
      });

      // Table Footer / Grand Total
      tableY -= 10;
      page.drawLine({
        start: { x: leftColX, y: tableY + 6 },
        end: { x: leftColX + leftColWidth, y: tableY + 6 },
        thickness: 1,
        color: DARK_BLUE,
      });

      const totalStr = `Grand total: ${pageData.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
      const totalWidth = fontHelveticaBold.widthOfTextAtSize(totalStr, 10);
      page.drawText(totalStr, {
        x: leftColX + (leftColWidth - totalWidth) / 2,
        y: tableY - 6,
        size: 10,
        font: fontHelveticaBold,
        color: TEXT_DARK,
      });

      // ─── Right Column: SVG Line Charts ────────────────────────
      let chartY = topTableY;

      // Divide month into segments (up to 3 charts)
      const chartSegments: { title: string; data: number[]; labels: string[] }[] = [];

      if (entries.length > 0) {
        const maxDay = Math.max(...entries.map((e) => e.day));
        const dayMap = new Map(entries.map((e) => [e.day, e.value]));
        const allDays = Array.from({ length: maxDay }, (_, i) => i + 1);
        const allValues = allDays.map((d) => dayMap.get(d) || 0);
        const allLabels = allDays.map((d) => String(d));

        if (maxDay <= 10) {
          chartSegments.push({ title: `Daily consumption`, data: allValues, labels: allLabels });
        } else if (maxDay <= 20) {
          chartSegments.push({ title: `Days 1–10`, data: allValues.slice(0, 10), labels: allLabels.slice(0, 10) });
          chartSegments.push({ title: `Days 11–${maxDay}`, data: allValues.slice(10), labels: allLabels.slice(10) });
        } else {
          chartSegments.push({ title: `Days 1–10`, data: allValues.slice(0, 10), labels: allLabels.slice(0, 10) });
          chartSegments.push({ title: `Days 11–20`, data: allValues.slice(10, 20), labels: allLabels.slice(10, 20) });
          chartSegments.push({ title: `Days 21–${maxDay}`, data: allValues.slice(20), labels: allLabels.slice(20) });
        }
      }

      const chartHeight = 140;

      chartSegments.forEach((seg) => {
        drawSingleChart(
          page,
          seg.title,
          seg.data,
          seg.labels,
          rightColX,
          chartY - chartHeight,
          rightColWidth,
          chartHeight - 15,
          fontHelvetica,
          fontHelveticaBold
        );
        chartY -= chartHeight + 12;
      });

      // 5. Page Number Footer
      const footerText = `${globalPageNum} / ${totalPages}`;
      const footerWidth = fontHelvetica.widthOfTextAtSize(footerText, 8.5);
      page.drawText(footerText, {
        x: (width - footerWidth) / 2,
        y: 25,
        size: 8.5,
        font: fontHelvetica,
        color: TEXT_GRAY,
      });
    }
  }

  return pdfDoc.save();
}

/**
 * Draws a clean line chart inside a bounding rectangle.
 */
function drawSingleChart(
  page: any,
  title: string,
  data: number[],
  labels: string[],
  startX: number,
  startY: number,
  width: number,
  height: number,
  fontReg: any,
  fontBold: any
) {
  // Chart background box
  page.drawRectangle({
    x: startX,
    y: startY,
    width: width,
    height: height,
    borderColor: LINE_GRAY,
    borderWidth: 0.5,
    color: rgb(0.98, 0.99, 1.0),
  });

  // Chart title
  page.drawText(title, {
    x: startX + 8,
    y: startY + height - 12,
    size: 8,
    font: fontBold,
    color: DARK_BLUE,
  });

  const padLeft = 28;
  const padRight = 12;
  const padTop = 20;
  const padBottom = 18;

  const plotX = startX + padLeft;
  const plotY = startY + padBottom;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxVal = Math.max(...data, 1);

  // Y-axis grid lines (3 lines: 0, max/2, max)
  const yTicks = [0, maxVal / 2, maxVal];
  yTicks.forEach((tick) => {
    const tickY = plotY + (tick / maxVal) * plotH;

    // Grid line
    page.drawLine({
      start: { x: plotX, y: tickY },
      end: { x: plotX + plotW, y: tickY },
      thickness: 0.4,
      color: LINE_GRAY,
    });

    // Y label text
    const tickStr = tick.toFixed(0);
    const labelW = fontReg.widthOfTextAtSize(tickStr, 6);
    page.drawText(tickStr, {
      x: plotX - labelW - 4,
      y: tickY - 2,
      size: 6,
      font: fontReg,
      color: TEXT_GRAY,
    });
  });

  if (data.length === 0) return;

  // Calculate coordinates for points
  const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW;
  const points = data.map((v, i) => ({
    x: plotX + i * stepX,
    y: plotY + (v / maxVal) * plotH,
  }));

  // Draw light blue filled area under the line
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // Draw small vertical stripe polygons for area fill
    const steps = 10;
    for (let s = 0; s < steps; s++) {
      const t1 = s / steps;
      const t2 = (s + 1) / steps;
      const xA = p1.x + t1 * (p2.x - p1.x);
      const xB = p1.x + t2 * (p2.x - p1.x);
      const yA = p1.y + t1 * (p2.y - p1.y);
      const yB = p1.y + t2 * (p2.y - p1.y);

      const stripW = xB - xA;
      const avgY = (yA + yB) / 2 - plotY;

      if (stripW > 0 && avgY > 0) {
        page.drawRectangle({
          x: xA,
          y: plotY,
          width: stripW + 0.5,
          height: avgY,
          color: FILL_BLUE,
        });
      }
    }
  }

  // Draw chart line segments
  for (let i = 0; i < points.length - 1; i++) {
    page.drawLine({
      start: points[i],
      end: points[i + 1],
      thickness: 1.5,
      color: PRIMARY_BLUE,
    });
  }

  // Draw point dots (circles)
  points.forEach((p, i) => {
    page.drawCircle({
      x: p.x,
      y: p.y,
      size: 2.2,
      color: rgb(1, 1, 1),
      borderColor: PRIMARY_BLUE,
      borderWidth: 1,
    });

    // X-axis label
    const labelStr = labels[i] || "";
    if (labelStr) {
      const labelW = fontReg.widthOfTextAtSize(labelStr, 6);
      page.drawText(labelStr, {
        x: p.x - labelW / 2,
        y: plotY - 10,
        size: 6,
        font: fontReg,
        color: TEXT_GRAY,
      });
    }
  });
}
