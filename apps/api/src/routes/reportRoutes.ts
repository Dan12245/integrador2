import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import {
  createPdfReport,
  type BuildingInfo,
  type MonthPageData,
  type ReportSection,
  type DailyEntry,
} from "./pdfGenerator";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

const reportRouter = new Hono<{ Bindings: Bindings }>();

const getSupabaseClient = (c: any) => {
  const url = (c.env.SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
  const key = (c.env.SUPABASE_SERVICE_ROLE_KEY || c.env.SUPABASE_KEY || '').trim().replace(/^["']|["']$/g, '');
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Helper Functions ────────────────────────────────────────────

async function fetchMonthData(
  supabase: any,
  buildingId: number,
  year: number,
  month: number // 1-indexed
): Promise<DailyEntry[]> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("daily_consumptions")
    .select("log_date, cubic_meters")
    .eq("building_id", buildingId)
    .gte("log_date", startDate)
    .lte("log_date", endDate)
    .order("log_date", { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => {
    const day = parseInt(row.log_date.split("-")[2], 10);
    return { day, value: row.cubic_meters };
  });
}

async function fetchBuildingInfo(
  supabase: any,
  buildingId: number
): Promise<BuildingInfo | null> {
  const { data, error } = await supabase
    .from("buildings")
    .select("id, alias, contract_number, address, description")
    .eq("id", buildingId)
    .single();

  if (error || !data) return null;
  return data as BuildingInfo;
}

async function fetchUserBuildings(
  supabase: any,
  profileId: string
): Promise<BuildingInfo[]> {
  const { data, error } = await supabase
    .from("buildings")
    .select("id, alias, contract_number, address, description")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as BuildingInfo[];
}

function getGeneratedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function buildMonthPages(
  supabase: any,
  buildingId: number,
  monthList: { year: number; month: number }[]
): Promise<MonthPageData[]> {
  const pages: MonthPageData[] = [];

  for (const { year, month } of monthList) {
    const entries = await fetchMonthData(supabase, buildingId, year, month);
    if (entries.length === 0) continue;

    const total = entries.reduce((acc, e) => acc + e.value, 0);
    pages.push({
      year,
      month,
      monthName: MONTH_NAMES[month - 1],
      entries,
      total,
    });
  }

  return pages;
}

// ─── Routes (Specific "all" routes MUST be defined before parameterized routes) ──

/**
 * GET /report/monthly/all/:year/:month?profile_id=<uuid>
 * Monthly report for ALL user buildings combined into one PDF
 */
reportRouter.get("/report/monthly/all/:year/:month", async (c) => {
  const year = parseInt(c.req.param("year"), 10);
  const month = parseInt(c.req.param("month"), 10);
  const profileId = c.req.query("profile_id");

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return c.json({ ok: false, message: "Invalid parameters" }, 400);
  }
  if (!profileId) {
    return c.json({ ok: false, message: "profile_id query param required" }, 400);
  }

  const supabase = getSupabaseClient(c);
  const buildings = await fetchUserBuildings(supabase, profileId);
  if (buildings.length === 0) {
    return c.json({ ok: false, message: "No buildings found" }, 404);
  }

  try {
    const sections: ReportSection[] = [];

    for (const building of buildings) {
      const pages = await buildMonthPages(supabase, building.id, [{ year, month }]);
      if (pages.length > 0) {
        sections.push({ building, pages });
      }
    }

    if (sections.length === 0) {
      return c.json({ ok: false, message: "No consumption data found for any building" }, 404);
    }

    const pdfBytes = await createPdfReport(sections, getGeneratedDate());

    return new Response(pdfBytes.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="report_all_buildings_${year}_${month}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return c.json({ ok: false, message: "Error generating PDF", error: err.message }, 500);
  }
});

/**
 * GET /report/yearly/all/:year?profile_id=<uuid>
 * Yearly report for ALL buildings combined into one PDF
 */
reportRouter.get("/report/yearly/all/:year", async (c) => {
  const year = parseInt(c.req.param("year"), 10);
  const profileId = c.req.query("profile_id");

  if (isNaN(year)) {
    return c.json({ ok: false, message: "Invalid year" }, 400);
  }
  if (!profileId) {
    return c.json({ ok: false, message: "profile_id query param required" }, 400);
  }

  const supabase = getSupabaseClient(c);
  const buildings = await fetchUserBuildings(supabase, profileId);
  if (buildings.length === 0) {
    return c.json({ ok: false, message: "No buildings found" }, 404);
  }

  const monthList = Array.from({ length: 12 }, (_, i) => ({ year, month: i + 1 }));

  try {
    const sections: ReportSection[] = [];

    for (const building of buildings) {
      const pages = await buildMonthPages(supabase, building.id, monthList);
      if (pages.length > 0) {
        sections.push({ building, pages });
      }
    }

    if (sections.length === 0) {
      return c.json({ ok: false, message: "No consumption data for any building this year" }, 404);
    }

    const pdfBytes = await createPdfReport(sections, getGeneratedDate());

    return new Response(pdfBytes.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="report_all_buildings_${year}_yearly.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return c.json({ ok: false, message: "Error generating PDF", error: err.message }, 500);
  }
});

/**
 * GET /report/monthly/:buildingId/:year/:month
 * Single-month report for one building
 */
reportRouter.get("/report/monthly/:buildingId/:year/:month", async (c) => {
  const buildingId = parseInt(c.req.param("buildingId"), 10);
  const year = parseInt(c.req.param("year"), 10);
  const month = parseInt(c.req.param("month"), 10);

  if (isNaN(buildingId) || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return c.json({ ok: false, message: "Invalid parameters" }, 400);
  }

  const supabase = getSupabaseClient(c);
  const building = await fetchBuildingInfo(supabase, buildingId);
  if (!building) {
    return c.json({ ok: false, message: "Building not found" }, 404);
  }

  try {
    const pages = await buildMonthPages(supabase, buildingId, [{ year, month }]);

    if (pages.length === 0) {
      return c.json({ ok: false, message: "No consumption data for this month" }, 404);
    }

    const sections: ReportSection[] = [{ building, pages }];
    const pdfBytes = await createPdfReport(sections, getGeneratedDate());

    return new Response(pdfBytes.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="report_${building.alias}_${year}_${month}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return c.json({ ok: false, message: "Error generating PDF", error: err.message }, 500);
  }
});

/**
 * GET /report/yearly/:buildingId/:year
 * Yearly report for one building (one page per month with data)
 */
reportRouter.get("/report/yearly/:buildingId/:year", async (c) => {
  const buildingId = parseInt(c.req.param("buildingId"), 10);
  const year = parseInt(c.req.param("year"), 10);

  if (isNaN(buildingId) || isNaN(year)) {
    return c.json({ ok: false, message: "Invalid parameters" }, 400);
  }

  const supabase = getSupabaseClient(c);
  const building = await fetchBuildingInfo(supabase, buildingId);
  if (!building) {
    return c.json({ ok: false, message: "Building not found" }, 404);
  }

  const monthList = Array.from({ length: 12 }, (_, i) => ({ year, month: i + 1 }));

  try {
    const pages = await buildMonthPages(supabase, buildingId, monthList);

    if (pages.length === 0) {
      return c.json({ ok: false, message: "No consumption data for this year" }, 404);
    }

    const sections: ReportSection[] = [{ building, pages }];
    const pdfBytes = await createPdfReport(sections, getGeneratedDate());

    return new Response(pdfBytes.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="report_${building.alias}_${year}_yearly.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return c.json({ ok: false, message: "Error generating PDF", error: err.message }, 500);
  }
});

/**
 * GET /report/available-months/:buildingId
 * Returns year-month combos that have consumption data for a building
 */
reportRouter.get("/report/available-months/:buildingId", async (c) => {
  const buildingId = parseInt(c.req.param("buildingId"), 10);
  if (isNaN(buildingId)) {
    return c.json({ ok: false, message: "Invalid building ID" }, 400);
  }

  const supabase = getSupabaseClient(c);
  const { data, error } = await supabase
    .from("daily_consumptions")
    .select("log_date")
    .eq("building_id", buildingId)
    .order("log_date", { ascending: true });

  if (error || !data) {
    return c.json({ ok: false, message: "Error fetching data" }, 500);
  }

  const monthSet = new Set<string>();
  for (const row of data) {
    const [y, m] = (row as any).log_date.split("-");
    monthSet.add(`${y}-${m}`);
  }

  const months = Array.from(monthSet).map((ym) => {
    const [y, m] = ym.split("-");
    return { year: parseInt(y, 10), month: parseInt(m, 10) };
  });

  return c.json({ ok: true, data: months });
});

export default reportRouter;
