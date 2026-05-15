import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  CloudSun, 
  IndianRupee, 
  Sprout, 
  Menu, 
  X, 
  ScanSearch, 
  LayoutDashboard, 
  LogOut, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat',      icon: MessageSquare,   label: 'Chat'      },
  { to: '/weather',   icon: CloudSun,        label: 'Weather'   },
  { to: '/prices',    icon: IndianRupee,     label: 'Prices'    },
  { to: '/recommend', icon: Sprout,          label: 'Plan'      },
  { to: '/disease',   icon: ScanSearch,      label: 'Scan'      },
];

export default function Navbar({ user, onLogout, collapsed, setCollapsed }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const activeStyles = "text-[#002c06] bg-[#d9e6da] border-r-4 border-[#1b5e20] font-bold shadow-sm";
  const inactiveStyles = "text-[#41493e] hover:bg-[#ecefe6] hover:text-[#002c06]";

  return (
    <>
      {/* MOBILE: Top header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 h-16 bg-[#f4f4f0] border-b border-[#e1e4db] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#1b5e20] flex items-center justify-center text-lg">🌾</div>
          <span className="text-[#002c06] font-bold">KisanAI</span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-[#41493e] hover:bg-[#ecefe6] transition-colors"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            className="md:hidden fixed inset-0 z-[55] bg-[#f4f4f0] pt-20 px-4 flex flex-col gap-2"
          >
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-base font-medium ${isActive ? activeStyles : inactiveStyles}`
                }
              >
                <item.icon size={22} />
                {item.label}
              </NavLink>
            ))}
            {user && (
              <button 
                onClick={onLogout}
                className="mt-4 flex items-center gap-4 px-4 py-4 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium"
              >
                <LogOut size={22} />
                Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <nav
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen z-50 bg-[#f4f4f0] border-r border-[#e1e4db]/50 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand */}
        <div className="flex items-center h-20 px-6 border-b border-[#e1e4db]/50 overflow-hidden">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1b5e20] flex items-center justify-center text-xl shadow-md">🌾</div>
          {!collapsed && (
            <div className="ml-3 transition-opacity duration-300">
              <p className="text-[#002c06] font-bold text-sm tracking-tight">KisanAI</p>
              <p className="text-[#1b5e20] text-[10px] uppercase tracking-widest font-black">Advisory Pro</p>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <ul className="flex-1 flex flex-col gap-1 p-3 pt-6 overflow-y-auto overflow-x-hidden">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 p-3.5 rounded-xl transition-all ${isActive ? activeStyles : inactiveStyles}`
                }
              >
                <item.icon size={22} className="flex-shrink-0" />
                {!collapsed && <span className="text-sm font-bold whitespace-nowrap">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User profile & Collapse Toggle */}
        <div className="p-3 border-t border-[#e1e4db]/50">
          {user && !collapsed && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#e1e4db]/30 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#d9e6da] flex items-center justify-center text-[#1b5e20] border border-[#1b5e20]/10">
                <User size={16} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[#002c06] text-xs font-bold truncate">{user.name || 'Farmer'}</p>
                <p className="text-[10px] text-[#41493e] truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl text-[#41493e] hover:bg-[#ecefe6] transition-all"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              {!collapsed && <span className="text-sm font-bold">Collapse</span>}
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              {!collapsed && <span className="text-sm font-bold">Logout</span>}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
