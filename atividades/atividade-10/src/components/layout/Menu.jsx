import './Menu.css'
import React from "react";
import { NavLink } from 'react-router-dom';

const Menu = () => {
  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <NavLink to="/" className="navbar-brand">
          <i className="fa fa-calendar-check-o"></i> Todo App
        </NavLink>

        <div className="collapse navbar-collapse" id="navbarCollapse">
          <ul className="navbar-nav me-auto mb-2 mb-md-0">
            <li className="nav-item">
              <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/todos" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Todo
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Sobre
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Menu;
