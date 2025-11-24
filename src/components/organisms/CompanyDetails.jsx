import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Modal from '@/components/atoms/Modal';
import CompanyForm from '@/components/molecules/CompanyForm';
import { companiesService } from '@/services/api/companiesService';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { toast } from 'react-toastify';

function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load company data
  const loadCompanyData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await companiesService.getById(parseInt(id));
      
      if (result) {
        setCompany(result);
      } else {
        setError('Company not found');
      }
    } catch (err) {
      console.error('Error loading company:', err);
      setError('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (id) {
      loadCompanyData();
    }
  }, [id]);

  // Handle edit company
  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  // Handle form submission for update
  const handleSubmitCompany = async (companyData) => {
    try {
      const result = await companiesService.update(company.Id, companyData);
      
      if (result) {
        setCompany({ ...company, ...result });
        setIsEditModalOpen(false);
        toast.success('Company updated successfully');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
    }
  };

  // Handle company deletion
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${company.Name}"?`)) {
      return;
    }

    const success = await companiesService.delete(company.Id);
    if (success) {
      toast.success('Company deleted successfully');
      navigate('/companies');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    if (!num) return 'Not specified';
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Render loading state
  if (loading) {
    return <Loading type="page" />;
  }

  // Render error state
  if (error || !company) {
    return (
      <div className="p-6">
        <Error
          message={error || 'Company not found'}
          onRetry={loadCompanyData}
          showRetry={true}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/companies')}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">{company.Name}</h1>
            <p className="text-secondary-600">Company Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleEdit}
          >
            <ApperIcon name="Edit" size={16} />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-error-600 border-error-200 hover:bg-error-50"
          >
            <ApperIcon name="Trash2" size={16} />
            Delete
          </Button>
        </div>
      </div>

      {/* Company Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">Company Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary-600">Company Name</label>
                  <p className="mt-1 text-secondary-900">{company.Name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600">Industry</label>
                  <p className="mt-1">
                    {company.industry_c ? (
                      <Badge variant="outline">{company.industry_c}</Badge>
                    ) : (
                      <span className="text-secondary-400">Not specified</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600">Revenue</label>
                  <p className="mt-1 text-secondary-900">{formatCurrency(company.revenue_c)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600">Employees</label>
                  <p className="mt-1 text-secondary-900">{formatNumber(company.employees_c)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600">Phone</label>
                  <p className="mt-1 text-secondary-900">
                    {company.phone_c ? (
                      <a href={`tel:${company.phone_c}`} className="text-primary-600 hover:text-primary-700">
                        {company.phone_c}
                      </a>
                    ) : (
                      <span className="text-secondary-400">Not provided</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary-600">Website</label>
                  <p className="mt-1 text-secondary-900">
                    {company.website_c ? (
                      <a 
                        href={company.website_c}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 break-all"
                      >
                        {company.website_c}
                      </a>
                    ) : (
                      <span className="text-secondary-400">Not provided</span>
                    )}
                  </p>
                </div>
              </div>
              
              {company.description_c && (
                <div className="pt-4">
                  <label className="text-sm font-medium text-secondary-600">Description</label>
                  <p className="mt-1 text-secondary-900 whitespace-pre-wrap">{company.description_c}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          {company.Tags && (
            <div className="bg-white rounded-lg border border-secondary-200 p-6">
              <h3 className="text-sm font-medium text-secondary-600 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {company.Tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Record Information */}
          <div className="bg-white rounded-lg border border-secondary-200 p-6">
            <h3 className="text-sm font-medium text-secondary-600 mb-3">Record Information</h3>
            <div className="space-y-3">
{company.CreatedOn && (
                <div>
                  <label className="text-xs text-secondary-500">Created</label>
                  <p className="text-sm text-secondary-900">
                    {format(new Date(company.CreatedOn), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {formatDistanceToNow(new Date(company.CreatedOn), { addSuffix: true })}
                  </p>
                  {company.CreatedBy && (
                    <p className="text-xs text-secondary-600 mt-1">
                      by {company.CreatedBy.Name || 'Unknown User'}
                    </p>
                  )}
                </div>
              )}
              {company.ModifiedOn && (
                <div>
                  <label className="text-xs text-secondary-500">Last Modified</label>
                  <p className="text-sm text-secondary-900">
                    {format(new Date(company.ModifiedOn), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {formatDistanceToNow(new Date(company.ModifiedOn), { addSuffix: true })}
                  </p>
                  {company.ModifiedBy && (
                    <p className="text-xs text-secondary-600 mt-1">
                      by {company.ModifiedBy.Name || 'Unknown User'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Company Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Company"
        size="lg"
      >
        <CompanyForm
          company={company}
          onSubmit={handleSubmitCompany}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default CompanyDetails;