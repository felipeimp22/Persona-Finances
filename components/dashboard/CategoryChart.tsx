"use client";

import { Card } from "@/components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { CategorySpending } from "@/types/database";

interface CategoryChartProps {
  data: CategorySpending[];
}

const COLORS = [
  "#ea384c", // brand red
  "#221F26", // brand navy
  "#4A90E2", // blue
  "#F5A623", // orange
  "#7ED321", // green
  "#BD10E0", // purple
  "#50E3C2", // teal
  "#FF6B6B", // coral
];

const categoryIcons: Record<string, string> = {
  food: "🍔",
  transport: "🚗",
  entertainment: "🎬",
  shopping: "🛍️",
  bills: "💳",
  other: "📦",
};

export function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Spending by Category
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No expenses recorded yet</p>
        </div>
      </Card>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.amount,
    percentage: item.percentage,
    icon: categoryIcons[item.category] || "📦",
    color: COLORS[index % COLORS.length],
  }));

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null; // Don't show label for slices < 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900">
            {data.icon} {data.name}
          </p>
          <p className="text-sm text-gray-600">
            ${data.value.toFixed(2)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Spending by Category
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Category Legend */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.icon} {item.name}
              </p>
              <p className="text-xs text-gray-500">
                ${item.value.toFixed(2)} ({item.percentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
