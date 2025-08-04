import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, DollarSign } from 'lucide-react';
import { authService } from '../../services/authService';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <DollarSign className="brand-icon" />
            <span className="brand-text">ExpenseTracker</span>
          </div>

          <div className="navbar-user">
            <div className="user-info">
              <User className="user-icon" />
              <span className="user-name">
                {user?.fullName || `${user?.firstName} ${user?.lastName}` || 'User'}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="logout-button"
              title="Logout"
            >
              <LogOut className="logout-icon" />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;