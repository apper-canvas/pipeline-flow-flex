import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: "Home" },
    { path: "/contacts", label: "Contacts", icon: "Users" },
    { path: "/pipeline", label: "Pipeline", icon: "GitBranch" }
  ];


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-secondary-200 h-16">
        <div className="flex items-center justify-between px-4 h-full max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="Zap" size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-secondary-900">PipelineFlow</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-primary-50 text-primary-700 border-b-2 border-primary-500"
                      : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                  }`}
                >
                  <ApperIcon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
            >
              <ApperIcon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-secondary-200 py-2">
            <nav className="flex flex-col space-y-1 px-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                    }`}
                  >
                    <ApperIcon name={item.icon} size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
            </nav>
          </div>
        )}
      </header>

      {/* Fixed bottom quick add button for mobile */}

      {/* Quick Deal Modal */}
    </>
  );
};

export default Header;