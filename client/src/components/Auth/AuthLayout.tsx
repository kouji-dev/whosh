'use client';
import React from 'react';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-beige font-sans">
    <div className="flex flex-col md:flex-row items-center gap-12">
      <div className="hidden md:block">
        {/* Illustration or logo here */}
        <img src="/whosh-illustration.svg" alt="Whosh" className="w-80" />
      </div>
      {children}
    </div>
  </div>
);

export default AuthLayout; 