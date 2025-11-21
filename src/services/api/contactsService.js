import contactsData from "@/services/mockData/contacts.json";

let contacts = [...contactsData];

const delay = () => new Promise(resolve => setTimeout(resolve, 300));

export const contactsService = {
  async getAll() {
    await delay();
    return [...contacts];
  },

  async getById(id) {
    await delay();
    const contact = contacts.find(c => c.Id === parseInt(id));
    return contact ? { ...contact } : null;
  },

  async create(contactData) {
    await delay();
    const newContact = {
      ...contactData,
      Id: Math.max(...contacts.map(c => c.Id)) + 1,
      createdAt: new Date().toISOString(),
      lastContactedAt: new Date().toISOString()
    };
    contacts.push(newContact);
    return { ...newContact };
  },

  async update(id, contactData) {
    await delay();
    const index = contacts.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error("Contact not found");
    
    contacts[index] = {
      ...contacts[index],
      ...contactData,
      Id: parseInt(id) // Ensure ID stays as integer
    };
    return { ...contacts[index] };
  },

  async delete(id) {
    await delay();
    const index = contacts.findIndex(c => c.Id === parseInt(id));
    if (index === -1) throw new Error("Contact not found");
    
    contacts.splice(index, 1);
    return true;
  }
};