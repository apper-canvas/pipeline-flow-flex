import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class SalesOrdersService {
  constructor() {
    this.tableName = 'sales_orders_c';
    this.apperClient = null;
  }

  async initializeClient() {
    if (!this.apperClient) {
      this.apperClient = getApperClient();
    }
    return this.apperClient;
  }

  async getAll(searchTerm = '', statusFilter = '', limit = 50, offset = 0) {
    try {
      const apperClient = await this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return { data: [], total: 0 };
      }

      const params = {
        fields: [
{"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "contactId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "companyId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "dealId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "quoteId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "payment_method_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [],
        orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}],
        pagingInfo: { limit, offset }
      };

      if (searchTerm.trim()) {
        params.where.push({
          "FieldName": "title_c",
          "Operator": "Contains",
          "Values": [searchTerm.trim()],
          "Include": true
        });
      }

      if (statusFilter && statusFilter !== 'all') {
        params.where.push({
          "FieldName": "status_c",
          "Operator": "EqualTo",
          "Values": [statusFilter],
          "Include": true
        });
      }

      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return { data: [], total: 0 };
      }

      return {
        data: response.data || [],
        total: response.total || 0
      };

    } catch (error) {
      console.error("Error fetching sales orders:", error?.response?.data?.message || error);
      return { data: [], total: 0 };
    }
  }

  async getById(id) {
    try {
      const apperClient = await this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return null;
      }

      const params = {
        fields: [
{"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "order_date_c"}},
          {"field": {"Name": "contactId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "companyId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "dealId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "quoteId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "total_amount_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "shipping_address_c"}},
          {"field": {"Name": "billing_address_c"}},
          {"field": {"Name": "payment_method_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "Tags"}}
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;

    } catch (error) {
      console.error(`Error fetching sales order ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(salesOrderData) {
    try {
      const apperClient = await this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return null;
      }

      // Filter to include only Updateable fields and non-empty values
      const updateableFields = [
        'Name', 'title_c', 'order_date_c', 'contactId_c', 'companyId_c', 
        'dealId_c', 'quoteId_c', 'total_amount_c', 'status_c', 
        'shipping_address_c', 'billing_address_c', 'payment_method_c', 'Tags'
      ];

      const filteredData = {};
      updateableFields.forEach(field => {
        if (salesOrderData[field] !== undefined && salesOrderData[field] !== null && salesOrderData[field] !== '') {
          // Handle lookup fields - convert to integer ID
          if (['contactId_c', 'companyId_c', 'dealId_c', 'quoteId_c'].includes(field)) {
            const value = salesOrderData[field]?.Id || salesOrderData[field];
            if (value) {
              filteredData[field] = parseInt(value);
            }
          } else if (field === 'total_amount_c') {
            // Ensure numeric fields are properly formatted
            filteredData[field] = parseFloat(salesOrderData[field]);
          } else {
            filteredData[field] = salesOrderData[field];
          }
        }
      });

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create sales order:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Sales order created successfully');
          return successful[0].data;
        }
      }

      return null;

    } catch (error) {
      console.error("Error creating sales order:", error?.response?.data?.message || error);
      toast.error('Failed to create sales order');
      return null;
    }
  }

  async update(id, salesOrderData) {
    try {
      const apperClient = await this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return null;
      }

      // Filter to include only Updateable fields and non-empty values
      const updateableFields = [
        'Name', 'title_c', 'order_date_c', 'contactId_c', 'companyId_c', 
        'dealId_c', 'quoteId_c', 'total_amount_c', 'status_c', 
        'shipping_address_c', 'billing_address_c', 'payment_method_c', 'Tags'
      ];

      const filteredData = { Id: parseInt(id) };
      updateableFields.forEach(field => {
        if (salesOrderData[field] !== undefined && salesOrderData[field] !== null && salesOrderData[field] !== '') {
          // Handle lookup fields - convert to integer ID
          if (['contactId_c', 'companyId_c', 'dealId_c', 'quoteId_c'].includes(field)) {
            const value = salesOrderData[field]?.Id || salesOrderData[field];
            if (value) {
              filteredData[field] = parseInt(value);
            }
          } else if (field === 'total_amount_c') {
            // Ensure numeric fields are properly formatted
            filteredData[field] = parseFloat(salesOrderData[field]);
          } else {
            filteredData[field] = salesOrderData[field];
          }
        }
      });

      const params = {
        records: [filteredData]
      };

      const response = await apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update sales order:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Sales order updated successfully');
          return successful[0].data;
        }
      }

      return null;

    } catch (error) {
      console.error("Error updating sales order:", error?.response?.data?.message || error);
      toast.error('Failed to update sales order');
      return null;
    }
  }

  async delete(id) {
    try {
      const apperClient = await this.initializeClient();
      if (!apperClient) {
        console.error('ApperClient not available');
        return false;
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete sales order:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        if (successful.length > 0) {
          toast.success('Sales order deleted successfully');
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error("Error deleting sales order:", error?.response?.data?.message || error);
      toast.error('Failed to delete sales order');
      return false;
    }
  }

  // Utility methods
  getStatusVariant(status) {
    const statusMap = {
      'Draft': 'secondary',
      'Confirmed': 'primary',
      'Shipped': 'warning',
      'Delivered': 'success',
      'Cancelled': 'error',
      'Returned': 'secondary'
    };
    return statusMap[status] || 'secondary';
  }

  formatAmount(amount) {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getPaymentMethodIcon(method) {
    const iconMap = {
      'Credit Card': 'CreditCard',
      'Bank Transfer': 'Banknote',
      'Cash': 'Wallet',
      'Check': 'FileCheck',
      'Other': 'HelpCircle'
    };
    return iconMap[method] || 'HelpCircle';
  }

  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
  }
}

export const salesOrdersService = new SalesOrdersService();