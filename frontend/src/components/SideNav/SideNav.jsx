import { useLocation, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { logout } from "../../features/auth/authSlice";
import LogoutConfirmation from "../LogoutConfirmation/LogoutConfirmation";

/* ── Icons (inline SVG for full control) ─────────────────────────────────── */
const Icon = ({ d, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  dashboard:   "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  walkin:      ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  employee:    ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  training:    ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  assessment:  ["M9 11l3 3L22 4", "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"],
  module:      ["M4 6h16M4 12h16M4 18h16"],
  branch:      ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  settings:    ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  logout:      ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  chevron:     "M6 9l6 6 6-6",
};

/* ── Single nav item ─────────────────────────────────────────────────────── */
const NavItem = ({ to, icon, label, active, onClick, children, expanded }) => {
  const base =
    "flex flex-col items-center justify-center gap-1.5 w-full py-3.5 px-2 rounded-xl cursor-pointer select-none transition-all duration-200 group/item";
  const activeStyle = "bg-white/10 text-white";
  const inactiveStyle = "text-gray-400 hover:text-white hover:bg-white/5";

  const inner = (
    <div className={`${base} ${active ? activeStyle : inactiveStyle}`} onClick={onClick}>
      {/* active indicator bar */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
      )}
      <Icon d={ICONS[icon]} size={22} />
      <span className="text-[11px] font-medium tracking-wide leading-none text-center">{label}</span>
      {children}
    </div>
  );

  if (to) return <Link to={to} className="relative w-full block">{inner}</Link>;
  return <div className="relative w-full">{inner}</div>;
};

/* ── Main SideNav ────────────────────────────────────────────────────────── */
const SideNav = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const user      = useSelector((s) => s.auth.user);
  const location  = useLocation();
  const [showLogout, setShowLogout]     = useState(false);
  const [walkinOpen, setWalkinOpen]     = useState(false);

  const is = (path) => location.pathname === path;
  const isWalkin = is('/walkin/list') || is('/walkin/report');

  useEffect(() => { if (isWalkin) setWalkinOpen(true); }, [location.pathname]);

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <div
        className="fixed hidden md:flex top-0 left-0 h-screen z-50 flex-col items-center py-6 gap-1"
        style={{ width: '110px', backgroundColor: '#1a1a1a' }}
      >
        {/* Logo area */}
        <div className="mb-4 flex flex-col items-center">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-1 overflow-hidden">
            <img src="/Rootments.jpg" alt="Logo" className="w-8 h-8 object-cover rounded-lg" />
          </div>
        </div>

        {/* Divider */}
        <div className="w-10 h-px bg-white/10 mb-2" />

        {/* Nav items */}
        <div className="flex flex-col items-center gap-1 w-full px-2 flex-1 overflow-y-auto">

          <NavItem to="/"            icon="dashboard"  label="Dashboard"  active={is('/')} />
          
          {/* Walk-In with sub-items */}
          <div className="w-full">
            <NavItem icon="walkin" label="Walk-In" active={isWalkin} onClick={() => setWalkinOpen(p => !p)} />
            <div style={{
              maxHeight: walkinOpen ? '120px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease',
            }}>
              <div className="flex flex-col gap-1 mt-1 px-1">
                <Link to="/walkin/list"
                  className={`text-[10px] text-center py-1.5 rounded-lg transition-colors
                    ${is('/walkin/list') ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                  List
                </Link>
                <Link to="/walkin/report"
                  className={`text-[10px] text-center py-1.5 rounded-lg transition-colors
                    ${is('/walkin/report') ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                  Report
                </Link>
              </div>
            </div>
          </div>

          <NavItem to="/employee"    icon="employee"   label="Employees"  active={is('/employee')} />
          <NavItem to="/training"    icon="training"   label="Trainings"  active={is('/training') || is('/alltraining') || is('/createnewtraining')} />
          <NavItem to="/assessments" icon="assessment" label="Assessments" active={is('/assessments')} />
          <NavItem to="/module"      icon="module"     label="Modules"    active={is('/module')} />
          <NavItem to="/branch"      icon="branch"     label="Branches"   active={is('/branch') || is('/Addbranch')} />
          {user?.role === 'super_admin' && (
            <NavItem to="/settings"  icon="settings"   label="Settings"   active={is('/settings')} />
          )}
        </div>

        {/* Divider */}
        <div className="w-10 h-px bg-white/10 mb-2" />

        {/* Logout */}
        <div className="w-full px-2">
          <NavItem icon="logout" label="Logout" active={false} onClick={() => setShowLogout(true)} />
        </div>
      </div>

      <LogoutConfirmation
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default SideNav;
