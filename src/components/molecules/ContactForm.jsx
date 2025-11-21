import React, { useState } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const ContactForm = ({ contact, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    company: contact?.company || "",
    notes: contact?.notes || ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary-700">
            Name *
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter contact name"
          />
          {errors.name && (
            <p className="text-sm text-error-600">{errors.name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary-700">
            Email *
          </label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-sm text-error-600">{errors.email}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary-700">
            Phone
          </label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary-700">
            Company *
          </label>
          <Input
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Enter company name"
          />
          {errors.company && (
            <p className="text-sm text-error-600">{errors.company}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-secondary-700">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Add any relevant notes about this contact"
          className="flex w-full rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
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
          {isSubmitting ? "Saving..." : (contact ? "Update Contact" : "Create Contact")}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;