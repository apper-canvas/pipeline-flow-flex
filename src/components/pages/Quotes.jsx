import React, { useState, useEffect } from 'react';
import { format, isAfter, parseISO } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';
import Modal from '@/components/atoms/Modal';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import QuoteForm from '@/components/molecules/QuoteForm';
import QuoteDetails from '@/components/organisms/QuoteDetails';
import SearchBar from '@/components/molecules/SearchBar';
import { quotesService } from '@/services/api/quotesService';
import { toast } from 'react-toastify';
import { cn } from '@/utils/cn';

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    loadQuotes();
  }, [searchTerm, statusFilter]);

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quotesService.getAll(searchTerm, statusFilter);
      setQuotes(data);
    } catch (err) {
      setError('Failed to load quotes');
      console.error('Error loading quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (quoteData) => {
    const result = await quotesService.create(quoteData);
    if (result) {
      setShowCreateModal(false);
      await loadQuotes();
    }
  };

  const handleEdit = async (quoteData) => {
    const result = await quotesService.update(selectedQuote.Id, quoteData);
    if (result) {
      setShowEditModal(false);
      setSelectedQuote(null);
      await loadQuotes();
    }
  };

  const handleDelete = async (quote) => {
    if (confirm(`Are you sure you want to delete "${quote.Name}"?`)) {
      const success = await quotesService.delete(quote.Id);
      if (success) {
        await loadQuotes();
      }
    }
  };

  const handleViewDetails = async (quote) => {
    setLoading(true);
    const fullQuote = await quotesService.getById(quote.Id);
    if (fullQuote) {
      setSelectedQuote(fullQuote);
      setShowDetailsModal(true);
    }
    setLoading(false);
  };

  const openEditModal = async (quote) => {
    setLoading(true);
    const fullQuote = await quotesService.getById(quote.Id);
    if (fullQuote) {
      setSelectedQuote(fullQuote);
      setShowEditModal(true);
    }
    setLoading(false);
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return isAfter(new Date(), parseISO(expiryDate));
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Expired', label: 'Expired' }
  ];

  if (loading && quotes.length === 0) {
    return <Loading type="page" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadQuotes} showRetry />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Quotes</h1>
          <p className="text-secondary-600">
            Manage your quotes and proposals
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="shrink-0">
          <ApperIcon name="Plus" size={16} />
          New Quote
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search quotes..."
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex rounded-lg border border-secondary-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                viewMode === 'grid'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-secondary-700 hover:bg-secondary-50'
              )}
            >
              <ApperIcon name="Grid3X3" size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors border-l border-secondary-300',
                viewMode === 'table'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-secondary-700 hover:bg-secondary-50'
              )}
            >
              <ApperIcon name="List" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {quotes.length === 0 ? (
        <Empty
          icon="FileText"
          title="No quotes found"
          description="Create your first quote to get started"
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              <ApperIcon name="Plus" size={16} />
              Create Quote
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((quote) => (
            <Card key={quote.Id} className="hover:shadow-card-hover transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-secondary-900 truncate">
                      {quote.title_c || quote.Name}
                    </h3>
                    <p className="text-sm text-secondary-600 truncate">
                      {quote.Name}
                    </p>
                  </div>
                  <Badge variant={quotesService.getStatusVariant(quote.status_c)}>
                    {quote.status_c}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-secondary-600">
                    <ApperIcon name="Building2" size={14} className="mr-2" />
                    <span className="truncate">
                      {quote.companyId_c?.Name || 'No Company'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600">
                    <ApperIcon name="User" size={14} className="mr-2" />
                    <span className="truncate">
                      {quote.contactId_c?.Name || 'No Contact'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-secondary-600">
                    <ApperIcon name="Calendar" size={14} className="mr-2" />
                    <span>
                      {quote.quoteDate_c 
                        ? format(parseISO(quote.quoteDate_c), 'MMM d, yyyy')
                        : 'No Date'
                      }
                    </span>
                  </div>
                </div>

                {quote.amount_c && (
                  <div className="mb-4">
                    <span className="text-lg font-semibold text-primary-600">
                      {quotesService.formatAmount(quote.amount_c)}
                    </span>
                  </div>
                )}

                {quote.expiresOn_c && isExpired(quote.expiresOn_c) && (
                  <div className="mb-4">
                    <Badge variant="error">
                      <ApperIcon name="AlertTriangle" size={12} className="mr-1" />
                      Expired
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(quote)}
                  >
                    <ApperIcon name="Eye" size={14} />
                    View
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(quote)}
                    >
                      <ApperIcon name="Edit" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(quote)}
                    >
                      <ApperIcon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">
                    Quote
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-secondary-700">
                    Amount
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-secondary-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.Id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-secondary-900">
                          {quote.title_c || quote.Name}
                        </div>
                        <div className="text-sm text-secondary-600">
                          {quote.Name}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-secondary-900">
                        {quote.companyId_c?.Name || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-secondary-900">
                        {quote.contactId_c?.Name || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={quotesService.getStatusVariant(quote.status_c)}>
                        {quote.status_c}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-secondary-900">
                        {quote.quoteDate_c 
                          ? format(parseISO(quote.quoteDate_c), 'MMM d, yyyy')
                          : '-'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-primary-600">
                        {quote.amount_c ? quotesService.formatAmount(quote.amount_c) : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(quote)}
                        >
                          <ApperIcon name="Eye" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(quote)}
                        >
                          <ApperIcon name="Edit" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(quote)}
                        >
                          <ApperIcon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Quote"
        size="xl"
      >
        <QuoteForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedQuote(null);
        }}
        title="Edit Quote"
        size="xl"
      >
        {selectedQuote && (
          <QuoteForm
            quote={selectedQuote}
            onSubmit={handleEdit}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedQuote(null);
            }}
          />
        )}
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedQuote(null);
        }}
        title="Quote Details"
        size="xl"
      >
        {selectedQuote && (
          <QuoteDetails
            quote={selectedQuote}
            onEdit={() => {
              setShowDetailsModal(false);
              setShowEditModal(true);
            }}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedQuote(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}