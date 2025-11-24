import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import LogoutButton from "@/components/atoms/LogoutButton";
import { cn } from "@/utils/cn";

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Pipeline', href: '/pipeline', icon: 'GitBranch' },
    { name: 'Contacts', href: '/contacts', icon: 'Users' },
    { name: 'Companies', href: '/companies', icon: 'Building' },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl text-secondary-900">PipelineFlow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary-50 text-primary-600"
                    : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                )}
              >
                <ApperIcon name={item.icon} size={16} />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <LogoutButton />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
            >
              <ApperIcon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-600"
                      : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ApperIcon name={item.icon} size={16} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
</div>
    </header>
  );
}

export default Header;