import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import Modal from '@/components/atoms/Modal';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import CompanyForm from '@/components/molecules/CompanyForm';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { companiesService } from '@/services/api/companiesService';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';

function Companies() {
  // State management
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
const navigate = useNavigate();
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sortField, setSortField] = useState('ModifiedOn');
  const [sortDirection, setSortDirection] = useState('DESC');

  // Load companies data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await companiesService.getAll({
        sortField,
        sortDirection,
        limit: 100
      });
      
      setCompanies(result.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading companies:', err);
      setError('Failed to load companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [sortField, sortDirection]);

  // Filter companies based on search and industry filter
  useEffect(() => {
    let filtered = [...companies];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(company => 
        company.Name?.toLowerCase().includes(search) ||
        company.industry_c?.toLowerCase().includes(search) ||
        company.Tags?.toLowerCase().includes(search)
      );
    }

    // Apply industry filter
    if (industryFilter && industryFilter !== 'all') {
      filtered = filtered.filter(company => 
        company.industry_c === industryFilter
      );
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, industryFilter]);

  // Get unique industries for filter
  const industries = [...new Set(companies.map(c => c.industry_c).filter(Boolean))];

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDirection('ASC');
    }
  };

  // Handle company creation
  const handleCreateCompany = () => {
    setSelectedCompany(null);
    setIsCreateModalOpen(true);
  };

  // Handle company editing
// Handle viewing company details
  const handleViewCompany = (company) => {
    navigate(`/companies/${company.Id}`);
  };

  // Handle company editing
  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setIsEditModalOpen(true);
  };
  // Handle form submission for create/update
  const handleSubmitCompany = async (companyData) => {
    try {
      let result;
      
      if (selectedCompany) {
        // Update existing company
        result = await companiesService.update(selectedCompany.Id, companyData);
      } else {
        // Create new company
        result = await companiesService.create(companyData);
      }

      if (result) {
        await loadData(); // Reload data
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedCompany(null);
      }
    } catch (error) {
      console.error('Error submitting company:', error);
      toast.error('Failed to save company');
    }
  };

  // Handle company deletion
  const handleDeleteCompany = async (company) => {
    if (!window.confirm(`Are you sure you want to delete "${company.Name}"?`)) {
      return;
    }

    const success = await companiesService.delete(company.Id);
    if (success) {
      await loadData(); // Reload data
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    if (!num) return '-';
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ApperIcon name="ArrowUpDown" size={14} className="text-secondary-400" />;
    }
    return sortDirection === 'ASC' ? 
      <ApperIcon name="ArrowUp" size={14} className="text-primary-600" /> :
      <ApperIcon name="ArrowDown" size={14} className="text-primary-600" />;
  };

  // Render loading state
  if (loading) {
    return <Loading type="table" />;
  }

  // Render error state
  if (error) {
    return (
      <Error
        message={error}
        onRetry={loadData}
        showRetry={true}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Companies</h1>
          <p className="text-secondary-600 mt-1">
            Manage your company database and relationships
          </p>
        </div>
        <Button onClick={handleCreateCompany}>
          <ApperIcon name="Plus" size={16} />
          Add Company
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search companies by name, industry, or tags..."
          />
        </div>
        
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Industries</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-secondary-200">
          <div className="text-2xl font-bold text-secondary-900">{companies.length}</div>
          <div className="text-sm text-secondary-600">Total Companies</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-secondary-200">
          <div className="text-2xl font-bold text-secondary-900">{filteredCompanies.length}</div>
          <div className="text-sm text-secondary-600">Filtered Results</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-secondary-200">
          <div className="text-2xl font-bold text-secondary-900">{industries.length}</div>
          <div className="text-sm text-secondary-600">Industries</div>
        </div>
      </div>

      {/* Companies Table */}
      {filteredCompanies.length === 0 ? (
        <Empty
          title={searchTerm || industryFilter ? "No companies found" : "No companies yet"}
          description={
            searchTerm || industryFilter ? 
              "Try adjusting your search or filter criteria." : 
              "Get started by adding your first company."
          }
          icon="Building"
          action={
            !searchTerm && !industryFilter ? (
              <Button onClick={handleCreateCompany}>
                <ApperIcon name="Plus" size={16} />
                Add First Company
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('Name')}
                      className="flex items-center gap-2 text-sm font-medium text-secondary-700 hover:text-secondary-900"
                    >
                      Company
                      {getSortIcon('Name')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('industry_c')}
                      className="flex items-center gap-2 text-sm font-medium text-secondary-700 hover:text-secondary-900"
                    >
                      Industry
                      {getSortIcon('industry_c')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('revenue_c')}
                      className="flex items-center gap-2 text-sm font-medium text-secondary-700 hover:text-secondary-900"
                    >
                      Revenue
                      {getSortIcon('revenue_c')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('employees_c')}
                      className="flex items-center gap-2 text-sm font-medium text-secondary-700 hover:text-secondary-900"
                    >
                      Employees
                      {getSortIcon('employees_c')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('ModifiedOn')}
                      className="flex items-center gap-2 text-sm font-medium text-secondary-700 hover:text-secondary-900"
                    >
                      Modified
                      {getSortIcon('ModifiedOn')}
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
{filteredCompanies.map((company) => (
<tr key={company.Id} className="hover:bg-secondary-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-secondary-900">
                          <button
                            onClick={() => handleViewCompany(company)}
                            className="text-left hover:text-primary-600 transition-colors"
                          >
                            {company.Name}
                          </button>
                        </div>
                        {company.Tags && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {company.Tags.split(',').slice(0, 2).map((tag, index) => (
                              <Badge key={index} size="sm" variant="secondary">
                                {tag.trim()}
                              </Badge>
                            ))}
                            {company.Tags.split(',').length > 2 && (
                              <Badge size="sm" variant="outline">
                                +{company.Tags.split(',').length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {company.industry_c ? (
                        <Badge variant="outline">
                          {company.industry_c}
                        </Badge>
                      ) : (
                        <span className="text-secondary-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-secondary-600">
                      {formatCurrency(company.revenue_c)}
                    </td>
                    <td className="py-3 px-4 text-secondary-600">
                      {formatNumber(company.employees_c)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {company.phone_c && (
                          <div className="text-secondary-600">{company.phone_c}</div>
                        )}
                        {company.website_c && (
                          <div>
                            <a 
                              href={company.website_c}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              Website
                            </a>
                          </div>
                        )}
                        {!company.phone_c && !company.website_c && (
                          <span className="text-secondary-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-600">
                      {company.ModifiedOn && formatDistanceToNow(new Date(company.ModifiedOn), { addSuffix: true })}
                    </td>
<td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCompany(company)}
                          title="View company details"
                        >
                          <ApperIcon name="Eye" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCompany(company)}
                          title="Edit company"
                        >
                          <ApperIcon name="Edit" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCompany(company)}
                          className="text-error-600 hover:text-error-700"
                          title="Delete company"
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
        </div>
      )}

      {/* Create Company Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Company"
        size="lg"
      >
        <CompanyForm
          onSubmit={handleSubmitCompany}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Company"
        size="lg"
      >
        <CompanyForm
          company={selectedCompany}
          onSubmit={handleSubmitCompany}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default Companies;