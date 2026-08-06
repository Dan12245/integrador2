import React from "react";
import { View, useWindowDimensions } from "react-native";
import { BarChart } from "react-native-chart-kit/v2";

export interface ConsumptionsChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
}

export function ConsumptionsChart({ data, width, height }: ConsumptionsChartProps) {
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = width || Math.min(windowWidth - 96, 1150);
  const isLargeScreen = windowWidth >= 1024;
  const chartHeight = height || (isLargeScreen ? 380 : 240);

  return (
    <View className=" pt-2 w-full items-center">
      <BarChart
        data={data}
        xKey="label"
        yKey="value"
        scrollable
        visiblePoints={7}
        width={chartWidth}
        height={chartHeight}
      />
    </View>
  );
}

export default ConsumptionsChart;
