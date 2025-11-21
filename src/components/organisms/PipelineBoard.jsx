import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { Card, CardContent } from "@/components/atoms/Card";
import { cn } from "@/utils/cn";

const PipelineBoard = ({ deals, contacts, onMoveCard, onEditDeal }) => {
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const stages = [
    { 
      id: "lead", 
      title: "Lead", 
      color: "border-blue-400",
      bgColor: "bg-blue-50",
      count: 0,
      value: 0
    },
    { 
      id: "qualified", 
      title: "Qualified", 
      color: "border-purple-400",
      bgColor: "bg-purple-50", 
      count: 0,
      value: 0
    },
    { 
      id: "proposal", 
      title: "Proposal", 
      color: "border-orange-400",
      bgColor: "bg-orange-50",
      count: 0,
      value: 0
    },
    { 
      id: "closed-won", 
      title: "Closed Won", 
      color: "border-green-400",
      bgColor: "bg-green-50",
      count: 0,
      value: 0
    }
  ];

  // Calculate stage statistics
  const stageStats = stages.map(stage => {
    const stageDeals = deals.filter(deal => deal.stage === stage.id);
    return {
      ...stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + deal.value, 0)
    };
  });

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact?.name || "Unknown Contact";
  };

  const getDaysInStage = (movedToStageAt) => {
    return differenceInDays(new Date(), new Date(movedToStageAt));
  };

  const handleDragStart = (e, deal) => {
    setDraggedCard(deal);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(stageId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedCard && draggedCard.stage !== stageId) {
      onMoveCard(draggedCard.Id, stageId);
    }
    setDraggedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {stageStats.map((stage) => {
          const stageDeals = deals.filter(deal => deal.stage === stage.id);
          
          return (
            <div
              key={stage.id}
              className={cn(
                "bg-white rounded-lg border-2 transition-colors duration-200",
                dragOverColumn === stage.id ? stage.bgColor + " " + stage.color : "border-secondary-200"
              )}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-secondary-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-secondary-900">{stage.title}</h3>
                  <Badge variant="secondary">{stage.count}</Badge>
                </div>
                <p className="text-sm text-secondary-600">
                  ${stage.value.toLocaleString()}
                </p>
              </div>

              {/* Deal Cards */}
              <div className="p-4 space-y-3 min-h-[400px] custom-scrollbar overflow-y-auto">
                <AnimatePresence>
                  {stageDeals.map((deal) => {
                    const daysInStage = getDaysInStage(deal.movedToStageAt);
                    const isStagnant = daysInStage > 30;
                    
                    return (
                      <motion.div
                        key={deal.Id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "cursor-move transition-all duration-200 hover:shadow-lg",
                            draggedCard?.Id === deal.Id && "opacity-50 rotate-2",
                            `border-l-4 ${stage.color.replace("border-", "border-l-")}`
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Deal Title */}
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium text-secondary-900 text-sm leading-tight">
                                  {deal.title}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditDeal(deal)}
                                  className="opacity-0 group-hover:opacity-100 p-1 h-auto"
                                >
                                  <ApperIcon name="Edit2" size={12} />
                                </Button>
                              </div>

                              {/* Contact Name */}
                              <div className="flex items-center space-x-2">
                                <ApperIcon name="User" size={14} className="text-secondary-400" />
                                <span className="text-sm text-secondary-600">
                                  {getContactName(deal.contactId)}
                                </span>
                              </div>

                              {/* Deal Value */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <ApperIcon name="DollarSign" size={14} className="text-accent-600" />
                                  <span className="font-semibold text-secondary-900">
                                    ${deal.value.toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Days in Stage */}
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-1">
                                  <ApperIcon name="Clock" size={12} className="text-secondary-400" />
                                  <span 
                                    className={cn(
                                      "text-secondary-600",
                                      isStagnant && "text-warning-600 font-medium"
                                    )}
                                  >
                                    {daysInStage} day{daysInStage !== 1 ? "s" : ""} in stage
                                  </span>
                                </div>
                                {isStagnant && (
                                  <Badge variant="warning" className="text-xs">
                                    Stagnant
                                  </Badge>
                                )}
                              </div>

                              {/* Expected Close Date */}
                              <div className="flex items-center space-x-2 text-xs text-secondary-500">
                                <ApperIcon name="Calendar" size={12} />
                                <span>
                                  Expected: {formatDistanceToNow(new Date(deal.expectedCloseDate), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {stageDeals.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mb-3">
                      <ApperIcon name="Inbox" size={24} className="text-secondary-400" />
                    </div>
                    <p className="text-sm text-secondary-500">
                      No {stage.title.toLowerCase()} deals
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineBoard;