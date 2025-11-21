import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const dealsService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "expectedCloseDate_c"}},
          {"field": {"Name": "contactId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };
      
      const response = await apperClient.fetchRecords('deals_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // IMPORTANT: Handle empty or non-existent data
      if (!response?.data?.length) {
        return [];
      }
      
      // Map database fields to UI expected format
      return response.data.map(deal => ({
        ...deal,
        title: deal.title_c || deal.Name || '',
        value: parseFloat(deal.value_c) || 0,
        stage: deal.stage_c || 'lead',
        expectedCloseDate: deal.expectedCloseDate_c || '',
        contactId: deal.contactId_c?.Id || deal.contactId_c || null,
        createdAt: deal.CreatedOn,
        movedToStageAt: deal.ModifiedOn || deal.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching deals:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const tableName = 'deals_c';
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "expectedCloseDate_c"}},
          {"field": {"Name": "contactId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };
      
      const response = await apperClient.getRecordById(tableName, parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }
      
      // Map database fields to UI expected format
      const deal = response.data;
      return {
        ...deal,
        title: deal.title_c || deal.Name || '',
        value: parseFloat(deal.value_c) || 0,
        stage: deal.stage_c || 'lead',
        expectedCloseDate: deal.expectedCloseDate_c || '',
        contactId: deal.contactId_c?.Id || deal.contactId_c || null,
        createdAt: deal.CreatedOn,
        movedToStageAt: deal.ModifiedOn || deal.CreatedOn
      };
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async getByContactId(contactId) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "expectedCloseDate_c"}},
          {"field": {"Name": "contactId_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "contactId_c",
          "Operator": "EqualTo",
          "Values": [parseInt(contactId)]
        }]
      };
      
      const response = await apperClient.fetchRecords('deals_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response?.data?.length) {
        return [];
      }
      
      // Map database fields to UI expected format
      return response.data.map(deal => ({
        ...deal,
        title: deal.title_c || deal.Name || '',
        value: parseFloat(deal.value_c) || 0,
        stage: deal.stage_c || 'lead',
        expectedCloseDate: deal.expectedCloseDate_c || '',
        contactId: deal.contactId_c?.Id || deal.contactId_c || parseInt(contactId),
        createdAt: deal.CreatedOn,
        movedToStageAt: deal.ModifiedOn || deal.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching deals by contact:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(dealData) {
    try {
      const apperClient = getApperClient();
      const tableName = 'deals_c';
      
      const params = {
        records: [
          {
            Name: dealData.title || '',
            title_c: dealData.title || '',
            value_c: parseFloat(dealData.value) || 0,
            stage_c: dealData.stage || 'lead',
            expectedCloseDate_c: dealData.expectedCloseDate || '',
            contactId_c: parseInt(dealData.contactId) || null
          }
        ]
      };
      
      const response = await apperClient.createRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdDeal = successful[0].data;
          return {
            ...createdDeal,
            title: createdDeal.title_c || createdDeal.Name || '',
            value: parseFloat(createdDeal.value_c) || 0,
            stage: createdDeal.stage_c || 'lead',
            expectedCloseDate: createdDeal.expectedCloseDate_c || '',
            contactId: createdDeal.contactId_c?.Id || createdDeal.contactId_c || null,
            createdAt: createdDeal.CreatedOn,
            movedToStageAt: createdDeal.ModifiedOn || createdDeal.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating deal:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, dealData) {
    try {
      const apperClient = getApperClient();
      const tableName = 'deals_c';
      
      const updateData = {
        Id: parseInt(id)
      };
      
      // Only include fields that have values
      if (dealData.title !== undefined) {
        updateData.Name = dealData.title;
        updateData.title_c = dealData.title;
      }
      if (dealData.value !== undefined) {
        updateData.value_c = parseFloat(dealData.value);
      }
      if (dealData.stage !== undefined) {
        updateData.stage_c = dealData.stage;
      }
      if (dealData.expectedCloseDate !== undefined) {
        updateData.expectedCloseDate_c = dealData.expectedCloseDate;
      }
      if (dealData.contactId !== undefined) {
        updateData.contactId_c = parseInt(dealData.contactId);
      }
      
      const params = {
        records: [updateData]
      };
      
      const response = await apperClient.updateRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updatedDeal = successful[0].data;
          return {
            ...updatedDeal,
            title: updatedDeal.title_c || updatedDeal.Name || '',
            value: parseFloat(updatedDeal.value_c) || 0,
            stage: updatedDeal.stage_c || 'lead',
            expectedCloseDate: updatedDeal.expectedCloseDate_c || '',
            contactId: updatedDeal.contactId_c?.Id || updatedDeal.contactId_c || null,
            createdAt: updatedDeal.CreatedOn,
            movedToStageAt: updatedDeal.ModifiedOn || updatedDeal.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating deal:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const tableName = 'deals_c';
      
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length === 1;
      }
      return false;
    } catch (error) {
      console.error("Error deleting deal:", error?.response?.data?.message || error);
      return false;
    }
  }
};