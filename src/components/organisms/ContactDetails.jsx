import React, { useState, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/atoms/Modal";
import ActivityForm from "@/components/molecules/ActivityForm";
import { dealsService } from "@/services/api/dealsService";
import { activitiesService } from "@/services/api/activitiesService";
import Loading from "@/components/ui/Loading";
import { toast } from "react-toastify";

const ContactDetails = ({ contact, onEdit, onClose }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dealsData, activitiesData] = await Promise.all([
          dealsService.getByContactId(contact.Id),
          activitiesService.getByContactId(contact.Id)
        ]);
        setDeals(dealsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Failed to load contact details:", error);
        toast.error("Failed to load contact details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [contact.Id]);

  const handleAddActivity = async (activityData) => {
    setIsSubmitting(true);
    try {
      const newActivity = await activitiesService.create(activityData);
      setActivities(prev => [newActivity, ...prev]);
      setShowActivityModal(false);
      toast.success("Activity added successfully!");
    } catch (error) {
      console.error("Failed to add activity:", error);
      toast.error("Failed to add activity");
    } finally {
      setIsSubmitting(false);
    }
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

  const getActivityIcon = (type) => {
    const icons = {
      call: "Phone",
      email: "Mail", 
      meeting: "Calendar",
      note: "FileText"
    };
    return icons[type] || "FileText";
  };

  const tabs = [
    { id: "info", label: "Contact Info", icon: "User" },
    { id: "deals", label: "Deals", icon: "DollarSign" },
    { id: "activities", label: "Activities", icon: "Clock" }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <Loading type="dashboard" />
      </div>
    );
  }

  return (
    <div className="min-h-[500px]">
      {/* Header */}
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">{contact.name}</h2>
              <p className="text-secondary-600">{contact.company}</p>
              <p className="text-sm text-secondary-500">
                Added {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowActivityModal(true)}
              variant="primary"
              size="sm"
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add Activity
            </Button>
            <Button
              onClick={() => onEdit(contact)}
              variant="outline"
              size="sm"
            >
              <ApperIcon name="Edit2" size={16} className="mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="flex px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-secondary-600 hover:text-secondary-900 hover:border-secondary-300"
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
              {tab.id === "deals" && deals.length > 0 && (
                <Badge variant="secondary" className="ml-1">{deals.length}</Badge>
              )}
              {tab.id === "activities" && activities.length > 0 && (
                <Badge variant="secondary" className="ml-1">{activities.length}</Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Email</label>
                    <p className="text-secondary-900">{contact.email}</p>
                  </div>
                  {contact.phone && (
                    <div>
                      <label className="text-sm font-medium text-secondary-600">Phone</label>
                      <p className="text-secondary-900">{contact.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Company</label>
                    <p className="text-secondary-900">{contact.company}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Summary</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Total Deals</label>
                    <p className="text-secondary-900">{deals.length}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Total Deal Value</label>
                    <p className="text-secondary-900">
                      ${deals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Last Contacted</label>
                    <p className="text-secondary-900">
                      {formatDistanceToNow(new Date(contact.lastContactedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {contact.notes && (
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Notes</h3>
                <div className="bg-secondary-50 rounded-lg p-4">
                  <p className="text-secondary-700 whitespace-pre-wrap">{contact.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "deals" && (
          <div className="space-y-4">
            {deals.length > 0 ? (
              deals.map((deal) => (
                <div key={deal.Id} className="bg-secondary-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-secondary-900">{deal.title}</h4>
                    <Badge variant={getStageVariant(deal.stage)}>
                      {deal.stage.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-secondary-600">Value:</span>
                      <span className="ml-2 font-medium text-secondary-900">
                        ${deal.value.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary-600">Expected Close:</span>
                      <span className="ml-2 text-secondary-900">
                        {format(new Date(deal.expectedCloseDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary-600">In Stage:</span>
                      <span className="ml-2 text-secondary-900">
                        {formatDistanceToNow(new Date(deal.movedToStageAt))}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="DollarSign" size={32} className="text-secondary-400" />
                </div>
                <p className="text-secondary-600">No deals found for this contact</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "activities" && (
          <div className="space-y-4">
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.Id} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ApperIcon 
                        name={getActivityIcon(activity.type)} 
                        size={18} 
                        className="text-secondary-600" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="secondary" className="capitalize">
                          {activity.type}
                        </Badge>
                        <span className="text-sm text-secondary-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-secondary-900">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="Clock" size={32} className="text-secondary-400" />
                </div>
                <p className="text-secondary-600">No activities recorded for this contact</p>
                <Button
                  onClick={() => setShowActivityModal(true)}
                  variant="primary"
                  className="mt-4"
                >
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Add First Activity
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Add Activity"
        size="default"
      >
        <ActivityForm
          contactId={contact.Id}
          onSubmit={handleAddActivity}
          onCancel={() => setShowActivityModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default ContactDetails;