import React, { useState, useEffect } from 'react';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import { contactsService } from '@/services/api/contactsService';
import { companiesService } from '@/services/api/companiesService';
import { dealsService } from '@/services/api/dealsService';
import { quotesService } from '@/services/api/quotesService';

const SalesOrderForm = ({ salesOrder, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    Name: '',
    title_c: '',
    order_date_c: '',
    contactId_c: '',
    companyId_c: '',
    dealId_c: '',
    quoteId_c: '',
    total_amount_c: '',
    status_c: 'Draft',
    shipping_address_c: '',
    billing_address_c: '',
    payment_method_c: '',
    Tags: ''
  });

  const [lookupData, setLookupData] = useState({
    contacts: [],
    companies: [],
    deals: [],
    quotes: []
  });

  const [loadingLookups, setLoadingLookups] = useState(true);

  // Status options from schema
  const statusOptions = ['Draft', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
  const paymentMethodOptions = ['Credit Card', 'Bank Transfer', 'Cash', 'Check', 'Other'];

  useEffect(() => {
    if (salesOrder) {
      setFormData({
        Name: salesOrder.Name || '',
        title_c: salesOrder.title_c || '',
        order_date_c: salesOrder.order_date_c || '',
        contactId_c: salesOrder.contactId_c?.Id || salesOrder.contactId_c || '',
        companyId_c: salesOrder.companyId_c?.Id || salesOrder.companyId_c || '',
        dealId_c: salesOrder.dealId_c?.Id || salesOrder.dealId_c || '',
        quoteId_c: salesOrder.quoteId_c?.Id || salesOrder.quoteId_c || '',
        total_amount_c: salesOrder.total_amount_c || '',
        status_c: salesOrder.status_c || 'Draft',
        shipping_address_c: salesOrder.shipping_address_c || '',
        billing_address_c: salesOrder.billing_address_c || '',
        payment_method_c: salesOrder.payment_method_c || '',
        Tags: salesOrder.Tags || ''
      });
    } else {
      // Set default order date to today for new sales orders
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        order_date_c: today
      }));
    }
  }, [salesOrder]);

  useEffect(() => {
    loadLookupData();
  }, []);

  const loadLookupData = async () => {
    setLoadingLookups(true);
    try {
      const [contactsResponse, companiesResponse, dealsResponse, quotesResponse] = await Promise.all([
        contactsService.getAll('', '', 100, 0),
        companiesService.getAll('', '', 100, 0),
        dealsService.getAll('', '', 100, 0),
        quotesService.getAll('', '', 100, 0)
      ]);

      setLookupData({
        contacts: contactsResponse.data || [],
        companies: companiesResponse.data || [],
        deals: dealsResponse.data || [],
        quotes: quotesResponse.data || []
      });
    } catch (error) {
      console.error('Error loading lookup data:', error);
    } finally {
      setLoadingLookups(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.Name.trim()) {
      alert('Sales Order name is required');
      return;
    }

    if (!formData.title_c.trim()) {
      alert('Title is required');
      return;
    }

    if (!formData.order_date_c) {
      alert('Order date is required');
      return;
    }

    if (!formData.total_amount_c || parseFloat(formData.total_amount_c) <= 0) {
      alert('Total amount must be greater than 0');
      return;
    }

    // Prepare data with proper formatting
    const submitData = {
      ...formData,
      total_amount_c: parseFloat(formData.total_amount_c),
      // Lookup fields will be handled by the service (convert to integer IDs)
      contactId_c: formData.contactId_c ? parseInt(formData.contactId_c) : undefined,
      companyId_c: formData.companyId_c ? parseInt(formData.companyId_c) : undefined,
      dealId_c: formData.dealId_c ? parseInt(formData.dealId_c) : undefined,
      quoteId_c: formData.quoteId_c ? parseInt(formData.quoteId_c) : undefined
    };

    onSubmit(submitData);
  };

  const renderLookupSelect = (fieldName, label, options, valueKey = 'Id', displayKey = 'Name') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={fieldName}
        value={formData[fieldName]}
        onChange={handleInputChange}
        disabled={loadingLookups}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option[displayKey]}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Sales Order Name"
          name="Name"
          value={formData.Name}
          onChange={handleInputChange}
          required
          placeholder="Enter sales order name"
        />

        <Input
          label="Title"
          name="title_c"
          value={formData.title_c}
          onChange={handleInputChange}
          required
          placeholder="Enter sales order title"
        />

        <Input
          label="Order Date"
          name="order_date_c"
          type="date"
          value={formData.order_date_c}
          onChange={handleInputChange}
          required
        />

        <Input
          label="Total Amount"
          name="total_amount_c"
          type="number"
          step="0.01"
          min="0"
          value={formData.total_amount_c}
          onChange={handleInputChange}
          required
          placeholder="0.00"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status_c"
            value={formData.status_c}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            name="payment_method_c"
            value={formData.payment_method_c}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select Payment Method</option>
            {paymentMethodOptions.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {renderLookupSelect('contactId_c', 'Contact', lookupData.contacts)}
        {renderLookupSelect('companyId_c', 'Company', lookupData.companies)}
        {renderLookupSelect('dealId_c', 'Deal', lookupData.deals)}
        {renderLookupSelect('quoteId_c', 'Quote', lookupData.quotes)}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shipping Address
          </label>
          <textarea
            name="shipping_address_c"
            value={formData.shipping_address_c}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter shipping address"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Billing Address
          </label>
          <textarea
            name="billing_address_c"
            value={formData.billing_address_c}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter billing address"
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Tags"
            name="Tags"
            value={formData.Tags}
            onChange={handleInputChange}
            placeholder="Enter tags (comma-separated)"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? 'Saving...' : (salesOrder ? 'Update' : 'Create')} Sales Order
        </Button>
      </div>
    </form>
  );
};

export default SalesOrderForm;