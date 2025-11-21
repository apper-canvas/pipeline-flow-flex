import activitiesData from "@/services/mockData/activities.json";

let activities = [...activitiesData];

const delay = () => new Promise(resolve => setTimeout(resolve, 200));

export const activitiesService = {
  async getAll() {
    await delay();
    return [...activities];
  },

  async getByContactId(contactId) {
    await delay();
    return activities
      .filter(a => a.contactId === parseInt(contactId))
      .map(a => ({ ...a }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async create(activityData) {
    await delay();
    const newActivity = {
      ...activityData,
      Id: Math.max(...activities.map(a => a.Id)) + 1,
      contactId: parseInt(activityData.contactId),
      timestamp: new Date().toISOString()
    };
    activities.push(newActivity);
    return { ...newActivity };
  },

  async update(id, activityData) {
    await delay();
    const index = activities.findIndex(a => a.Id === parseInt(id));
    if (index === -1) throw new Error("Activity not found");
    
    activities[index] = {
      ...activities[index],
      ...activityData,
      Id: parseInt(id),
      contactId: activityData.contactId ? parseInt(activityData.contactId) : activities[index].contactId
    };
    return { ...activities[index] };
  },

  async delete(id) {
    await delay();
    const index = activities.findIndex(a => a.Id === parseInt(id));
    if (index === -1) throw new Error("Activity not found");
    
    activities.splice(index, 1);
    return true;
  }
};