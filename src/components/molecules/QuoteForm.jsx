import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { companiesService } from '@/services/api/companiesService';
import { contactsService } from '@/services/api/contactsService';
import { dealsService } from '@/services/api/dealsService';
import { toast } from 'react-toastify';

export default function QuoteForm({ quote, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    Name: '',
    title_c: '',
    companyId_c: '',
    contactId_c: '',
    dealId_c: '',
    quoteDate_c: '',
    status_c: 'Draft',
    deliveryMethod_c: 'Email',
    expiresOn_c: '',
    billToName_c: '',
    billingStreet_c: '',
    billingCity_c: '',
    billingState_c: '',
    billingCountry_c: '',
    billingPincode_c: '',
    shipToName_c: '',
    shippingStreet_c: '',
    shippingCity_c: '',
    shippingState_c: '',
    shippingCountry_c: '',
    shippingPincode_c: '',
    description_c: '',
    amount_c: '',
    Tags: ''
  });
  
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyBillingToShipping, setCopyBillingToShipping] = useState(false);

  useEffect(() => {
    loadData();
    if (quote) {
      setFormData({
        Name: quote.Name || '',
        title_c: quote.title_c || '',
        companyId_c: quote.companyId_c?.Id || quote.companyId_c || '',
        contactId_c: quote.contactId_c?.Id || quote.contactId_c || '',
        dealId_c: quote.dealId_c?.Id || quote.dealId_c || '',
        quoteDate_c: quote.quoteDate_c || '',
        status_c: quote.status_c || 'Draft',
        deliveryMethod_c: quote.deliveryMethod_c || 'Email',
        expiresOn_c: quote.expiresOn_c || '',
        billToName_c: quote.billToName_c || '',
        billingStreet_c: quote.billingStreet_c || '',
        billingCity_c: quote.billingCity_c || '',
        billingState_c: quote.billingState_c || '',
        billingCountry_c: quote.billingCountry_c || '',
        billingPincode_c: quote.billingPincode_c || '',
        shipToName_c: quote.shipToName_c || '',
        shippingStreet_c: quote.shippingStreet_c || '',
        shippingCity_c: quote.shippingCity_c || '',
        shippingState_c: quote.shippingState_c || '',
        shippingCountry_c: quote.shippingCountry_c || '',
        shippingPincode_c: quote.shippingPincode_c || '',
        description_c: quote.description_c || '',
        amount_c: quote.amount_c || '',
        Tags: quote.Tags || ''
      });
    }
  }, [quote]);

