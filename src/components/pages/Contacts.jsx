import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Modal from "@/components/atoms/Modal";
import SearchBar from "@/components/molecules/SearchBar";
import ContactForm from "@/components/molecules/ContactForm";
import ContactsTable from "@/components/organisms/ContactsTable";
import ContactDetails from "@/components/organisms/ContactDetails";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { contactsService } from "@/services/api/contactsService";
import { dealsService } from "@/services/api/dealsService";
import { toast } from "react-toastify";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [contactsData, dealsData] = await Promise.all([
        contactsService.getAll(),
        dealsService.getAll()
      ]);
      
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load contacts data. Please try again.");
      console.error("Contacts data loading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort contacts
  useEffect(() => {
    let filtered = contacts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "company":
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case "lastContactedAt":
          aValue = new Date(a.lastContactedAt);
          bValue = new Date(b.lastContactedAt);
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCreateContact = () => {
    setSelectedContact(null);
    setShowContactModal(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  const handleViewDetails = (contact) => {
    setSelectedContact(contact);
    setShowDetailsModal(true);
  };

  const handleSubmitContact = async (contactData) => {
    setIsSubmitting(true);
    try {
      if (selectedContact) {
        const updatedContact = await contactsService.update(selectedContact.Id, contactData);
        setContacts(prev => prev.map(c => c.Id === selectedContact.Id ? updatedContact : c));
        toast.success("Contact updated successfully!");
      } else {
        const newContact = await contactsService.create(contactData);
        setContacts(prev => [...prev, newContact]);
        toast.success("Contact created successfully!");
      }
      setShowContactModal(false);
    } catch (error) {
      toast.error(selectedContact ? "Failed to update contact" : "Failed to create contact");
      console.error("Contact operation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (contact) => {
    if (!window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      return;
    }

    try {
      await contactsService.delete(contact.Id);
      setContacts(prev => prev.filter(c => c.Id !== contact.Id));
      toast.success("Contact deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete contact");
      console.error("Contact deletion failed:", error);
    }
  };

  if (loading) {
    return <Loading type="table" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Contacts</h1>
          <p className="text-secondary-600">
            Manage your customer relationships and track interactions
          </p>
        </div>
        <Button onClick={handleCreateContact} variant="primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Empty
          title="No contacts yet"
          description="Start building your network by adding your first contact."
          icon="Users"
          actionLabel="Add Your First Contact"
          onAction={handleCreateContact}
        />
      ) : (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts by name, email, or company..."
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-secondary-600">
              {searchTerm ? (
                <>
                  Showing {filteredContacts.length} of {contacts.length} contacts
                  {searchTerm && ` for "${searchTerm}"`}
                </>
              ) : (
                `${contacts.length} total contacts`
              )}
            </p>
          </div>

          {/* Contacts Table */}
          <ContactsTable
            contacts={filteredContacts}
            deals={deals}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onViewDetails={handleViewDetails}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </>
      )}

      {/* Contact Form Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={selectedContact ? "Edit Contact" : "Add New Contact"}
        size="lg"
      >
        <ContactForm
          contact={selectedContact}
          onSubmit={handleSubmitContact}
          onCancel={() => setShowContactModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Contact Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Contact Details"
        size="xl"
      >
        {selectedContact && (
          <ContactDetails
            contact={selectedContact}
            onEdit={(contact) => {
              setShowDetailsModal(false);
              handleEditContact(contact);
            }}
            onClose={() => setShowDetailsModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Contacts;