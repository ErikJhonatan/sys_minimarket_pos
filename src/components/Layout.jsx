import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-base-100 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default Layout;
