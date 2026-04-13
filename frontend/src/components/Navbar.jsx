import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, CloudSun, IndianRupee, Sprout, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/',          icon: MessageSquare, label: 'Chat'    },
  { to: '/weather',   icon: CloudSun,      label: 'Weather' },
  { to: '/prices',    icon: IndianRupee,   label: 'Prices'  },
  { to: '/recommend', icon: Sprout,        label: 'Crops'   },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ──────────────────────────────────────────────────────────
          MOBILE: Top header bar with hamburger
      ────────────────────────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ background: 'rgba(10,20,11,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold"
            style={{ background: 'linear-gradient(135deg,#61a65d,#245723)' }}>🌾</div>
          <span className="text-white font-semibold text-sm">KisanAI</span>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="p-2 rounded-xl text-gray-300 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Slide-down Drawer */}
      {open && (
        <div
          className="md:hidden fixed top-14 left-0 right-0 z-50 flex flex-col gap-1 p-4 animate-fade-in"
          style={{ background: 'rgba(10,20,11,0.98)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
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
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
        style={{ background: 'rgba(10,20,11,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <ul className="flex justify-around items-center h-16 px-1">
          {navItems.map(item => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-2 w-full transition-all ${
                    isActive ? 'text-leaf-400' : 'text-gray-500'
                  }`
                }
              >
                <item.icon size={19} strokeWidth={2.5} />
                <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ──────────────────────────────────────────────────────────
          DESKTOP: Sidebar
      ────────────────────────────────────────────────────────── */}
      <nav
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-20 lg:w-64 z-50"
        style={{ background: 'rgba(10,20,11,0.92)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Brand */}
        <div className="flex items-center justify-center lg:justify-start lg:px-6 h-20 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#61a65d,#245723)' }}>🌾</div>
          <div className="hidden lg:block ml-3">
            <p className="text-white font-semibold text-sm tracking-tight">KisanAI</p>
            <p className="text-leaf-400 text-xs uppercase tracking-tighter">Agricultural Advisory</p>
          </div>
        </div>

        {/* Nav Links */}
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

        <div className="p-4 hidden lg:block" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] text-gray-600 leading-relaxed uppercase tracking-widest">
            Expert Advisory System<br />v1.0
          </p>
        </div>
      </nav>
    </>
  );
}
