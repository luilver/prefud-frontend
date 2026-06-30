import React from 'react';
import { Link } from 'react-router-dom';
import { LogoutButton } from './LogoutButton';

export const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side - Logo/Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="font-logo text-2xl text-gray-900">
              prefud
            </Link>
          </div>

          {/* Center - Main Navigation */}
          <nav className="hidden sm:flex space-x-8">
            <Link 
              to="/meal-planner" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Meal Planner
            </Link>
            <Link 
              to="/recipes" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Recipes
            </Link>
            <Link 
              to="/shopping-list" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Shopping List
            </Link>
          </nav>

          {/* Right side - User Menu/Logout */}
          <div className="flex items-center">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
