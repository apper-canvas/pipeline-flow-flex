import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import React from "react";

export const contactsService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      
const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}}
        ]
      };
      
      const response = await apperClient.fetchRecords('contacts_c', params);
      
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
      return response.data.map(contact => ({
        ...contact,
        name: contact.Name || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '', 
        notes: contact.notes_c || '',
        createdAt: contact.CreatedOn,
        lastContactedAt: contact.ModifiedOn || contact.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching contacts:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const tableName = 'contacts_c';
      
const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}}
        ]
      };
      
      const response = await apperClient.getRecordById(tableName, parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }
      
      // Map database fields to UI expected format
      const contact = response.data;
      return {
        ...contact,
        name: contact.Name || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
        notes: contact.notes_c || '',
        createdAt: contact.CreatedOn,
        lastContactedAt: contact.ModifiedOn || contact.CreatedOn
      };
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(contactData) {
    try {
      const apperClient = getApperClient();
      const tableName = 'contacts_c';
      
      const params = {
        records: [
          {
            Name: contactData.name || '',
            email_c: contactData.email || '',
            phone_c: contactData.phone || '',
            company_c: contactData.company || '',
            notes_c: contactData.notes || ''
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
          console.error(`Failed to create ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdContact = successful[0].data;
          return {
            ...createdContact,
            name: createdContact.Name || '',
            email: createdContact.email_c || '',
            phone: createdContact.phone_c || '',
            company: createdContact.company_c || '',
            notes: createdContact.notes_c || '',
            createdAt: createdContact.CreatedOn,
            lastContactedAt: createdContact.ModifiedOn || createdContact.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating contact:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, contactData) {
    try {
      const apperClient = getApperClient();
      const tableName = 'contacts_c';
      
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: contactData.name || '',
            email_c: contactData.email || '',
            phone_c: contactData.phone || '',
            company_c: contactData.company || '',
            notes_c: contactData.notes || ''
          }
        ]
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
          console.error(`Failed to update ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updatedContact = successful[0].data;
          return {
            ...updatedContact,
            name: updatedContact.Name || '',
            email: updatedContact.email_c || '',
            phone: updatedContact.phone_c || '',
            company: updatedContact.company_c || '',
            notes: updatedContact.notes_c || '',
            createdAt: updatedContact.CreatedOn,
            lastContactedAt: updatedContact.ModifiedOn || updatedContact.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating contact:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const tableName = 'contacts_c';
      
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
          console.error(`Failed to delete ${failed.length} contacts:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length === 1;
      }
      return false;
    } catch (error) {
      console.error("Error deleting contact:", error?.response?.data?.message || error);
      return false;
}
  }
};