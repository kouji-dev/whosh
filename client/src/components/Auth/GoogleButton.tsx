'use client';
import React from 'react';

const GoogleButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="btn w-full bg-white border border-gray-300 text-gray-700 flex items-center justify-center gap-2"
  >
    <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
    Continue with Google
  </button>
);

export default GoogleButton; 