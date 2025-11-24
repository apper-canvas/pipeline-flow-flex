import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

// Company service using ApperClient for company_c table
export const companiesService = {
  // Fetch all companies with filtering, sorting, and pagination
  async getAll(params = {}) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const {
        search = '',
        sortField = 'ModifiedOn',
        sortDirection = 'DESC',
        limit = 50,
        offset = 0
      } = params;

      // Build where conditions for search
      const whereConditions = [];
      if (search.trim()) {
        whereConditions.push({
          FieldName: 'Name',
          Operator: 'Contains',
          Values: [search.trim()],
          Include: true
        });
      }

      const requestParams = {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "industry_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "website_c"}},
          {"field": {"Name": "revenue_c"}},
          {"field": {"Name": "employees_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}},
          {"field": {"Name": "Owner"}}
        ],
        where: whereConditions,
        orderBy: [{
          fieldName: sortField,
          sorttype: sortDirection
        }],
        pagingInfo: {
          limit: limit,
          offset: offset
        }
      };

      const response = await apperClient.fetchRecords('company_c', requestParams);

      if (!response.success) {
        console.error('Failed to fetch companies:', response.message);
        toast.error(response.message);
        return { data: [], total: 0 };
      }

      return {
        data: response.data || [],
        total: response.total || 0,
        pageInfo: response.pageInfo || { limit, offset }
      };

    } catch (error) {
      console.error('Error fetching companies:', error?.response?.data?.message || error.message);
      toast.error('Failed to load companies');
      return { data: [], total: 0 };
    }
  },

  // Get company by ID
  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "industry_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "website_c"}},
          {"field": {"Name": "revenue_c"}},
          {"field": {"Name": "employees_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}},
          {"field": {"Name": "Owner"}}
        ]
      };

      const response = await apperClient.getRecordById('company_c', id, params);

      if (!response.success) {
        console.error('Failed to fetch company:', response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;

    } catch (error) {
      console.error(`Error fetching company ${id}:`, error?.response?.data?.message || error.message);
      toast.error('Failed to load company details');
      return null;
    }
  },

  // Create new company
  async create(companyData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      // Only include updateable fields and filter out empty values
      const updateableData = {};
      const updateableFields = ['Name', 'Tags', 'industry_c', 'address_c', 'phone_c', 'website_c', 'revenue_c', 'employees_c', 'description_c'];
      
      updateableFields.forEach(field => {
        if (companyData[field] !== undefined && companyData[field] !== null && companyData[field] !== '') {
          updateableData[field] = companyData[field];
        }
      });

      // Format numeric fields
      if (updateableData.revenue_c) {
        updateableData.revenue_c = parseFloat(updateableData.revenue_c);
      }
      if (updateableData.employees_c) {
        updateableData.employees_c = parseInt(updateableData.employees_c);
      }

      const params = {
        records: [updateableData]
      };

      const response = await apperClient.createRecord('company_c', params);

      if (!response.success) {
        console.error('Failed to create company:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Company created successfully');
          return successful[0].data;
        }
      }

      return null;

    } catch (error) {
      console.error('Error creating company:', error?.response?.data?.message || error.message);
      toast.error('Failed to create company');
      return null;
    }
  },

  // Update existing company
  async update(id, companyData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      // Only include updateable fields and filter out empty values
      const updateableData = { Id: parseInt(id) };
      const updateableFields = ['Name', 'Tags', 'industry_c', 'address_c', 'phone_c', 'website_c', 'revenue_c', 'employees_c', 'description_c'];
      
      updateableFields.forEach(field => {
        if (companyData[field] !== undefined && companyData[field] !== null && companyData[field] !== '') {
          updateableData[field] = companyData[field];
        }
      });

      // Format numeric fields
      if (updateableData.revenue_c) {
        updateableData.revenue_c = parseFloat(updateableData.revenue_c);
      }
      if (updateableData.employees_c) {
        updateableData.employees_c = parseInt(updateableData.employees_c);
      }

      const params = {
        records: [updateableData]
      };

      const response = await apperClient.updateRecord('company_c', params);

      if (!response.success) {
        console.error('Failed to update company:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Company updated successfully');
          return successful[0].data;
        }
      }

      return null;

    } catch (error) {
      console.error('Error updating company:', error?.response?.data?.message || error.message);
      toast.error('Failed to update company');
      return null;
    }
  },

  // Delete company
  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('company_c', params);

      if (!response.success) {
        console.error('Failed to delete company:', response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Company deleted successfully');
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error('Error deleting company:', error?.response?.data?.message || error.message);
      toast.error('Failed to delete company');
      return false;
    }
  }
};