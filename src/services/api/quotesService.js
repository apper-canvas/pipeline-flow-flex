import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class QuotesService {
  constructor() {
    this.apperClient = null;
    this.tableName = 'quotes_c';
    this.initializeClient();
  }

  async initializeClient() {
    try {
      this.apperClient = getApperClient();
    } catch (error) {
      console.error('Failed to initialize ApperClient:', error);
    }
  }

async getAll(searchTerm = '', statusFilter = '', limit = 50, offset = 0) {
    try {
      // Sanitize and validate input parameters to prevent circular structure issues
      const sanitizedSearchTerm = this.sanitizeInput(searchTerm);
      const sanitizedStatusFilter = this.sanitizeInput(statusFilter);
      const sanitizedLimit = Number(limit) || 50;
      const sanitizedOffset = Number(offset) || 0;
      if (!this.apperClient) {
        await this.initializeClient();
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "companyId_c"}},
          {"field": {"Name": "contactId_c"}},
          {"field": {"Name": "dealId_c"}},
          {"field": {"Name": "quoteDate_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "deliveryMethod_c"}},
          {"field": {"Name": "expiresOn_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [],
orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}],
        pagingInfo: { limit: sanitizedLimit, offset: sanitizedOffset }
      };

      // Add search filter if provided
// Add search filter if provided (using sanitized input)
      if (sanitizedSearchTerm && sanitizedSearchTerm.trim()) {
        params.where.push({
          "FieldName": "Name",
          "Operator": "Contains",
          "Values": [sanitizedSearchTerm.trim()],
          "Include": true
        });
      }

      // Add status filter if provided
// Add status filter if provided (using sanitized input)
      if (sanitizedStatusFilter && sanitizedStatusFilter !== 'all') {
        params.where.push({
          "FieldName": "status_c",
          "Operator": "EqualTo",
          "Values": [sanitizedStatusFilter],
          "Include": true
        });
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching quotes:", error?.response?.data?.message || error);
      toast.error("Failed to fetch quotes");
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) {
        await this.initializeClient();
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "companyId_c"}},
          {"field": {"Name": "contactId_c"}},
          {"field": {"Name": "dealId_c"}},
          {"field": {"Name": "quoteDate_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "deliveryMethod_c"}},
          {"field": {"Name": "expiresOn_c"}},
          {"field": {"Name": "billToName_c"}},
          {"field": {"Name": "billingStreet_c"}},
          {"field": {"Name": "billingCity_c"}},
          {"field": {"Name": "billingState_c"}},
          {"field": {"Name": "billingCountry_c"}},
          {"field": {"Name": "billingPincode_c"}},
          {"field": {"Name": "shipToName_c"}},
          {"field": {"Name": "shippingStreet_c"}},
          {"field": {"Name": "shippingCity_c"}},
          {"field": {"Name": "shippingState_c"}},
          {"field": {"Name": "shippingCountry_c"}},
          {"field": {"Name": "shippingPincode_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "Owner"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to fetch quote details");
      return null;
    }
  }

  async create(quoteData) {
    try {
      if (!this.apperClient) {
        await this.initializeClient();
      }

      // Only include Updateable fields and ensure lookup fields are integers
      const cleanData = {
        Name: quoteData.Name,
        title_c: quoteData.title_c,
        companyId_c: quoteData.companyId_c ? parseInt(quoteData.companyId_c) : null,
        contactId_c: quoteData.contactId_c ? parseInt(quoteData.contactId_c) : null,
        dealId_c: quoteData.dealId_c ? parseInt(quoteData.dealId_c) : null,
        quoteDate_c: quoteData.quoteDate_c,
        status_c: quoteData.status_c || 'Draft',
        deliveryMethod_c: quoteData.deliveryMethod_c,
        expiresOn_c: quoteData.expiresOn_c,
        billToName_c: quoteData.billToName_c,
        billingStreet_c: quoteData.billingStreet_c,
        billingCity_c: quoteData.billingCity_c,
        billingState_c: quoteData.billingState_c,
        billingCountry_c: quoteData.billingCountry_c,
        billingPincode_c: quoteData.billingPincode_c,
        shipToName_c: quoteData.shipToName_c,
        shippingStreet_c: quoteData.shippingStreet_c,
        shippingCity_c: quoteData.shippingCity_c,
        shippingState_c: quoteData.shippingState_c,
        shippingCountry_c: quoteData.shippingCountry_c,
        shippingPincode_c: quoteData.shippingPincode_c,
        description_c: quoteData.description_c,
        amount_c: quoteData.amount_c ? parseFloat(quoteData.amount_c) : null,
        Tags: quoteData.Tags
      };

      // Remove null/undefined values
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === null || cleanData[key] === undefined || cleanData[key] === '') {
          delete cleanData[key];
        }
      });

      const params = {
        records: [cleanData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} quotes:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Quote created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating quote:", error?.response?.data?.message || error);
      toast.error("Failed to create quote");
      return null;
    }
  }

  async update(id, quoteData) {
    try {
      if (!this.apperClient) {
        await this.initializeClient();
      }

      // Only include Updateable fields and ensure lookup fields are integers
      const cleanData = {
        Id: parseInt(id),
        Name: quoteData.Name,
        title_c: quoteData.title_c,
        companyId_c: quoteData.companyId_c ? parseInt(quoteData.companyId_c) : null,
        contactId_c: quoteData.contactId_c ? parseInt(quoteData.contactId_c) : null,
        dealId_c: quoteData.dealId_c ? parseInt(quoteData.dealId_c) : null,
        quoteDate_c: quoteData.quoteDate_c,
        status_c: quoteData.status_c,
        deliveryMethod_c: quoteData.deliveryMethod_c,
        expiresOn_c: quoteData.expiresOn_c,
        billToName_c: quoteData.billToName_c,
        billingStreet_c: quoteData.billingStreet_c,
        billingCity_c: quoteData.billingCity_c,
        billingState_c: quoteData.billingState_c,
        billingCountry_c: quoteData.billingCountry_c,
        billingPincode_c: quoteData.billingPincode_c,
        shipToName_c: quoteData.shipToName_c,
        shippingStreet_c: quoteData.shippingStreet_c,
        shippingCity_c: quoteData.shippingCity_c,
        shippingState_c: quoteData.shippingState_c,
        shippingCountry_c: quoteData.shippingCountry_c,
        shippingPincode_c: quoteData.shippingPincode_c,
        description_c: quoteData.description_c,
        amount_c: quoteData.amount_c ? parseFloat(quoteData.amount_c) : null,
        Tags: quoteData.Tags
      };

      // Remove null/undefined values (except Id)
      Object.keys(cleanData).forEach(key => {
        if (key !== 'Id' && (cleanData[key] === null || cleanData[key] === undefined || cleanData[key] === '')) {
          delete cleanData[key];
        }
      });

      const params = {
        records: [cleanData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} quotes:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Quote updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating quote:", error?.response?.data?.message || error);
      toast.error("Failed to update quote");
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) {
        await this.initializeClient();
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} quotes:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Quote deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting quote:", error?.response?.data?.message || error);
      toast.error("Failed to delete quote");
      return false;
    }
  }

  getStatusVariant(status) {
    const variants = {
      'Draft': 'default',
      'Sent': 'primary',
      'Accepted': 'success',
      'Rejected': 'error',
      'Expired': 'warning'
    };
    return variants[status] || 'default';
  }

  formatAmount(amount) {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
}

  // Helper method to sanitize inputs and prevent circular structure issues
  sanitizeInput(input) {
    // Handle null, undefined, or empty values
    if (input === null || input === undefined) {
      return '';
    }
    
    // If input is an object (including DOM elements), extract the value property or convert to string
    if (typeof input === 'object') {
      // Handle React synthetic events or DOM elements
      if (input.target && input.target.value !== undefined) {
        return String(input.target.value);
      }
      // Handle objects with a value property
      if (input.value !== undefined) {
        return String(input.value);
      }
      // For other objects, try to convert to string safely
      try {
        return String(input);
      } catch (error) {
        console.error('Error converting input to string:', error);
        return '';
      }
    }
    
    // For primitive values, convert to string
    return String(input);
  }
}

export const quotesService = new QuotesService();