import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { cn } from '@/utils/cn';

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare', 
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Other'
];

function CompanyForm({ company, onSubmit, onCancel }) {
const [formData, setFormData] = useState({
    Name: '',
    Tags: '',
    industry_c: '',
    address_c: '',
    phone_c: '',
    website_c: '',
    revenue_c: '',
    employees_c: '',
    description_c: '',
    CreatedOn: '',
    CreatedBy: null,
    ModifiedOn: '',
    ModifiedBy: null,
    Owner: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when company prop changes
  useEffect(() => {
    if (company) {
setFormData({
        Name: company.Name || '',
        Tags: company.Tags || '',
        industry_c: company.industry_c || '',
        address_c: company.address_c || '',
        phone_c: company.phone_c || '',
        website_c: company.website_c || '',
        revenue_c: company.revenue_c ? company.revenue_c.toString() : '',
        employees_c: company.employees_c ? company.employees_c.toString() : '',
        description_c: company.description_c || '',
        CreatedOn: company.CreatedOn || '',
        CreatedBy: company.CreatedBy || null,
        ModifiedOn: company.ModifiedOn || '',
        ModifiedBy: company.ModifiedBy || null,
        Owner: company.Owner || null
      });
    } else {
setFormData({
        Name: '',
        Tags: '',
        industry_c: '',
        address_c: '',
        phone_c: '',
        website_c: '',
        revenue_c: '',
        employees_c: '',
        description_c: '',
        CreatedOn: '',
        CreatedBy: null,
        ModifiedOn: '',
        ModifiedBy: null,
        Owner: null
      });
    }
  }, [company]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Name.trim()) {
      newErrors.Name = 'Company name is required';
    }

    if (formData.revenue_c && isNaN(parseFloat(formData.revenue_c))) {
      newErrors.revenue_c = 'Revenue must be a valid number';
    }

    if (formData.employees_c && isNaN(parseInt(formData.employees_c))) {
      newErrors.employees_c = 'Employees must be a valid number';
    }

    if (formData.website_c && formData.website_c.trim()) {
      const urlPattern = /^https?:\/\/|^www\./i;
      if (!urlPattern.test(formData.website_c)) {
        // Auto-prepend https:// if no protocol specified
        setFormData(prev => ({
          ...prev,
          website_c: `https://${formData.website_c}`
        }));
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name - Required */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Company Name *
        </label>
        <Input
          type="text"
          value={formData.Name}
          onChange={(e) => handleInputChange('Name', e.target.value)}
          placeholder="Enter company name"
          className={cn(
            errors.Name && "border-error-500 focus:border-error-500"
          )}
          required
        />
        {errors.Name && (
          <p className="mt-1 text-sm text-error-500">{errors.Name}</p>
        )}
      </div>

      {/* Industry - Picklist */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Industry
        </label>
        <select
          value={formData.industry_c}
          onChange={(e) => handleInputChange('industry_c', e.target.value)}
          className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select industry</option>
          {INDUSTRY_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Tags
        </label>
        <Input
          type="text"
          value={formData.Tags}
          onChange={(e) => handleInputChange('Tags', e.target.value)}
          placeholder="Enter tags (comma-separated)"
        />
        <p className="mt-1 text-xs text-secondary-500">
          Separate multiple tags with commas
        </p>
      </div>

      {/* Phone and Website Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Phone
          </label>
          <Input
            type="tel"
            value={formData.phone_c}
            onChange={(e) => handleInputChange('phone_c', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Website
          </label>
          <Input
            type="url"
            value={formData.website_c}
            onChange={(e) => handleInputChange('website_c', e.target.value)}
            placeholder="Enter website URL"
          />
        </div>
      </div>

      {/* Revenue and Employees Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Annual Revenue ($)
          </label>
          <Input
            type="number"
            value={formData.revenue_c}
            onChange={(e) => handleInputChange('revenue_c', e.target.value)}
            placeholder="Enter annual revenue"
            step="0.01"
            min="0"
            className={cn(
              errors.revenue_c && "border-error-500 focus:border-error-500"
            )}
          />
          {errors.revenue_c && (
            <p className="mt-1 text-sm text-error-500">{errors.revenue_c}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Number of Employees
          </label>
          <Input
            type="number"
            value={formData.employees_c}
            onChange={(e) => handleInputChange('employees_c', e.target.value)}
            placeholder="Enter number of employees"
            min="0"
            step="1"
            className={cn(
              errors.employees_c && "border-error-500 focus:border-error-500"
            )}
          />
          {errors.employees_c && (
            <p className="mt-1 text-sm text-error-500">{errors.employees_c}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Address
        </label>
        <textarea
          value={formData.address_c}
          onChange={(e) => handleInputChange('address_c', e.target.value)}
          placeholder="Enter company address"
          rows={3}
          className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description_c}
          onChange={(e) => handleInputChange('description_c', e.target.value)}
          placeholder="Enter company description"
          rows={4}
className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* System Fields - Show only when editing existing record */}
      {company && (
        <>
          <hr className="border-secondary-200" />
          
          {/* Owner */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Owner
            </label>
            <Input
              type="text"
              value={formData.Owner?.Name || 'N/A'}
              disabled
              className="bg-secondary-50 text-secondary-600"
            />
          </div>

          {/* Created and Modified Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Created On
              </label>
              <Input
                type="text"
                value={formData.CreatedOn ? new Date(formData.CreatedOn).toLocaleString() : 'N/A'}
                disabled
                className="bg-secondary-50 text-secondary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Created By
              </label>
              <Input
                type="text"
                value={formData.CreatedBy?.Name || 'N/A'}
                disabled
                className="bg-secondary-50 text-secondary-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Modified On
              </label>
              <Input
                type="text"
                value={formData.ModifiedOn ? new Date(formData.ModifiedOn).toLocaleString() : 'N/A'}
                disabled
                className="bg-secondary-50 text-secondary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Modified By
              </label>
              <Input
                type="text"
                value={formData.ModifiedBy?.Name || 'N/A'}
                disabled
                className="bg-secondary-50 text-secondary-600"
              />
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
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
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            company ? 'Update Company' : 'Create Company'
          )}
        </Button>
      </div>
    </form>
  );
}

export default CompanyForm;