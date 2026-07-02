import { LineChart } from "react-native-chart-kit/v2";

const data = [
  { month: "Jan", revenue: 52 },
  { month: "Feb", revenue: 86 },
  { month: "Mar", revenue: 58 },
  { month: "Apr", revenue: 134 },
  { month: "May", revenue: 95 },
  { month: "Jun", revenue: 177 }
];

export function ConsumptionsChart() {
  return (
    <LineChart
      data={data}
      xKey="month"
      yKey="revenue"
      width={410}
      height={240}
    />
  );
}