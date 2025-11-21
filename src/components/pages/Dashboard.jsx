import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import StatCard from "@/components/molecules/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { contactsService } from "@/services/api/contactsService";
import { dealsService } from "@/services/api/dealsService";
import { activitiesService } from "@/services/api/activitiesService";

const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [contactsData, dealsData, activitiesData] = await Promise.all([
        contactsService.getAll(),
        dealsService.getAll(),
        activitiesService.getAll()
      ]);
      
      setContacts(contactsData);
      setDeals(dealsData);
      setActivities(activitiesData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Dashboard data loading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <Loading type="dashboard" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  if (contacts.length === 0 && deals.length === 0) {
    return (
      <Empty
        title="Welcome to PipelineFlow!"
        description="Start building your sales pipeline by adding contacts and deals."
        icon="Zap"
        actionLabel="Get Started"
        onAction={() => window.location.href = "/contacts"}
      />
    );
  }

  const activeDeals = deals.filter(deal => !["closed-won", "closed-lost"].includes(deal.stage));
  const totalPipelineValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = deals.filter(deal => deal.stage === "closed-won");
  const conversionRate = deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(1) : 0;
  
  const recentActivities = activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 8);

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact?.name || "Unknown Contact";
  };

  const getActivityIcon = (type) => {
    const icons = {
      call: "Phone",
      email: "Mail",
      meeting: "Calendar", 
      note: "FileText"
    };
    return icons[type] || "FileText";
  };

  const getStageVariant = (stage) => {
    const variants = {
      "lead": "lead",
      "qualified": "qualified",
      "proposal": "proposal", 
      "closed-won": "won",
      "closed-lost": "lost"
    };
    return variants[stage] || "default";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Dashboard</h1>
        <p className="text-secondary-600">
          Track your sales pipeline and monitor key performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contacts"
          value={contacts.length}
          icon="Users"
          iconColor="text-primary-600"
          change={`${contacts.filter(c => {
            const daysSinceCreated = Math.floor((new Date() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24));
            return daysSinceCreated <= 7;
          }).length} added this week`}
          changeType="neutral"
        />

        <StatCard
          title="Active Deals" 
          value={activeDeals.length}
          icon="GitBranch"
          iconColor="text-accent-600"
          change={`${Math.round((activeDeals.length / Math.max(deals.length, 1)) * 100)}% of total`}
          changeType="positive"
        />

        <StatCard
          title="Pipeline Value"
          value={`$${totalPipelineValue.toLocaleString()}`}
          icon="DollarSign"
          iconColor="text-accent-600"
          change={`Avg: $${Math.round(totalPipelineValue / Math.max(activeDeals.length, 1)).toLocaleString()}`}
          changeType="positive"
        />

        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon="TrendingUp"
          iconColor={parseFloat(conversionRate) >= 25 ? "text-accent-600" : "text-warning-600"}
          change={`${wonDeals.length} deals won`}
          changeType={parseFloat(conversionRate) >= 25 ? "positive" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ApperIcon name="Clock" size={20} className="mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.Id} className="flex items-start space-x-4 p-3 bg-secondary-50 rounded-lg">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-secondary-200">
                        <ApperIcon 
                          name={getActivityIcon(activity.type)} 
                          size={16} 
                          className="text-secondary-600" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-secondary-900">
                            {getContactName(activity.contactId)}
                          </span>
                          <Badge variant="secondary" className="capitalize text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                        <p className="text-secondary-700 text-sm mb-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ApperIcon name="Clock" size={32} className="text-secondary-400" />
                  </div>
                  <p className="text-secondary-600">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ApperIcon name="GitBranch" size={20} className="mr-2" />
                Pipeline Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { stage: "lead", label: "Lead", icon: "Target" },
                  { stage: "qualified", label: "Qualified", icon: "CheckCircle" },
                  { stage: "proposal", label: "Proposal", icon: "FileText" },
                  { stage: "closed-won", label: "Closed Won", icon: "Trophy" }
                ].map((item) => {
                  const stageDeals = deals.filter(deal => deal.stage === item.stage);
                  const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
                  
                  return (
                    <div key={item.stage} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <ApperIcon name={item.icon} size={16} className="text-secondary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{item.label}</p>
                          <p className="text-sm text-secondary-600">
                            {stageDeals.length} deal{stageDeals.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStageVariant(item.stage)}>
                          ${stageValue.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;