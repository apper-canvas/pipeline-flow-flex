import React, { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { contactsService } from "@/services/api/contactsService";
import { activitiesService } from "@/services/api/activitiesService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Modal from "@/components/atoms/Modal";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ActivityForm from "@/components/molecules/ActivityForm";

const DealDetails = ({ deal, onEdit, onClose }) => {
  const [contact, setContact] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contactData, activitiesData] = await Promise.all([
        deal.contactId ? contactsService.getById(deal.contactId) : Promise.resolve(null),
        activitiesService.getByDealId(deal.Id)
      ]);
      
      setContact(contactData);
      setActivities(activitiesData || []);
    } catch (error) {
      console.error('Failed to load deal details:', error);
      toast.error('Failed to load deal details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deal.Id) {
      loadData();
    }
  }, [deal.Id]);

  const handleAddActivity = async (activityData) => {
    setIsSubmitting(true);
    try {
      const newActivity = await activitiesService.create({
        ...activityData,
        dealId: deal.Id,
        contactId: deal.contactId
      });
      
      setActivities(prev => [newActivity, ...prev]);
      setShowActivityModal(false);
      toast.success('Activity added successfully!');
    } catch (error) {
      console.error('Failed to add activity:', error);
      toast.error('Failed to add activity');
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
      "call": "Phone",
      "email": "Mail",
      "meeting": "Calendar",
      "note": "FileText",
      "task": "CheckSquare"
    };
    return icons[type] || "Activity";
  };

  const getStageProgress = (stage) => {
    const stages = ["lead", "qualified", "proposal", "closed-won", "closed-lost"];
    const currentIndex = stages.indexOf(stage);
    if (currentIndex === -1) return 0;
    if (stage === "closed-won") return 100;
    if (stage === "closed-lost") return 0;
    return ((currentIndex + 1) / 3) * 100; // Progress through active stages only
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Deal Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-secondary-900">{deal.title}</h2>
            <Badge variant={getStageVariant(deal.stage)}>
              {deal.stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-secondary-600">
            <div className="flex items-center space-x-1">
              <ApperIcon name="DollarSign" size={16} />
              <span className="font-semibold text-lg">${deal.value?.toLocaleString() || '0'}</span>
            </div>
            {deal.expectedCloseDate && (
              <div className="flex items-center space-x-1">
                <ApperIcon name="Calendar" size={16} />
                <span>Expected close: {format(new Date(deal.expectedCloseDate), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => onEdit(deal)}>
          <ApperIcon name="Edit2" size={16} className="mr-2" />
          Edit Deal
        </Button>
      </div>

      {/* Stage Progress */}
      <div className="bg-secondary-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-secondary-900">Deal Progress</h3>
          <span className="text-sm text-secondary-600">
            {Math.round(getStageProgress(deal.stage))}% Complete
          </span>
        </div>
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getStageProgress(deal.stage)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
            <ApperIcon name="FileText" size={20} className="mr-2" />
            Deal Information
          </h3>
          
          <div className="bg-white rounded-lg border border-secondary-200 p-4 space-y-3">
            {deal.description && (
              <div>
                <label className="text-sm font-medium text-secondary-700">Description</label>
                <p className="text-secondary-900 mt-1">{deal.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-700">Value</label>
                <p className="text-secondary-900 font-semibold">${deal.value?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700">Stage</label>
                <p className="text-secondary-900 capitalize">{deal.stage?.replace('-', ' ')}</p>
              </div>
            </div>
            
            {deal.source && (
              <div>
                <label className="text-sm font-medium text-secondary-700">Source</label>
                <p className="text-secondary-900">{deal.source}</p>
              </div>
            )}
            
<div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-700">Created</label>
                <p className="text-secondary-600 text-sm">
                  {formatDistanceToNow(new Date(deal.createdAt || Date.now()), { addSuffix: true })}
                </p>
              </div>
              {deal.expectedCloseDate && (
                <div>
                  <label className="text-sm font-medium text-secondary-700">Expected Close</label>
                  <p className="text-secondary-600 text-sm">
                    {format(new Date(deal.expectedCloseDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
            
            {/* System Fields */}
            <div className="pt-4 border-t border-secondary-200">
              <h4 className="text-sm font-medium text-secondary-700 mb-3">Audit Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {deal.CreatedOn && (
                  <div>
                    <span className="text-secondary-500">Created On:</span>
                    <span className="ml-2 text-secondary-700">
                      {new Date(deal.CreatedOn).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {deal.CreatedBy?.Name && (
                  <div>
                    <span className="text-secondary-500">Created By:</span>
                    <span className="ml-2 text-secondary-700">{deal.CreatedBy.Name}</span>
                  </div>
                )}
                {deal.ModifiedOn && (
                  <div>
                    <span className="text-secondary-500">Modified On:</span>
                    <span className="ml-2 text-secondary-700">
                      {new Date(deal.ModifiedOn).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {deal.ModifiedBy?.Name && (
                  <div>
                    <span className="text-secondary-500">Modified By:</span>
                    <span className="ml-2 text-secondary-700">{deal.ModifiedBy.Name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
            <ApperIcon name="User" size={20} className="mr-2" />
            Contact Information
          </h3>
          
          {contact ? (
            <div className="bg-white rounded-lg border border-secondary-200 p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-900">{contact.name}</h4>
                  <p className="text-secondary-600">{contact.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {contact.company && (
                  <div>
                    <label className="text-sm font-medium text-secondary-700">Company</label>
                    <p className="text-secondary-900">{contact.company}</p>
                  </div>
                )}
                
                {contact.phone && (
                  <div>
                    <label className="text-sm font-medium text-secondary-700">Phone</label>
                    <p className="text-secondary-900">{contact.phone}</p>
                  </div>
                )}
                
                {contact.title && (
                  <div>
                    <label className="text-sm font-medium text-secondary-700">Title</label>
                    <p className="text-secondary-900">{contact.title}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-secondary-200 p-4 text-center text-secondary-500">
              No contact associated with this deal
            </div>
          )}
        </div>
      </div>

      {/* Activities Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
            <ApperIcon name="Activity" size={20} className="mr-2" />
            Recent Activities
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowActivityModal(true)}
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Activity
          </Button>
        </div>

        {activities.length > 0 ? (
          <div className="bg-white rounded-lg border border-secondary-200">
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {activities.map((activity, index) => (
                <div 
                  key={activity.Id} 
                  className={`p-4 flex items-start space-x-3 ${
                    index !== activities.length - 1 ? 'border-b border-secondary-200' : ''
                  }`}
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ApperIcon 
                      name={getActivityIcon(activity.type)} 
                      size={16} 
                      className="text-primary-600" 
                    />
                  </div>
<div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-secondary-900">{activity.description || activity.Name}</h4>
                      <span className="text-xs text-secondary-500">
                        {formatDistanceToNow(new Date(activity.timestamp || activity.CreatedOn), {
                          addSuffix: true 
                        })}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-secondary-600 text-sm mt-1">{activity.description}</p>
                    )}
                    <div className="flex items-center mt-2 space-x-4 text-xs text-secondary-500">
                      <span className="capitalize">{activity.type}</span>
                      {activity.duration && <span>{activity.duration} min</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-secondary-200 p-8 text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ApperIcon name="Activity" size={32} className="text-secondary-400" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">No activities yet</h3>
            <p className="text-secondary-600 mb-4">Track interactions and progress with this deal.</p>
            <Button 
              variant="primary" 
              onClick={() => setShowActivityModal(true)}
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add First Activity
            </Button>
          </div>
        )}
      </div>

      {/* Activity Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Add Activity"
        size="lg"
      >
        <ActivityForm
          onSubmit={handleAddActivity}
          onCancel={() => setShowActivityModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default DealDetails;