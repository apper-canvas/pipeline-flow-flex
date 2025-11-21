import React from "react";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";

const Loading = ({ type = "dashboard" }) => {
  if (type === "dashboard") {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-secondary-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-secondary-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-secondary-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Recent Activity Skeleton */}
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-secondary-200 rounded w-32"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-white rounded-lg border">
            <div className="w-10 h-10 bg-secondary-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
              <div className="h-3 bg-secondary-200 rounded w-1/3"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-secondary-200 rounded w-20"></div>
              <div className="h-3 bg-secondary-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "pipeline") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, colIndex) => (
          <div key={colIndex} className="space-y-4">
            <div className="animate-pulse h-6 bg-secondary-200 rounded w-24"></div>
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <Card key={cardIndex} className="animate-pulse">
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                  <div className="h-4 bg-secondary-200 rounded w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
  );
};

export default Loading;