// packages/shared/index.ts
export interface WaterReading {
  id: string;
  building_id: string;
  liters_consumed: number;
  timestamp: string;
}