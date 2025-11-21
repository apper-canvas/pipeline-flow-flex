import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  title = "No data found",
  description = "Get started by adding your first item.",
  icon = "Inbox",
  actionLabel,
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name={icon} size={40} className="text-secondary-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-secondary-900 mb-2">
        {title}
      </h3>
      
      <p className="text-secondary-600 mb-8 max-w-md">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;