const loadData = async () => {
    try {
      const [companiesData, contactsData, dealsData] = await Promise.all([
        companiesService.getAll(),
        contactsService.getAll(),
        dealsService.getAll()
      ]);
// Ensure we always set arrays, even if services return unexpected data
      setCompanies(Array.isArray(companiesData?.data) ? companiesData.data : []);
      setContacts(Array.isArray(contactsData?.data) ? contactsData.data : []);
      setDeals(Array.isArray(dealsData?.data) ? dealsData.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load form data');
      // Set empty arrays on error to prevent map errors
      setCompanies([]);
      setContacts([]);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCopyBillingToShipping = () => {
    if (copyBillingToShipping) {
      setFormData(prev => ({
        ...prev,
        shipToName_c: prev.billToName_c,
        shippingStreet_c: prev.billingStreet_c,
        shippingCity_c: prev.billingCity_c,
        shippingState_c: prev.billingState_c,
        shippingCountry_c: prev.billingCountry_c,
        shippingPincode_c: prev.billingPincode_c
      }));
    }
  };

  useEffect(() => {
    if (copyBillingToShipping) {
      handleCopyBillingToShipping();
    }
  }, [copyBillingToShipping, formData.billToName_c, formData.billingStreet_c, formData.billingCity_c, formData.billingState_c, formData.billingCountry_c, formData.billingPincode_c]);

  const validateForm = () => {
    if (!formData.Name.trim()) {
      toast.error('Quote name is required');
      return false;
    }
    if (!formData.title_c.trim()) {
      toast.error('Quote title is required');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Quote Name *"
          name="Name"
          value={formData.Name}
          onChange={handleChange}
          placeholder="Enter quote name"
          required
        />
        <Input
          label="Title *"
          name="title_c"
          value={formData.title_c}
          onChange={handleChange}
          placeholder="Enter quote title"
          required
        />
      </div>

      {/* Relationships */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Company
          </label>
          <select
            name="companyId_c"
            value={formData.companyId_c}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select Company</option>
{(companies || []).map(company => (
              <option key={company.Id} value={company.Id}>
                {company.Name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Contact
          </label>
          <select
            name="contactId_c"
            value={formData.contactId_c}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select Contact</option>
{(contacts || []).map(contact => (
              <option key={contact.Id} value={contact.Id}>
                {contact.Name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Deal
          </label>
          <select
            name="dealId_c"
            value={formData.dealId_c}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select Deal</option>
{(deals || []).map(deal => (
              <option key={deal.Id} value={deal.Id}>
                {deal.title_c || deal.Name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Quote Date"
          name="quoteDate_c"
          type="date"
          value={formData.quoteDate_c}
          onChange={handleChange}
        />
        <Input
          label="Expires On"
          name="expiresOn_c"
          type="date"
          value={formData.expiresOn_c}
          onChange={handleChange}
        />
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Status
          </label>
          <select
            name="status_c"
            value={formData.status_c}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Delivery Method
          </label>
          <select
            name="deliveryMethod_c"
            value={formData.deliveryMethod_c}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Email">Email</option>
            <option value="Post">Post</option>
            <option value="In Person">In Person</option>
          </select>
        </div>
      </div>

      {/* Billing Address */}
      <div>
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Billing Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Bill To Name"
            name="billToName_c"
            value={formData.billToName_c}
            onChange={handleChange}
            placeholder="Enter billing contact name"
          />
          <Input
            label="Street"
            name="billingStreet_c"
            value={formData.billingStreet_c}
            onChange={handleChange}
            placeholder="Enter street address"
          />
          <Input
            label="City"
            name="billingCity_c"
            value={formData.billingCity_c}
            onChange={handleChange}
            placeholder="Enter city"
          />
          <Input
            label="State"
            name="billingState_c"
            value={formData.billingState_c}
            onChange={handleChange}
            placeholder="Enter state"
          />
          <Input
            label="Country"
            name="billingCountry_c"
            value={formData.billingCountry_c}
            onChange={handleChange}
            placeholder="Enter country"
          />
          <Input
            label="Pincode"
            name="billingPincode_c"
            value={formData.billingPincode_c}
            onChange={handleChange}
            placeholder="Enter pincode"
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-secondary-900">Shipping Address</h3>
          <label className="flex items-center text-sm text-secondary-600">
            <input
              type="checkbox"
              checked={copyBillingToShipping}
              onChange={(e) => setCopyBillingToShipping(e.target.checked)}
              className="mr-2 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            Same as billing address
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ship To Name"
            name="shipToName_c"
            value={formData.shipToName_c}
            onChange={handleChange}
            placeholder="Enter shipping contact name"
          />
          <Input
            label="Street"
            name="shippingStreet_c"
            value={formData.shippingStreet_c}
            onChange={handleChange}
            placeholder="Enter street address"
          />
          <Input
            label="City"
            name="shippingCity_c"
            value={formData.shippingCity_c}
            onChange={handleChange}
            placeholder="Enter city"
          />
          <Input
            label="State"
            name="shippingState_c"
            value={formData.shippingState_c}
            onChange={handleChange}
            placeholder="Enter state"
          />
          <Input
            label="Country"
            name="shippingCountry_c"
            value={formData.shippingCountry_c}
            onChange={handleChange}
            placeholder="Enter country"
          />
          <Input
            label="Pincode"
            name="shippingPincode_c"
            value={formData.shippingPincode_c}
            onChange={handleChange}
            placeholder="Enter pincode"
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Amount"
          name="amount_c"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount_c}
          onChange={handleChange}
          placeholder="Enter amount"
        />
        <Input
          label="Tags"
          name="Tags"
          value={formData.Tags}
          onChange={handleChange}
          placeholder="Enter tags (comma-separated)"
        />
      </div>

      <div>
<label className="block text-sm font-medium text-secondary-800 mb-1">
          Description
        </label>
        <textarea
          name="description_c"
          value={formData.description_c}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter quote description"
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-secondary-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {quote ? 'Update Quote' : 'Create Quote'}
        </Button>
      </div>
    </form>
  );
}