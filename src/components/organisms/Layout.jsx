import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/organisms/Header";

const Layout = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      {/* Main content with top padding for fixed header */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;