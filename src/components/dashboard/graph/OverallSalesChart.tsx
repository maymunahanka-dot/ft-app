import { Colors } from "@/src/constants/theme";
import { scaleFontSize, spacing } from "@/src/utils/random";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

// const { width } = Dimensions.get("window");

type TimeRange = "1W" | "1M" | "6M" | "1Y";

type Order = {
  id: string;
  price: number;
  orderDate: string;
  status: string;
};

type Income = {
  id: string;
  amount: number;
  date: string;
};

type Props = {
  orders: Order[];
  income: Income[];
};

type PeriodData = {
  label: string;
  currentYear: number;
  lastYear: number;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Get dynamic labels based on filter
const getComparisonLabel = (range: TimeRange): string => {
  switch (range) {
    case "1W":
      return "vs last Week";
    case "1M":
      return "vs last Month";
    case "6M":
      return "vs last 6 Months";
    case "1Y":
      return "vs last Year";
  }
};

const getCurrentPeriodLabel = (range: TimeRange): string => {
  switch (range) {
    case "1W":
      return "This Week";
    case "1M":
      return "This Month";
    case "6M":
      return "Last 6 Months";
    case "1Y":
      return "This Year";
  }
};

const getLastPeriodLabel = (range: TimeRange): string => {
  switch (range) {
    case "1W":
      return "Last Week";
    case "1M":
      return "Last Month";
    case "6M":
      return "Previous 6 Months";
    case "1Y":
      return "Last Year";
  }
};

export const OverallSalesChart: React.FC<Props> = ({ orders, income }) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1Y");

  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;

    const allTransactions = [
      ...orders.map((o) => ({ amount: o.price, date: o.orderDate })),
      ...income.map((i) => ({ amount: i.amount, date: i.date })),
    ];

    let startDate: Date;
    let periodsToShow: PeriodData[] = [];

    switch (selectedRange) {
      case "1W": {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);

        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          const label = `${currentDate.getDate()}`;

          periodsToShow.push({
            label,
            currentYear: 0,
            lastYear: 0,
          });
        }

        allTransactions.forEach((transaction) => {
          const date = new Date(transaction.date);
          const year = date.getFullYear();

          if (year === currentYear) {
            const daysDiff = Math.floor(
              (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysDiff >= 0 && daysDiff < 7) {
              periodsToShow[daysDiff].currentYear += transaction.amount;
            }
          } else if (year === lastYear) {
            const lastYearStart = new Date(startDate);
            lastYearStart.setFullYear(lastYear);
            const daysDiff = Math.floor(
              (date.getTime() - lastYearStart.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysDiff >= 0 && daysDiff < 7) {
              periodsToShow[daysDiff].lastYear += transaction.amount;
            }
          }
        });
        break;
      }

      case "1M": {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 27);

        for (let i = 0; i < 4; i++) {
          periodsToShow.push({
            label: `W${i + 1}`,
            currentYear: 0,
            lastYear: 0,
          });
        }

        allTransactions.forEach((transaction) => {
          const date = new Date(transaction.date);
          const year = date.getFullYear();

          if (year === currentYear) {
            const daysDiff = Math.floor(
              (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            const weekIndex = Math.floor(daysDiff / 7);
            if (weekIndex >= 0 && weekIndex < 4) {
              periodsToShow[weekIndex].currentYear += transaction.amount;
            }
          } else if (year === lastYear) {
            const lastYearStart = new Date(startDate);
            lastYearStart.setFullYear(lastYear);
            const daysDiff = Math.floor(
              (date.getTime() - lastYearStart.getTime()) / (1000 * 60 * 60 * 24)
            );
            const weekIndex = Math.floor(daysDiff / 7);
            if (weekIndex >= 0 && weekIndex < 4) {
              periodsToShow[weekIndex].lastYear += transaction.amount;
            }
          }
        });
        break;
      }

      case "6M": {
        const currentMonth = now.getMonth();
        const startMonth = currentMonth - 5;

        for (let i = 0; i < 6; i++) {
          const monthIndex = (startMonth + i + 12) % 12;
          periodsToShow.push({
            label: MONTHS[monthIndex],
            currentYear: 0,
            lastYear: 0,
          });
        }

        allTransactions.forEach((transaction) => {
          const date = new Date(transaction.date);
          const year = date.getFullYear();
          const month = date.getMonth();

          let monthsAgo = (currentMonth - month + 12) % 12;
          if (monthsAgo > 6) monthsAgo = 12 - monthsAgo;

          if (year === currentYear && monthsAgo <= 5) {
            const index = 5 - monthsAgo;
            if (index >= 0 && index < 6) {
              periodsToShow[index].currentYear += transaction.amount;
            }
          } else if (year === lastYear && monthsAgo <= 5) {
            const index = 5 - monthsAgo;
            if (index >= 0 && index < 6) {
              periodsToShow[index].lastYear += transaction.amount;
            }
          }
        });
        break;
      }

      case "1Y": {
        periodsToShow = MONTHS.map((month) => ({
          label: month,
          currentYear: 0,
          lastYear: 0,
        }));

        allTransactions.forEach((transaction) => {
          const date = new Date(transaction.date);
          const year = date.getFullYear();
          const month = date.getMonth();

          if (year === currentYear) {
            periodsToShow[month].currentYear += transaction.amount;
          } else if (year === lastYear) {
            periodsToShow[month].lastYear += transaction.amount;
          }
        });
        break;
      }
    }

    return periodsToShow;
  }, [orders, income, selectedRange]);

  const percentageChange = useMemo(() => {
    const currentTotal = chartData.reduce((sum, d) => sum + d.currentYear, 0);
    const lastTotal = chartData.reduce((sum, d) => sum + d.lastYear, 0);

    if (lastTotal === 0) return currentTotal > 0 ? 100 : 0;
    return ((currentTotal - lastTotal) / lastTotal) * 100;
  }, [chartData]);

  const maxValue = useMemo(() => {
    const allValues = chartData.flatMap((d) => [d.currentYear, d.lastYear]);
    const max = Math.max(...allValues, 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil(max / magnitude) * magnitude;
  }, [chartData]);

  // Dynamic Y-axis labels with smart step calculation based on selected range
  const { yAxisLabels, actualMaxValue } = useMemo(() => {
    const formatValue = (val: number) => {
      if (val === 0) return `₦0`;
      if (val >= 1000000) {
        const millions = val / 1000000;
        return millions % 1 === 0
          ? `₦${millions}M`
          : `₦${millions.toFixed(1)}M`;
      }
      if (val >= 1000) {
        const thousands = val / 1000;
        return thousands % 1 === 0
          ? `₦${thousands}K`
          : `₦${thousands.toFixed(0)}K`;
      }
      return `₦${val}`;
    };

    // Determine appropriate step size based on maxValue AND selected range
    let step: number;

    if (selectedRange === "1W") {
      if (maxValue >= 10000) {
        step = 5000;
      } else if (maxValue >= 1000) {
        step = 1000;
      } else if (maxValue >= 500) {
        step = 200;
      } else if (maxValue >= 100) {
        step = 50;
      } else if (maxValue >= 50) {
        step = 20;
      } else {
        step = 10;
      }
    } else if (selectedRange === "1M") {
      // For monthly data
      if (maxValue >= 50000) {
        step = 20000;
      } else if (maxValue >= 10000) {
        step = 5000;
      } else if (maxValue >= 5000) {
        step = 2000;
      } else if (maxValue >= 1000) {
        step = 500;
      } else {
        step = 100;
      }
    } else if (selectedRange === "6M") {
      // For 6 months data
      if (maxValue >= 1000000) {
        step = 500000; // 500K
      } else if (maxValue >= 500000) {
        step = 200000; // 200K
      } else if (maxValue >= 100000) {
        step = 50000; // 50K
      } else if (maxValue >= 50000) {
        step = 20000; // 20K
      } else if (maxValue >= 10000) {
        step = 5000; // 5K
      } else {
        step = 1000;
      }
    } else {
      // "1Y"
      // For yearly data - largest increments
      if (maxValue >= 10000000) {
        // 10M+
        step = 2000000; // 2M
      } else if (maxValue >= 5000000) {
        // 5M+
        step = 1000000; // 1M
      } else if (maxValue >= 1000000) {
        // 1M+
        step = 500000; // 500K
      } else if (maxValue >= 500000) {
        step = 200000; // 200K
      } else if (maxValue >= 100000) {
        step = 50000; // 50K
      } else {
        step = 10000; // 10K
      }
    }

    // Round up maxValue to nearest step
    const adjustedMax = Math.ceil(maxValue / step) * step;

    const labels = [
      adjustedMax,
      Math.round((adjustedMax * 2) / 3),
      Math.round(adjustedMax / 3),
      0,
    ];

    return {
      yAxisLabels: labels.map(formatValue),
      actualMaxValue: adjustedMax,
    };
  }, [maxValue, selectedRange]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Overall Sales</Text>
            <View style={styles.changeContainer}>
              <Text
                style={[
                  styles.changeIcon,
                  percentageChange >= 0 && styles.positive,
                ]}
              >
                {percentageChange >= 0 ? "↑" : "↓"}
              </Text>
              <Text
                style={[
                  styles.changeText,
                  percentageChange >= 0 && styles.positive,
                ]}
              >
                {Math.abs(percentageChange).toFixed(1)}%{" "}
                {getComparisonLabel(selectedRange)}
              </Text>
            </View>
          </View>

          <View style={styles.timeRangeButtons}>
            {(["1W", "1M", "6M", "1Y"] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => setSelectedRange(range)}
                style={[
                  styles.rangeButton,
                  selectedRange === range && styles.rangeButtonActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.rangeButtonText,
                    selectedRange === range && styles.rangeButtonTextActive,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.lastYearColor]} />
            <Text style={styles.legendText}>
              {getLastPeriodLabel(selectedRange)}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.runningYearColor]} />
            <Text style={styles.legendText}>
              {getCurrentPeriodLabel(selectedRange)}
            </Text>
          </View>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {/* Y-axis */}
        <View style={styles.yAxis}>
          {yAxisLabels.map((label, i) => (
            <Text key={i} style={styles.yAxisLabel}>
              {label}
            </Text>
          ))}
        </View>

        {/* Chart content */}
        <View style={styles.chartContent}>
          {/* Grid lines */}
          <View style={styles.gridLines}>
            {yAxisLabels.map((_, i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>

          {/* Bars */}
          <View style={styles.barsContainer}>
            {chartData.map((data, index) => (
              <View key={`${data.label}-${index}`} style={styles.barGroup}>
                <AnimatedBar
                  value={data.lastYear}
                  maxValue={actualMaxValue}
                  color="rgba(24, 144, 139, 0.5)"
                  delay={index * 30}
                />
                <AnimatedBar
                  value={data.currentYear}
                  maxValue={actualMaxValue}
                  color="rgba(22, 152, 141, 1)"
                  delay={index * 30 + 15}
                />
              </View>
            ))}
          </View>

          {/* X-axis */}
          <View style={styles.xAxis}>
            {chartData.map((data, index) => (
              <Text key={`${data.label}-${index}`} style={styles.xAxisLabel}>
                {data.label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

type AnimatedBarProps = {
  value: number;
  maxValue: number;
  color: string;
  delay: number;
};

const AnimatedBar: React.FC<AnimatedBarProps> = ({
  value,
  maxValue,
  color,
  delay,
}) => {
  const height = useSharedValue(0);
  const CHART_HEIGHT = 200;

  React.useEffect(() => {
    const targetHeight = maxValue > 0 ? (value / maxValue) * CHART_HEIGHT : 0;
    height.value = withDelay(
      delay,
      withTiming(targetHeight, { duration: 600 })
    );
  }, [value, maxValue, delay, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  if (value === 0) {
    return (
      <View
        style={[
          styles.bar,
          { height: 2, backgroundColor: color, opacity: 0.3 },
        ]}
      />
    );
  }

  return (
    <Animated.View
      style={[styles.bar, { backgroundColor: color }, animatedStyle]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: spacing(8),
  },
  header: {
    marginBottom: 24,
    gap: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: scaleFontSize(15),
    fontFamily: "medium",
    color: "black",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeIcon: {
    fontFamily: "regular",
    fontSize: scaleFontSize(10),
    color: "#EF4444",
  },
  changeText: {
    fontFamily: "regular",
    fontSize: scaleFontSize(10),
    color: Colors.black50,
  },
  positive: {
    color: Colors.primary,
  },
  legend: {
    flexDirection: "row",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  lastYearColor: {
    backgroundColor: "rgba(24, 144, 139, 0.5)",
  },
  runningYearColor: {
    backgroundColor: "rgba(22, 152, 141, 1)",
  },
  legendText: {
    fontFamily: "regular",
    fontSize: scaleFontSize(12),
    color: "black",
  },
  timeRangeButtons: {
    flexDirection: "row",
    gap: 6,
  },
  rangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
  },
  rangeButtonActive: {
    backgroundColor: "#4B5563",
  },
  rangeButtonText: {
    fontFamily: "regular",
    fontSize: scaleFontSize(10),
    color: Colors.text.black,
  },
  rangeButtonTextActive: {
    color: "#FFFFFF",
  },
  chartContainer: {
    flexDirection: "row",
    width: "100%",
  },
  yAxis: {
    width: 50,
    justifyContent: "space-between",
    height: 200,
    paddingRight: 8,
  },
  yAxisLabel: {
    fontFamily: "medium",
    fontSize: scaleFontSize(10),
    color: Colors.black50,
    textAlign: "right",
  },
  chartContent: {
    flex: 1,
  },
  gridLines: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 200,
    justifyContent: "space-between",
  },
  gridLine: {
    height: 1,
    backgroundColor: "#E5E7EB",
    opacity: 0.5,
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    paddingHorizontal: 2,
  },
  barGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    flex: 1,
    justifyContent: "center",
  },
  bar: {
    width: 8,
    borderRadius: 3,
    minHeight: 2,
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 2,
  },
  xAxisLabel: {
    fontFamily: "medium",
    fontSize: scaleFontSize(10),
    color: Colors.black50,
    flex: 1,
    textAlign: "center",
  },
});

export default OverallSalesChart;
