import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";

const ContactsTable = ({ 
  contacts, 
  deals, 
  onEdit, 
  onDelete, 
  onViewDetails,
  sortField,
  sortDirection,
  onSort 
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const getContactDeals = (contactId) => {
    return deals.filter(deal => deal.contactId === contactId);
  };

  const getStageVariant = (stage) => {
    const variants = {
      "lead": "lead",
      "qualified": "qualified", 
      "proposal": "proposal",
      "closed-won": "won",
      "closed-lost": "lost"
    };
    return variants[stage] || "default";
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "ArrowUpDown";
    return sortDirection === "asc" ? "ArrowUp" : "ArrowDown";
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Never";
    }
  };

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-secondary-200 p-8 text-center">
        <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ApperIcon name="Users" size={32} className="text-secondary-400" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">No contacts found</h3>
        <p className="text-secondary-600">Start building relationships by adding your first contact.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-secondary-50 border-b border-secondary-200 text-sm font-medium text-secondary-700">
        <div 
          className="col-span-3 flex items-center cursor-pointer hover:text-secondary-900"
          onClick={() => onSort("name")}
        >
          <span>Contact</span>
          <ApperIcon name={getSortIcon("name")} size={14} className="ml-1" />
        </div>
        <div 
          className="col-span-2 hidden sm:flex items-center cursor-pointer hover:text-secondary-900"
          onClick={() => onSort("company")}
        >
          <span>Company</span>
          <ApperIcon name={getSortIcon("company")} size={14} className="ml-1" />
        </div>
        <div className="col-span-2 hidden md:block">Deals</div>
        <div 
          className="col-span-2 hidden lg:flex items-center cursor-pointer hover:text-secondary-900"
          onClick={() => onSort("lastContactedAt")}
        >
          <span>Last Contact</span>
          <ApperIcon name={getSortIcon("lastContactedAt")} size={14} className="ml-1" />
        </div>
        <div className="col-span-3 sm:col-span-2 lg:col-span-1 text-right">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-secondary-200">
        {contacts.map((contact) => {
          const contactDeals = getContactDeals(contact.Id);
          const activeDeals = contactDeals.filter(deal => 
            !["closed-won", "closed-lost"].includes(deal.stage)
          );
          
          return (
            <div
              key={contact.Id}
              className={cn(
                "grid grid-cols-12 gap-4 p-4 transition-colors duration-150 hover:bg-secondary-50 cursor-pointer",
                hoveredRow === contact.Id && "bg-secondary-50"
              )}
              onMouseEnter={() => setHoveredRow(contact.Id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => onViewDetails(contact)}
            >
              {/* Contact Info */}
              <div className="col-span-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-secondary-900 truncate">
                      {contact.name}
                    </p>
                    <p className="text-sm text-secondary-600 truncate">
                      {contact.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Company */}
              <div className="col-span-2 hidden sm:flex items-center">
                <div>
                  <p className="font-medium text-secondary-900">{contact.company}</p>
                  {contact.phone && (
                    <p className="text-sm text-secondary-600">{contact.phone}</p>
                  )}
                </div>
              </div>

              {/* Deals */}
              <div className="col-span-2 hidden md:flex items-center">
                <div className="space-y-1">
                  {activeDeals.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {activeDeals.slice(0, 2).map((deal) => (
                        <Badge
                          key={deal.Id}
                          variant={getStageVariant(deal.stage)}
                          className="text-xs"
                        >
                          ${deal.value.toLocaleString()}
                        </Badge>
                      ))}
                      {activeDeals.length > 2 && (
                        <Badge variant="default" className="text-xs">
                          +{activeDeals.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-secondary-500">No active deals</span>
                  )}
                </div>
              </div>

              {/* Last Contact */}
              <div className="col-span-2 hidden lg:flex items-center">
                <span className="text-sm text-secondary-600">
                  {formatDate(contact.lastContactedAt)}
                </span>
              </div>

              {/* Actions */}
              <div 
                className="col-span-3 sm:col-span-2 lg:col-span-1 flex items-center justify-end space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(contact)}
                  className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                >
                  <ApperIcon name="Edit2" size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(contact)}
                  className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity text-error-600 hover:text-error-700"
                >
                  <ApperIcon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactsTable;