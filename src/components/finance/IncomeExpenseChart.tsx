import { Expense, Income } from "@/src/types/finance";
import { scaleFontSize, spacing } from "@/src/utils/random";
import { ChevronDown } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

type TimeFilter = "7days" | "30days" | "90days" | "1year";

interface IncomeExpenseChartProps {
  incomes: Income[];
  expenses: Expense[];
}

const FILTER_OPTIONS = [
  { label: "Last 7 Days", value: "7days" as TimeFilter },
  { label: "Last 30 Days", value: "30days" as TimeFilter },
  { label: "Last 90 Days", value: "90days" as TimeFilter },
  { label: "Last Year", value: "1year" as TimeFilter },
];

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  incomes,
  expenses,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>("7days");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const chartWidth = screenWidth - 32; // padding
  const chartHeight = 280;
  const paddingLeft = 35;
  const paddingRight = 35;
  const paddingTop = 20;
  const paddingBottom = 20;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    const aggregatedData: { label: string; income: number; expense: number }[] =
      [];

    const getDateKey = (d: Date) => d.toISOString().split("T")[0];

    if (selectedFilter === "7days") {
      // Last 7 days → daily points
      startDate = new Date();
      startDate.setDate(now.getDate() - 6);

      const dailyData: Record<string, { income: number; expense: number }> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        dailyData[getDateKey(d)] = { income: 0, expense: 0 };
      }

      incomes.forEach((inc) => {
        const key = getDateKey(new Date(inc.date));
        if (dailyData[key]) dailyData[key].income += inc.amount;
      });

      expenses.forEach((exp) => {
        const key = getDateKey(new Date(exp.date));
        if (dailyData[key]) dailyData[key].expense += exp.amount;
      });

      Object.keys(dailyData)
        .sort()
        .forEach((date) => {
          const d = new Date(date);
          aggregatedData.push({
            label: d.toLocaleDateString("en-US", { weekday: "short" }),
            income: dailyData[date].income,
            expense: dailyData[date].expense,
          });
        });
    } else if (selectedFilter === "30days") {
      // Last 30 days → weekly points (7-day chunks)
      startDate = new Date();
      startDate.setDate(now.getDate() - 29);

      const dailyData: Record<string, { income: number; expense: number }> = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        dailyData[getDateKey(d)] = { income: 0, expense: 0 };
      }

      incomes.forEach((inc) => {
        const key = getDateKey(new Date(inc.date));
        if (dailyData[key]) dailyData[key].income += inc.amount;
      });

      expenses.forEach((exp) => {
        const key = getDateKey(new Date(exp.date));
        if (dailyData[key]) dailyData[key].expense += exp.amount;
      });

      const sortedDates = Object.keys(dailyData).sort();
      const weekSize = 7;
      for (let i = 0; i < sortedDates.length; i += weekSize) {
        const weekDates = sortedDates.slice(i, i + weekSize);
        const weekIncome = weekDates.reduce(
          (sum, d) => sum + dailyData[d].income,
          0,
        );
        const weekExpense = weekDates.reduce(
          (sum, d) => sum + dailyData[d].expense,
          0,
        );
        aggregatedData.push({
          label: `W${Math.floor(i / weekSize) + 1}`,
          income: weekIncome,
          expense: weekExpense,
        });
      }
    } else if (selectedFilter === "90days") {
      // Last 90 days → 30-day chunks (3 points)
      startDate = new Date();
      startDate.setDate(now.getDate() - 89);

      const dailyData: Record<string, { income: number; expense: number }> = {};
      for (let i = 0; i < 90; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        dailyData[getDateKey(d)] = { income: 0, expense: 0 };
      }

      incomes.forEach((inc) => {
        const key = getDateKey(new Date(inc.date));
        if (dailyData[key]) dailyData[key].income += inc.amount;
      });

      expenses.forEach((exp) => {
        const key = getDateKey(new Date(exp.date));
        if (dailyData[key]) dailyData[key].expense += exp.amount;
      });

      const sortedDates = Object.keys(dailyData).sort();
      const chunkSize = 30;
      for (let i = 0; i < sortedDates.length; i += chunkSize) {
        const chunkDates = sortedDates.slice(i, i + chunkSize);
        const chunkIncome = chunkDates.reduce(
          (sum, d) => sum + dailyData[d].income,
          0,
        );
        const chunkExpense = chunkDates.reduce(
          (sum, d) => sum + dailyData[d].expense,
          0,
        );
        const labelDate = new Date(chunkDates[0]);
        aggregatedData.push({
          label: labelDate.toLocaleDateString("en-US", { month: "short" }),
          income: chunkIncome,
          expense: chunkExpense,
        });
      }
    } else if (selectedFilter === "1year") {
      // Last year → monthly points (12 points)
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 11);

      const dailyData: Record<string, { income: number; expense: number }> = {};
      for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        dailyData[getDateKey(new Date(d))] = { income: 0, expense: 0 };
      }

      incomes.forEach((inc) => {
        const key = getDateKey(new Date(inc.date));
        if (dailyData[key]) dailyData[key].income += inc.amount;
      });

      expenses.forEach((exp) => {
        const key = getDateKey(new Date(exp.date));
        if (dailyData[key]) dailyData[key].expense += exp.amount;
      });

      const monthGroups: Record<string, { income: number; expense: number }> =
        {};
      Object.keys(dailyData).forEach((date) => {
        const monthKey = date.substring(0, 7);
        if (!monthGroups[monthKey])
          monthGroups[monthKey] = { income: 0, expense: 0 };
        monthGroups[monthKey].income += dailyData[date].income;
        monthGroups[monthKey].expense += dailyData[date].expense;
      });

      Object.keys(monthGroups)
        .sort()
        .forEach((monthKey) => {
          const dateObj = new Date(monthKey + "-01");
          aggregatedData.push({
            label: dateObj.toLocaleDateString("en-US", { month: "short" }),
            income: monthGroups[monthKey].income,
            expense: monthGroups[monthKey].expense,
          });
        });
    }

    return aggregatedData;
  }, [incomes, expenses, selectedFilter]);

  const {
    yAxisMax,
    yAxisLabels,
    incomePath,
    expensePath,
    incomeArea,
    expenseArea,
    incomePoints,
    expensePoints,
  } = useMemo(() => {
    const incomeValues = chartData.map((d) => d.income);
    const expenseValues = chartData.map((d) => d.expense);

    const maxIncome = Math.max(...incomeValues, 0);
    const maxExpense = Math.max(...expenseValues, 0);
    const actualMax = Math.max(maxIncome, maxExpense);

    const MIN_CHART_MAX = 40000;
    const STEP = 10000;
    const yAxisMax = Math.max(
      Math.ceil(actualMax / STEP) * STEP,
      MIN_CHART_MAX,
    );

    const segments = 4;
    const yAxisLabels = [];

    for (let i = 0; i <= segments; i++) {
      const value = (yAxisMax / segments) * i;

      const label = value === 0 ? "0" : `${Math.round(value / 1000)}k`;

      const yPos = plotHeight + paddingTop - i * (plotHeight / segments);

      yAxisLabels.push({
        value,
        label,
        y: yPos,
      });
    }

    const getY = (value: number) => {
      const ratio = value / yAxisMax;
      return paddingTop + plotHeight - ratio * plotHeight;
    };

    const getX = (index: number) => {
      if (chartData.length === 1) return paddingLeft + plotWidth / 2; // single point in chart
      const spacing = plotWidth / (chartData.length - 1); // uniform spacing for all points
      return paddingLeft + index * spacing;
    };

    let incomePath = "";
    let incomeArea = "";
    const incomePoints: { x: number; y: number }[] = [];

    chartData.forEach((data, index) => {
      const x = getX(index);
      const y = getY(data.income);
      incomePoints.push({ x, y });

      if (index === 0) {
        incomePath += `M ${x} ${y}`;
        incomeArea += `M ${x} ${plotHeight + paddingTop} L ${x} ${y}`;
      } else {
        incomePath += ` L ${x} ${y}`;
        incomeArea += ` L ${x} ${y}`;
      }
    });
    incomeArea += ` L ${getX(chartData.length - 1)} ${
      plotHeight + paddingTop
    } Z`;

    let expensePath = "";
    let expenseArea = "";
    const expensePoints: { x: number; y: number }[] = [];

    chartData.forEach((data, index) => {
      const x = getX(index);
      const y = getY(data.expense);
      expensePoints.push({ x, y });

      if (index === 0) {
        expensePath += `M ${x} ${y}`;
        expenseArea += `M ${x} ${plotHeight + paddingTop} L ${x} ${y}`;
      } else {
        expensePath += ` L ${x} ${y}`;
        expenseArea += ` L ${x} ${y}`;
      }
    });
    expenseArea += ` L ${getX(chartData.length - 1)} ${
      plotHeight + paddingTop
    } Z`;

    return {
      yAxisMax,
      yAxisLabels,
      incomePath,
      expensePath,
      incomeArea,
      expenseArea,
      incomePoints,
      expensePoints,
    };
  }, [chartData, plotWidth, plotHeight, paddingLeft, paddingTop]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Income vs Expenses</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterDropdown(!showFilterDropdown)}
        >
          <Text style={styles.filterText}>
            {FILTER_OPTIONS.find((f) => f.value === selectedFilter)?.label}
          </Text>
          <ChevronDown size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {showFilterDropdown && (
        <View style={styles.dropdown}>
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedFilter(option.value);
                setShowFilterDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  selectedFilter === option.value &&
                    styles.selectedDropdownText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          {[...yAxisLabels].reverse().map((label, index) => (
            <Text key={index} style={styles.yAxisLabel}>
              {label.label}
            </Text>
          ))}
        </View>

        {/* Chart */}
        <View style={{ flex: 1 }}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              {/* Income gradient */}
              <LinearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="70%" stopColor="white" />
                <Stop offset="0%" stopColor="rgba(86, 202, 0, 0.1)" />
              </LinearGradient>

              {/* Expense gradient */}
              <LinearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="70%" stopColor="white" />
                <Stop offset="0%" stopColor="rgba(22, 177, 255, 0.7)" />
              </LinearGradient>
            </Defs>

            {/* Horizontal grid lines */}
            {yAxisLabels.map((label, index) => (
              <Line
                key={index}
                x1={paddingLeft}
                y1={label.y}
                x2={chartWidth - paddingRight}
                y2={label.y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}

            {/* Income area */}
            <Path d={incomeArea} fill="url(#incomeGradient)" />

            {/* Expense area */}
            <Path d={expenseArea} fill="url(#expenseGradient)" />

            {/* Income line */}
            <Path
              d={incomePath}
              stroke="rgba(0, 166, 62, 0.7)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Expense line */}
            <Path
              d={expensePath}
              stroke="rgba(231, 0, 11, 0.7)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Income dots */}
            {incomePoints.map((point, index) => (
              <Circle
                key={`income-${index}`}
                cx={point.x}
                cy={point.y}
                r="5"
                fill="white"
                stroke="rgba(0, 166, 62, 1)"
                strokeWidth="3"
              />
            ))}

            {/* Expense dots */}
            {expensePoints.map((point, index) => (
              <Circle
                key={`expense-${index}`}
                cx={point.x}
                cy={point.y}
                r="5"
                fill="white"
                stroke="rgba(231, 0, 11, 0.5)"
                strokeWidth="3"
              />
            ))}
          </Svg>

          {/* X-axis labels */}
          {/* <View style={styles.xAxisLabels}>
            {chartData.map((data, index) => (
              <Text key={index} style={styles.xAxisLabel}>
                {data.label}
              </Text>
            ))}
          </View> */}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#22c55e" }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
          <Text style={styles.legendText}>Expenses</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing(16),
  },
  title: {
    fontSize: scaleFontSize(16),
    fontFamily: "semibold",
    color: "#000",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(4),
    paddingHorizontal: spacing(12),
    paddingVertical: spacing(6),
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  filterText: {
    fontSize: scaleFontSize(14),
    fontFamily: "regular",
    color: "#666",
  },
  dropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    minWidth: 150,
  },
  dropdownItem: {
    paddingHorizontal: spacing(16),
    paddingVertical: spacing(12),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "medium",
    color: "#666",
  },
  selectedDropdownText: {
    color: "#22c55e",
  },
  chartContainer: {
    flexDirection: "row",
    marginVertical: spacing(8),
  },
  yAxisLabels: {
    // width: 40,
    justifyContent: "space-between",
    paddingTop: spacing(20),
    paddingBottom: spacing(55),
  },
  yAxisLabel: {
    fontSize: scaleFontSize(12),
    color: "#999",
    textAlign: "right",
  },
  xAxisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: spacing(20),
    paddingTop: spacing(8),
  },
  xAxisLabel: {
    fontSize: scaleFontSize(12),
    fontFamily: "medium",
    color: "#999",
  },
  legend: {
    flexDirection: "row",
    // justifyContent: "center",
    alignItems: "center",
    gap: spacing(24),
    paddingHorizontal: spacing(20),
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(8),
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: scaleFontSize(14),
    fontFamily: "medium",
    color: "#666",
  },
});

export default IncomeExpenseChart;
