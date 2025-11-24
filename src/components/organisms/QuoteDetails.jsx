import React from 'react';
import { format, parseISO, isAfter } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import { quotesService } from '@/services/api/quotesService';
import { cn } from '@/utils/cn';

export default function QuoteDetails({ quote, onEdit, onClose }) {
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return isAfter(new Date(), parseISO(expiryDate));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return format(parseISO(dateString), 'MMMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-secondary-900 mb-1">
            {quote.title_c || quote.Name}
          </h2>
          <p className="text-secondary-600">
            Quote: {quote.Name}
          </p>
          {quote.description_c && (
            <p className="text-secondary-600 mt-2">
              {quote.description_c}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={quotesService.getStatusVariant(quote.status_c)}>
            {quote.status_c}
          </Badge>
          {quote.expiresOn_c && isExpired(quote.expiresOn_c) && (
            <Badge variant="error">
              <ApperIcon name="AlertTriangle" size={12} className="mr-1" />
              Expired
            </Badge>
          )}
        </div>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="text-sm font-medium text-secondary-700 mb-2">Company</h3>
          <div className="flex items-center text-secondary-900">
            <ApperIcon name="Building2" size={16} className="mr-2 text-secondary-500" />
            {quote.companyId_c?.Name || 'Not specified'}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-secondary-700 mb-2">Contact</h3>
          <div className="flex items-center text-secondary-900">
            <ApperIcon name="User" size={16} className="mr-2 text-secondary-500" />
            {quote.contactId_c?.Name || 'Not specified'}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-secondary-700 mb-2">Deal</h3>
          <div className="flex items-center text-secondary-900">
            <ApperIcon name="GitBranch" size={16} className="mr-2 text-secondary-500" />
            {quote.dealId_c?.Name || 'Not specified'}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-secondary-700 mb-2">Quote Date</h3>
          <div className="flex items-center text-secondary-900">
            <ApperIcon name="Calendar" size={16} className="mr-2 text-secondary-500" />
            {formatDate(quote.quoteDate_c)}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-secondary-700 mb-2">Expires On</h3>
          <div className={cn(
            "flex items-center",
            isExpired(quote.expiresOn_c) ? "text-error-500" : "text-secondary-900"
          )}>
            <ApperIcon name="Clock" size={16} className="mr-2 text-secondary-500" />
            {formatDate(quote.expiresOn_c)}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-secondary-700 mb-2">Delivery Method</h3>
          <div className="flex items-center text-secondary-900">
            <ApperIcon name="Send" size={16} className="mr-2 text-secondary-500" />
            {quote.deliveryMethod_c || 'Not specified'}
          </div>
        </div>
      </div>

      {/* Amount */}
      {quote.amount_c && (
        <div className="bg-primary-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-primary-700 mb-2">Quote Amount</h3>
          <div className="text-2xl font-bold text-primary-600">
            {quotesService.formatAmount(quote.amount_c)}
          </div>
        </div>
      )}

      {/* Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Address */}
        <div className="bg-secondary-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-secondary-900 mb-3">
            <ApperIcon name="CreditCard" size={18} className="inline mr-2" />
            Billing Address
          </h3>
          {quote.billToName_c || quote.billingStreet_c ? (
            <div className="space-y-1 text-secondary-700">
              {quote.billToName_c && (
                <div className="font-medium">{quote.billToName_c}</div>
              )}
              {quote.billingStreet_c && <div>{quote.billingStreet_c}</div>}
              <div>
                {[quote.billingCity_c, quote.billingState_c, quote.billingPincode_c]
                  .filter(Boolean)
                  .join(', ')}
              </div>
              {quote.billingCountry_c && <div>{quote.billingCountry_c}</div>}
            </div>
          ) : (
            <div className="text-secondary-500 italic">No billing address provided</div>
          )}
        </div>

        {/* Shipping Address */}
        <div className="bg-secondary-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-secondary-900 mb-3">
            <ApperIcon name="Truck" size={18} className="inline mr-2" />
            Shipping Address
          </h3>
          {quote.shipToName_c || quote.shippingStreet_c ? (
            <div className="space-y-1 text-secondary-700">
              {quote.shipToName_c && (
                <div className="font-medium">{quote.shipToName_c}</div>
              )}
              {quote.shippingStreet_c && <div>{quote.shippingStreet_c}</div>}
              <div>
                {[quote.shippingCity_c, quote.shippingState_c, quote.shippingPincode_c]
                  .filter(Boolean)
                  .join(', ')}
              </div>
              {quote.shippingCountry_c && <div>{quote.shippingCountry_c}</div>}
            </div>
          ) : (
            <div className="text-secondary-500 italic">No shipping address provided</div>
          )}
        </div>
      </div>

      {/* Tags */}
      {quote.Tags && (
        <div>
          <h3 className="text-sm font-medium text-secondary-700 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {quote.Tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="bg-secondary-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-secondary-700 mb-3">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-secondary-600">Created:</span>
            <span className="ml-2 text-secondary-900">
              {formatDate(quote.CreatedOn)}
            </span>
          </div>
          <div>
            <span className="text-secondary-600">Modified:</span>
            <span className="ml-2 text-secondary-900">
              {formatDate(quote.ModifiedOn)}
            </span>
          </div>
          {quote.Owner && (
            <div className="md:col-span-2">
              <span className="text-secondary-600">Owner:</span>
              <span className="ml-2 text-secondary-900">
                {quote.Owner.Name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-secondary-200">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onEdit}>
          <ApperIcon name="Edit" size={16} className="mr-2" />
          Edit Quote
        </Button>
      </div>
    </div>
  );
}