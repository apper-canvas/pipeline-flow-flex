import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import DealForm from "@/components/molecules/DealForm";
import PipelineBoard from "@/components/organisms/PipelineBoard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { dealsService } from "@/services/api/dealsService";
import { contactsService } from "@/services/api/contactsService";
import { toast } from "react-toastify";

const Pipeline = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDealModal, setShowDealModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [dealsData, contactsData] = await Promise.all([
        dealsService.getAll(),
        contactsService.getAll()
      ]);
      
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load pipeline data. Please try again.");
      console.error("Pipeline data loading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDeal = () => {
    setSelectedDeal(null);
    setShowDealModal(true);
  };

  const handleEditDeal = (deal) => {
    setSelectedDeal(deal);
    setShowDealModal(true);
  };

  const handleSubmitDeal = async (dealData) => {
    setIsSubmitting(true);
    try {
      if (selectedDeal) {
        const updatedDeal = await dealsService.update(selectedDeal.Id, dealData);
        setDeals(prev => prev.map(d => d.Id === selectedDeal.Id ? updatedDeal : d));
        toast.success("Deal updated successfully!");
      } else {
        const newDeal = await dealsService.create(dealData);
        setDeals(prev => [...prev, newDeal]);
        toast.success("Deal created successfully!");
      }
      setShowDealModal(false);
    } catch (error) {
      toast.error(selectedDeal ? "Failed to update deal" : "Failed to create deal");
      console.error("Deal operation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveCard = async (dealId, newStage) => {
    try {
      const updatedDeal = await dealsService.update(dealId, { stage: newStage });
      setDeals(prev => prev.map(d => d.Id === dealId ? updatedDeal : d));
      
      const stageLabels = {
        "lead": "Lead",
        "qualified": "Qualified",
        "proposal": "Proposal", 
        "closed-won": "Closed Won",
        "closed-lost": "Closed Lost"
      };
      
      toast.success(`Deal moved to ${stageLabels[newStage]}`);
    } catch (error) {
      toast.error("Failed to move deal");
      console.error("Deal move failed:", error);
    }
  };

  if (loading) {
    return <Loading type="pipeline" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  if (deals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Sales Pipeline</h1>
            <p className="text-secondary-600">
              Track your deals through each stage of the sales process
            </p>
          </div>
          <Button onClick={handleCreateDeal} variant="primary">
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Deal
          </Button>
        </div>

        <Empty
          title="No deals in your pipeline"
          description="Start tracking your sales opportunities by creating your first deal."
          icon="GitBranch"
          actionLabel="Create Your First Deal"
          onAction={handleCreateDeal}
        />
      </div>
    );
  }

  const activeDeals = deals.filter(deal => !["closed-won", "closed-lost"].includes(deal.stage));
  const totalPipelineValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Sales Pipeline</h1>
          <p className="text-secondary-600">
            {activeDeals.length} active deals worth ${totalPipelineValue.toLocaleString()}
          </p>
        </div>
        <Button onClick={handleCreateDeal} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Board */}
      <div className="min-h-[600px]">
        <PipelineBoard
          deals={deals}
          contacts={contacts}
          onMoveCard={handleMoveCard}
          onEditDeal={handleEditDeal}
        />
      </div>

      {/* Deal Form Modal */}
      <Modal
        isOpen={showDealModal}
        onClose={() => setShowDealModal(false)}
        title={selectedDeal ? "Edit Deal" : "Add New Deal"}
        size="lg"
      >
        <DealForm
          deal={selectedDeal}
          onSubmit={handleSubmitDeal}
          onCancel={() => setShowDealModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Pipeline;