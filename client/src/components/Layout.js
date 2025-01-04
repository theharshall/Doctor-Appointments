import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../Layout.css";
import { Badge } from "antd";

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false); // State for sidebar collapse
  const { user } = useSelector((state) => state.user); // Access user data from Redux
  const navigate = useNavigate();
  const location = useLocation();

  // Menus for different roles
  const userMenu = [
    { name: "Home", path: "/", icon: "ri-home-4-line" },
    { name: "Appointments", path: "/appointments", icon: "ri-file-list-3-line" },
    { name: "Apply Doctors", path: "/apply-doctors", icon: "ri-hospital-line" },

  ];

  const doctorMenu = [
    { name: "Home", path: "/", icon: "ri-home-4-line" },
    { name: "Appointments", path: "/doctor/appointments", icon: "ri-file-list-3-line" },
    { name: "Profile", path: `/doctor/profile/${user?._id}`, icon: "ri-user-line" },
  ];

  const adminMenu = [
    { name: "Home", path: "/", icon: "ri-home-4-line" },
    { name: "Users", path: "/admin/userslist", icon: "ri-file-user-line" },
    { name: "Doctors", path: "/admin/doctorslist", icon: "ri-nurse-line" },
  ];

  // Determine which menu and role to render based on user role
  const menuToBeRendered = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
    ? doctorMenu
    : userMenu;

  const role = user?.isAdmin ? "Admin Section" : user?.isDoctor ? "Doctor Section" : "User Section"; // Section name dynamically

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="main">
      <div className="d-flex layout">
        {/* Sidebar */}
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <div className="sidebar-header">
            {/* Constant Website Name */}
            <h1 className="logo">Doctorly</h1>
            {/* Dynamic Section Name */}
            <h2 className="section-name">{role}</h2>
          </div>

          <div className="menu">
            {menuToBeRendered.map((menu) => {
              const isActive = location.pathname === menu.path;
              return (
                <div
                  className={`d-flex menu-item ${isActive ? "active-menu-item" : ""}`}
                  key={menu.name}
                >
                  <i className={menu.icon}></i>
                  {!collapsed && <Link to={menu.path}>{menu.name}</Link>}
                </div>
              );
            })}
            <div className="d-flex menu-item" onClick={handleLogout}>
              <i className="ri-logout-circle-line"></i>
              {!collapsed && <span>Logout</span>}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content">
          {/* Header */}
          <div className="header">
            {collapsed ? (
              <i
                className="ri-menu-line header-action-icon"
                onClick={() => setCollapsed(false)}
              ></i>
            ) : (
              <i
                className="ri-close-line header-action-icon"
                onClick={() => setCollapsed(true)}
              ></i>
            )}

            <div className="d-flex align-items-center px-4">
              <Badge
                count={user?.unseenNotifications?.length}
                onClick={() => navigate("/notifications")}
              >
                <i className="ri-notification-3-line header-action-icon px-3 mr-2"></i>
              </Badge>

              <Link className="anchor mx-3" to="/profile">
                {user?.name}
              </Link>
            </div>
          </div>

          {/* Body */}
          <div className="body">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
