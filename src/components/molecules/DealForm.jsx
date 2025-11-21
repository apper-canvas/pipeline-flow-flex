import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { contactsService } from "@/services/api/contactsService";

const DealForm = ({ deal, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: deal?.title || "",
    contactId: deal?.contactId || "",
    value: deal?.value || "",
    stage: deal?.stage || "lead",
    expectedCloseDate: deal?.expectedCloseDate || ""
  });

  const [errors, setErrors] = useState({});
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const contactsData = await contactsService.getAll();
        setContacts(contactsData);
      } catch (error) {
        console.error("Failed to load contacts:", error);
      } finally {
        setLoadingContacts(false);
      }
    };
    
    loadContacts();
  }, []);

  const stages = [
    { value: "lead", label: "Lead" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal", label: "Proposal" },
    { value: "closed-won", label: "Closed Won" },
    { value: "closed-lost", label: "Closed Lost" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Deal title is required";
    }
    
    if (!formData.contactId) {
      newErrors.contactId = "Please select a contact";
    }
    
    if (!formData.value || formData.value <= 0) {
      newErrors.value = "Please enter a valid deal value";
    }
    
    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = "Expected close date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        contactId: parseInt(formData.contactId),
        value: parseFloat(formData.value)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-secondary-700">
          Deal Title *
        </label>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter deal title"
        />
        {errors.title && (
          <p className="text-sm text-error-600">{errors.title}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-secondary-700">
          Contact *
        </label>
        <select
          name="contactId"
          value={formData.contactId}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loadingContacts}
        >
          <option value="">
            {loadingContacts ? "Loading contacts..." : "Select a contact"}
          </option>
          {contacts.map(contact => (
            <option key={contact.Id} value={contact.Id}>
              {contact.name} - {contact.company}
            </option>
          ))}
        </select>
        {errors.contactId && (
          <p className="text-sm text-error-600">{errors.contactId}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary-700">
            Deal Value *
          </label>
          <Input
            name="value"
            type="number"
            min="0"
            step="0.01"
            value={formData.value}
            onChange={handleChange}
            placeholder="0.00"
          />
          {errors.value && (
            <p className="text-sm text-error-600">{errors.value}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary-700">
            Stage
          </label>
          <select
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
          >
            {stages.map(stage => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-secondary-700">
          Expected Close Date *
        </label>
        <Input
          name="expectedCloseDate"
          type="date"
          value={formData.expectedCloseDate}
          onChange={handleChange}
        />
        {errors.expectedCloseDate && (
          <p className="text-sm text-error-600">{errors.expectedCloseDate}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : (deal ? "Update Deal" : "Create Deal")}
        </Button>
      </div>
    </form>
  );
};

export default DealForm;