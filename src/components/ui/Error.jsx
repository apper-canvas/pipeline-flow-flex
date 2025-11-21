import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ 
  message = "Something went wrong",
  onRetry,
  showRetry = true 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name="AlertCircle" size={32} className="text-error-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-secondary-900 mb-2">
        Oops! Something went wrong
      </h3>
      
      <p className="text-secondary-600 mb-6 max-w-md">
        {message}
      </p>
      
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="primary">
          <ApperIcon name="RotateCcw" size={16} className="mr-2" />
          Try again
        </Button>
      )}
    </div>
  );
};

export default Error;