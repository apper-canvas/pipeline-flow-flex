import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Modal from '@/components/atoms/Modal';
import Card from '@/components/atoms/Card';
import SearchBar from '@/components/molecules/SearchBar';
import SalesOrderForm from '@/components/molecules/SalesOrderForm';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { salesOrdersService } from '@/services/api/salesOrdersService';
import { cn } from '@/utils/cn';

const SalesOrders = () => {
  // State management
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recordsPerPage = 20;

  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Returned', label: 'Returned' }
  ];

  // Load sales orders
  useEffect(() => {
    loadSalesOrders();
  }, [currentPage, searchTerm, statusFilter]);

  const loadSalesOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * recordsPerPage;
      const response = await salesOrdersService.getAll(searchTerm, statusFilter, recordsPerPage, offset);
      setSalesOrders(response.data || []);
      setTotalRecords(response.total || 0);
    } catch (error) {
      console.error('Error loading sales orders:', error);
      setError('Failed to load sales orders. Please try again.');
      setSalesOrders([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCreateSalesOrder = () => {
    setSelectedSalesOrder(null);
    setIsCreateModalOpen(true);
  };

  const handleEditSalesOrder = (salesOrder) => {
    setSelectedSalesOrder(salesOrder);
    setIsEditModalOpen(true);
  };

  const handleSubmitSalesOrder = async (salesOrderData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (selectedSalesOrder) {
        // Update existing sales order
        result = await salesOrdersService.update(selectedSalesOrder.Id, salesOrderData);
      } else {
        // Create new sales order
        result = await salesOrdersService.create(salesOrderData);
      }

      if (result) {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedSalesOrder(null);
        await loadSalesOrders(); // Refresh the list
      }
    } catch (error) {
      console.error('Error submitting sales order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSalesOrder = async (salesOrder) => {
    if (window.confirm(`Are you sure you want to delete "${salesOrder.Name || salesOrder.title_c}"?`)) {
      const success = await salesOrdersService.delete(salesOrder.Id);
      if (success) {
        await loadSalesOrders(); // Refresh the list
      }
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedSalesOrder(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '$0.00';
    return salesOrdersService.formatAmount(amount);
  };

  const getStatusBadgeVariant = (status) => {
    return salesOrdersService.getStatusVariant(status);
  };

  const getPaymentMethodIcon = (method) => {
    return salesOrdersService.getPaymentMethodIcon(method);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startRecord = (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  // Render loading state
  if (loading && currentPage === 1) {
    return <Loading type="page" />;
  }

  // Render error state
  if (error && salesOrders.length === 0) {
    return (
      <Error
        message={error}
        onRetry={loadSalesOrders}
        showRetry={true}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Orders</h1>
        <p className="text-gray-600">Manage your sales orders and track order fulfillment</p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search sales orders..."
              className="w-full"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white min-w-[150px]"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button
          onClick={handleCreateSalesOrder}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          New Sales Order
        </Button>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="mb-4 text-sm text-gray-600">
          {totalRecords === 0 ? (
            'No sales orders found'
          ) : (
            `Showing ${startRecord} to ${endRecord} of ${totalRecords} sales orders`
          )}
        </div>
      )}

      {/* Sales Orders Grid */}
      {salesOrders.length === 0 && !loading ? (
        <Empty
          title="No Sales Orders Found"
          description={searchTerm ? "No sales orders match your search criteria." : "Get started by creating your first sales order."}
          icon="ShoppingCart"
          action={
            <Button onClick={handleCreateSalesOrder} className="mt-4">
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Create Sales Order
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6">
          {salesOrders.map(salesOrder => (
            <Card key={salesOrder.Id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {salesOrder.title_c || salesOrder.Name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <ApperIcon name="Calendar" size={14} />
                          {formatDate(salesOrder.order_date_c)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ApperIcon name="DollarSign" size={14} />
                          {formatAmount(salesOrder.total_amount_c)}
                        </span>
                        {salesOrder.payment_method_c && (
                          <span className="flex items-center gap-1">
                            <ApperIcon name={getPaymentMethodIcon(salesOrder.payment_method_c)} size={14} />
                            {salesOrder.payment_method_c}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(salesOrder.status_c)}>
                        {salesOrder.status_c}
                      </Badge>
                    </div>
                  </div>

                  {/* Related Records */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {salesOrder.contactId_c && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ApperIcon name="User" size={14} />
                        <span className="truncate">{salesOrder.contactId_c.Name}</span>
                      </div>
                    )}
                    {salesOrder.companyId_c && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ApperIcon name="Building" size={14} />
                        <span className="truncate">{salesOrder.companyId_c.Name}</span>
                      </div>
                    )}
                    {salesOrder.dealId_c && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ApperIcon name="GitBranch" size={14} />
                        <span className="truncate">{salesOrder.dealId_c.Name}</span>
                      </div>
                    )}
                    {salesOrder.quoteId_c && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ApperIcon name="FileText" size={14} />
                        <span className="truncate">{salesOrder.quoteId_c.Name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditSalesOrder(salesOrder)}
                    className="flex items-center gap-1"
                  >
                    <ApperIcon name="Edit" size={14} />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteSalesOrder(salesOrder)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <ApperIcon name="Trash2" size={14} />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ApperIcon name="ChevronLeft" size={16} />
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ApperIcon name="ChevronRight" size={16} />
          </Button>
        </div>
      )}

      {/* Create Sales Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title="Create New Sales Order"
        size="xl"
      >
        <SalesOrderForm
          salesOrder={null}
          onSubmit={handleSubmitSalesOrder}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Sales Order Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        title="Edit Sales Order"
        size="xl"
      >
        <SalesOrderForm
          salesOrder={selectedSalesOrder}
          onSubmit={handleSubmitSalesOrder}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default SalesOrders;