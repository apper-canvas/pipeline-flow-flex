import dealsData from "@/services/mockData/deals.json";

let deals = [...dealsData];

const delay = () => new Promise(resolve => setTimeout(resolve, 300));

export const dealsService = {
  async getAll() {
    await delay();
    return [...deals];
  },

  async getById(id) {
    await delay();
    const deal = deals.find(d => d.Id === parseInt(id));
    return deal ? { ...deal } : null;
  },

  async getByContactId(contactId) {
    await delay();
    return deals.filter(d => d.contactId === parseInt(contactId)).map(d => ({ ...d }));
  },

  async create(dealData) {
    await delay();
    const newDeal = {
      ...dealData,
      Id: Math.max(...deals.map(d => d.Id)) + 1,
      contactId: parseInt(dealData.contactId),
      value: parseFloat(dealData.value),
      createdAt: new Date().toISOString(),
      movedToStageAt: new Date().toISOString()
    };
    deals.push(newDeal);
    return { ...newDeal };
  },

  async update(id, dealData) {
    await delay();
    const index = deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) throw new Error("Deal not found");
    
    // If stage is changing, update movedToStageAt
    const updates = { ...dealData };
    if (dealData.stage && dealData.stage !== deals[index].stage) {
      updates.movedToStageAt = new Date().toISOString();
    }
    
    deals[index] = {
      ...deals[index],
      ...updates,
      Id: parseInt(id),
      contactId: dealData.contactId ? parseInt(dealData.contactId) : deals[index].contactId,
      value: dealData.value ? parseFloat(dealData.value) : deals[index].value
    };
    return { ...deals[index] };
  },

  async delete(id) {
    await delay();
    const index = deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) throw new Error("Deal not found");
    
    deals.splice(index, 1);
    return true;
  }
};