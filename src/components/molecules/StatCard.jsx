import React from "react";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral",
  icon,
  iconColor = "text-secondary-500",
  className 
}) => {
  const changeColors = {
    positive: "text-accent-600",
    negative: "text-error-600",
    neutral: "text-secondary-500"
  };

  return (
    <Card className={cn("hover:scale-[1.02] transition-all duration-150", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-secondary-600">{title}</p>
        {icon && (
          <div className={cn("p-1", iconColor)}>
            <ApperIcon name={icon} size={20} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-secondary-900 mb-1">
          {value}
        </div>
        {change && (
          <p className={cn("text-xs flex items-center", changeColors[changeType])}>
            {changeType === "positive" && <ApperIcon name="TrendingUp" size={12} className="mr-1" />}
            {changeType === "negative" && <ApperIcon name="TrendingDown" size={12} className="mr-1" />}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;