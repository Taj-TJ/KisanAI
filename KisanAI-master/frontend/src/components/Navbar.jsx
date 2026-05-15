import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, CloudSun, IndianRupee, Sprout, Menu, X, ScanSearch, LayoutDashboard, LogOut, User } from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat',      icon: MessageSquare,   label: 'Chat'      },
  { to: '/weather',   icon: CloudSun,        label: 'Weather'   },
  { to: '/prices',    icon: IndianRupee,     label: 'Prices'    },
  { to: '/recommend', icon: Sprout,          label: 'Plan'      },
  { to: '/disease',   icon: ScanSearch,      label: 'Scan'      },
];

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* MOBILE: Top header bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[#0a140b]/95 backdrop-blur-md border-b border-white/5"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-leaf-400 to-leaf-700 flex items-center justify-center text-base font-bold">🌾</div>
          <span className="text-white font-semibold text-sm">KisanAI</span>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-leaf-400 border border-leaf-500/20">
              <User size={14} />
            </div>
          )}
          <button
            onClick={() => setOpen(v => !v)}
            className="p-2 rounded-xl text-gray-300 hover:text-white bg-white/5 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {open && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-50 flex flex-col gap-1 p-4 bg-[#0a140b]/98 backdrop-blur-xl border-b border-white/7">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'text-leaf-400 bg-leaf-900/40 border border-leaf-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              <item.icon size={18} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
          {user && (
            <button 
              onClick={onLogout}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      )}

      {/* Desktop Sidebar */}
      <nav
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-20 lg:w-64 z-50 bg-[#0a140b]/92 backdrop-blur-md border-r border-white/5"
      >
        <div className="flex items-center justify-center lg:justify-start lg:px-6 h-20 flex-shrink-0 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-leaf-400 to-leaf-700 flex items-center justify-center text-xl shadow-lg">🌾</div>
          <div className="hidden lg:block ml-3">
            <p className="text-white font-semibold text-sm tracking-tight">KisanAI</p>
            <p className="text-leaf-400 text-[10px] uppercase tracking-widest font-bold">Advisory System</p>
          </div>
        </div>

        <ul className="flex flex-col gap-2 p-3 pt-4 flex-1">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl transition-all ${
                    isActive
                      ? 'text-leaf-400 bg-leaf-900/40 border border-leaf-500/20 shadow-inner'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`
                }
              >
                <item.icon size={22} strokeWidth={2} />
                <span className="hidden lg:block text-sm font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {user && (
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 lg:px-4 rounded-xl bg-white/5 mb-2">
              <div className="w-8 h-8 rounded-full bg-leaf-500/20 flex items-center justify-center text-leaf-400 border border-leaf-500/20">
                <User size={16} />
              </div>
              <div className="hidden lg:block overflow-hidden">
                <p className="text-white text-xs font-bold truncate">{user.name || 'Farmer'}</p>
                <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={20} />
              <span className="hidden lg:block text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
