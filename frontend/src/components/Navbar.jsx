import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b-0 border-x-0 rounded-none bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-primary-100 p-2 rounded-xl text-primary-600">
              <Leaf size={24} strokeWidth={2.5} />
            </div>
            <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
              AgriMarket Predictor
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            <a href="#" className="hidden sm:block text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              About Models
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
