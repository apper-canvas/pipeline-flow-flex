import React from 'react';
import { useAuth } from '@/layouts/Root';
import { useSelector } from 'react-redux';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const LogoutButton = ({ mobile = false }) => {
  const { logout } = useAuth();
  const { user, isAuthenticated } = useSelector(state => state.user);

  if (!isAuthenticated || !user) {
    return null;
  }

  if (mobile) {
    return (
      <button
        onClick={logout}
        className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 transition-colors duration-150"
      >
        <ApperIcon name="LogOut" size={16} />
        <span>Sign out</span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={logout}
      className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900"
    >
      <ApperIcon name="LogOut" size={16} />
      <span className="hidden sm:inline">Sign out</span>
    </Button>
  );
};

export default LogoutButton;