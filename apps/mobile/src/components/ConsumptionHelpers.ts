// Date and consumption calculation helpers

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export const SHORT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const computeChartData = (period: string, building: string | number, records: Record<string, number>) => {
  const currentDate = new Date();

  if (period === "Week") {
    const monday = getMonday(currentDate);
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return dayNames.map((day, idx) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + idx);
      const key = `${building}:${formatDateKey(dayDate)}`;
      const val = records[key] || 0;
      return {
        label: day,
        value: Math.round(val * 10) / 10,
      };
    });
  }

  if (period === "Month") {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const todayDate = currentDate.getDate();

    return Array.from({ length: todayDate }, (_, i) => {
      const dayNum = i + 1;
      const dayDate = new Date(currentYear, currentMonth, dayNum);
      const key = `${building}:${formatDateKey(dayDate)}`;
      const val = records[key] || 0;

      return {
        label: `${dayNum}`,
        value: Math.round(val * 10) / 10,
      };
    });
  }

  // Year period: months Jan through current month of actual year
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  return SHORT_MONTH_NAMES.slice(0, currentMonth + 1).map((monthName, mIdx) => {
    const daysInM = getDaysInMonth(currentYear, mIdx);
    let monthTotal = 0;
    for (let d = 1; d <= daysInM; d++) {
      const key = `${building}:${formatDateKey(new Date(currentYear, mIdx, d))}`;
      monthTotal += records[key] || 0;
    }
    return {
      label: monthName,
      value: Math.round(monthTotal * 10) / 10,
    };
  });
};
