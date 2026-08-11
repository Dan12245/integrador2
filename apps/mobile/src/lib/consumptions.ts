import { getApiUrl } from "./api";

export type DailyConsumption = {
  id: number;
  building_id: number;
  log_date: string; // YYYY-MM-DD
  cubic_meters: number;
  is_manual_entry: boolean;
  created_at: string;
};

/**
 * Fetch all daily consumption records for a building.
 */
export const fetchConsumptions = async (
  buildingId: number
): Promise<DailyConsumption[] | null> => {
  try {
    const res = await fetch(`${getApiUrl()}/consumptions/${buildingId}`);
    if (!res.ok) {
      console.log("Error fetching consumptions:", res.status);
      return null;
    }
    const json = await res.json();
    if (!json.ok) {
      console.log("Backend error:", json.message);
      return null;
    }
    return json.data as DailyConsumption[];
  } catch (error) {
    console.log("Connection error fetching consumptions:", error);
    return null;
  }
};

/**
 * Upsert (insert or update) a single day's consumption.
 */
export const upsertConsumption = async (
  buildingId: number,
  logDate: string, // YYYY-MM-DD
  cubicMeters: number,
  isManualEntry: boolean = true
): Promise<boolean> => {
  try {
    const res = await fetch(`${getApiUrl()}/consumptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        building_id: buildingId,
        log_date: logDate,
        cubic_meters: cubicMeters,
        is_manual_entry: isManualEntry,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      console.log("Error saving consumption:", res.status, data);
      return false;
    }
    return true;
  } catch (error) {
    console.log("Connection error saving consumption:", error);
    return false;
  }
};

/**
 * Delete a single day's consumption record.
 */
export const deleteConsumption = async (
  buildingId: number,
  logDate: string // YYYY-MM-DD
): Promise<boolean> => {
  try {
    const res = await fetch(
      `${getApiUrl()}/consumptions/${buildingId}/${logDate}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      console.log("Error deleting consumption:", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.log("Connection error deleting consumption:", error);
    return false;
  }
};

/**
 * Delete all consumption records for a given month.
 * @param month 1-indexed (1 = January, 12 = December)
 */
export const deleteMonthConsumptions = async (
  buildingId: number,
  year: number,
  month: number
): Promise<boolean> => {
  try {
    const res = await fetch(
      `${getApiUrl()}/consumptions/${buildingId}/month/${year}/${month}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      console.log("Error deleting month consumptions:", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.log("Connection error deleting month consumptions:", error);
    return false;
  }
};

/**
 * Convert an array of DailyConsumption records into the Record<string, number>
 * format used by the chart components. Keys are "buildingId:YYYY-MM-DD".
 */
export const consumptionsToRecords = (
  buildingId: number,
  consumptions: DailyConsumption[]
): Record<string, number> => {
  const records: Record<string, number> = {};
  for (const c of consumptions) {
    records[`${buildingId}:${c.log_date}`] = c.cubic_meters;
  }
  return records;
};
