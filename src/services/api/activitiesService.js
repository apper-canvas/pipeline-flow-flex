import { toast } from "react-toastify";
import React from "react";
import { getApperClient } from "@/services/apperClient";

export const activitiesService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "contactId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{
          "fieldName": "CreatedOn",
          "sorttype": "DESC"
        }]
      };
      
      const response = await apperClient.fetchRecords('activities_c', params);
      
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
      return response.data.map(activity => ({
        ...activity,
        description: activity.description_c || activity.Name || '',
        type: activity.type_c || 'call',
        contactId: activity.contactId_c?.Id || activity.contactId_c || null,
        timestamp: activity.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching activities:", error?.response?.data?.message || error);
      return [];
    }
},

  // Get activities by deal ID (through contact relationship)
  async getByDealId(dealId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "contactId_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [
          {
            "FieldName": "dealId_c",
            "Operator": "EqualTo", 
            "Values": [parseInt(dealId)]
          }
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

const apperClient = getApperClient();
      
      const response = await apperClient.fetchRecords('activities_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(activity => ({
        ...activity,
        description: activity.description_c || activity.Name || '',
        type: activity.type_c || 'call',
        contactId: activity.contactId_c?.Id || activity.contactId_c || null,
        timestamp: activity.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching activities by deal ID:", error?.response?.data?.message || error);
      return [];
}
  },
  async getByContactId(contactId) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "contactId_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{
          "FieldName": "contactId_c",
          "Operator": "EqualTo",
          "Values": [parseInt(contactId)]
        }],
        orderBy: [{
          "fieldName": "CreatedOn",
          "sorttype": "DESC"
        }]
      };
      
      const response = await apperClient.fetchRecords('activities_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response?.data?.length) {
        return [];
      }
      
      // Map database fields to UI expected format
      return response.data.map(activity => ({
        ...activity,
        description: activity.description_c || activity.Name || '',
        type: activity.type_c || 'call',
        contactId: activity.contactId_c?.Id || activity.contactId_c || parseInt(contactId),
        timestamp: activity.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching activities by contact:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(activityData) {
    try {
      const apperClient = getApperClient();
      const tableName = 'activities_c';
      
      const params = {
        records: [
          {
            Name: activityData.description || '',
            description_c: activityData.description || '',
            type_c: activityData.type || 'call',
            contactId_c: parseInt(activityData.contactId) || null
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
          console.error(`Failed to create ${failed.length} activities:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdActivity = successful[0].data;
          return {
            ...createdActivity,
            description: createdActivity.description_c || createdActivity.Name || '',
            type: createdActivity.type_c || 'call',
            contactId: createdActivity.contactId_c?.Id || createdActivity.contactId_c || null,
            timestamp: createdActivity.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating activity:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, activityData) {
    try {
      const apperClient = getApperClient();
      const tableName = 'activities_c';
      
      const updateData = {
        Id: parseInt(id)
      };
      
      // Only include fields that have values
      if (activityData.description !== undefined) {
        updateData.Name = activityData.description;
        updateData.description_c = activityData.description;
      }
      if (activityData.type !== undefined) {
        updateData.type_c = activityData.type;
      }
      if (activityData.contactId !== undefined) {
        updateData.contactId_c = parseInt(activityData.contactId);
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
          console.error(`Failed to update ${failed.length} activities:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updatedActivity = successful[0].data;
          return {
            ...updatedActivity,
            description: updatedActivity.description_c || updatedActivity.Name || '',
            type: updatedActivity.type_c || 'call',
            contactId: updatedActivity.contactId_c?.Id || updatedActivity.contactId_c || null,
            timestamp: updatedActivity.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating activity:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const tableName = 'activities_c';
      
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
          console.error(`Failed to delete ${failed.length} activities:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length === 1;
      }
      return false;
    } catch (error) {
      console.error("Error deleting activity:", error?.response?.data?.message || error);
      return false;
    }
  }
};