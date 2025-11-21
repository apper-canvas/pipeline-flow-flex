import React from 'react';
import { Link } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <ApperIcon name="AlertTriangle" size={64} className="text-warning-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-secondary-700 mb-4">Page Not Found</h2>
          <p className="text-secondary-600 mb-8">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full">
              <ApperIcon name="Home" size={16} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex space-x-4">
            <Link to="/contacts" className="flex-1">
              <Button variant="outline" className="w-full">
                <ApperIcon name="Users" size={16} className="mr-2" />
                Contacts
              </Button>
            </Link>
            
            <Link to="/pipeline" className="flex-1">
              <Button variant="outline" className="w-full">
                <ApperIcon name="BarChart3" size={16} className="mr-2" />
                Pipeline
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;