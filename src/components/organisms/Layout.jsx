import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/organisms/Header";

const Layout = () => {
  // Shared application state that can be passed to child routes
  const [globalState, setGlobalState] = useState({
    // Add any shared state properties here
    sidebarCollapsed: false,
    theme: 'light'
  });

  // Shared methods that can be passed to child routes
  const sharedMethods = {
    toggleSidebar: () => setGlobalState(prev => ({ 
      ...prev, 
      sidebarCollapsed: !prev.sidebarCollapsed 
    })),
    setTheme: (theme) => setGlobalState(prev => ({ 
      ...prev, 
      theme 
    })),
    // Add other shared methods here as needed
  };

  // Outlet context object with shared state and methods
  const outletContext = {
    globalState,
    setGlobalState,
    ...sharedMethods
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      {/* Main content with top padding for fixed header */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Outlet context={outletContext} />
        </div>
      </main>
    </div>
  );
};

export default Layout;