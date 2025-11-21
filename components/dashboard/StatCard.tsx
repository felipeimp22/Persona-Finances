import { Card } from "@/components/ui/Card";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  trend,
}: StatCardProps) {
  const variantStyles = {
    default: "bg-white border-gray-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    danger: "bg-red-50 border-red-200",
  };

  const textColorStyles = {
    default: "text-brand-navy",
    success: "text-green-700",
    warning: "text-yellow-700",
    danger: "text-red-700",
  };

  return (
    <Card className={`p-6 ${variantStyles[variant]} border`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${textColorStyles[variant]}`}>
            {typeof value === "number" ? `$${value.toFixed(2)}` : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 text-3xl opacity-50">{icon}</div>
        )}
      </div>
    </Card>
  );
}
