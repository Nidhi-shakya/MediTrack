// [Requirement 1: Multiple React Components]
// [Requirement 2: Responsive Web Design - sm:, md:, lg:]
// [Requirement 8: React Router Integration]
// frontend/src/components/Navbar.jsx

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useClinic } from '../context/ClinicContext';
import {
  Activity,
  CalendarPlus,
  Users,
  ClipboardList,
  Stethoscope,
  LogIn,
  LogOut,
  Globe,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

export const Navbar = () => {
  const { staffUser, logoutStaff, language, setLanguage, systemStatus, t } = useClinic();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logoutStaff();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-teal-700 hover:text-teal-800 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                {t.brand}
                <span className="text-[10px] font-semibold tracking-wider uppercase bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                  OPD v2.0
                </span>
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium -mt-0.5">
                {t.subBrand}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
            {/* Public Route 1: Booking */}
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/')
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarPlus className="w-4 h-4" />
              {t.navBook}
            </Link>

            {/* Public Route 2: Live Queue */}
            <Link
              to="/queue"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/queue')
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              {t.navQueue}
            </Link>

            {/* Protected Route 1: Reception Desk */}
            <Link
              to="/reception"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/reception')
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              {t.navReception}
              {staffUser && staffUser.role === 'reception' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </Link>

            {/* Protected Route 2: Doctor Portal */}
            <Link
              to="/doctor"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isActive('/doctor')
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              {t.navDoctor}
              {staffUser && staffUser.role === 'doctor' && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </Link>
          </nav>

          {/* Desktop Right Action Bar: Language + Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Database Engine Status Indicator (Requirement 5 & 14) */}
            {systemStatus && (
              <span
                className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  systemStatus.database?.connected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
                title={systemStatus.database?.description}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${systemStatus.database?.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                {systemStatus.database?.connected ? 'Atlas Cloud' : 'In-Memory Store'}
              </span>
            )}

            {/* Language Switcher [English, Hindi, Punjabi] */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  language === 'en' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded transition-colors ${
                  language === 'hi' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="हिन्दी में बदलें"
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage('pa')}
                className={`px-2 py-1 rounded transition-colors ${
                  language === 'pa' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲੋ"
              >
                ਪੰਜਾਬੀ
              </button>
            </div>

            {/* Conditional Staff User Badge or Login Link */}
            {staffUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {staffUser.name}
                  </div>
                  <div className="text-[10px] text-teal-600 uppercase font-semibold">
                    {staffUser.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                {t.navLogin}
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Language Button quick toggle */}
            <button
              onClick={() => {
                if (language === 'en') setLanguage('hi');
                else if (language === 'hi') setLanguage('pa');
                else setLanguage('en');
              }}
              className="text-xs font-bold px-2 py-1 rounded bg-slate-100 border border-slate-200 text-teal-700"
            >
              {language.toUpperCase()}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
              isActive('/') ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
            }`}
          >
            <CalendarPlus className="w-4 h-4" />
            {t.navBook}
          </Link>
          <Link
            to="/queue"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
              isActive('/queue') ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            {t.navQueue}
          </Link>
          <Link
            to="/reception"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
              isActive('/reception') ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            {t.navReception}
          </Link>
          <Link
            to="/doctor"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
              isActive('/doctor') ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            {t.navDoctor}
          </Link>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Select Language:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded ${language === 'en' ? 'bg-teal-600 text-white' : 'bg-slate-100'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-1 rounded ${language === 'hi' ? 'bg-teal-600 text-white' : 'bg-slate-100'}`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setLanguage('pa')}
                  className={`px-2 py-1 rounded ${language === 'pa' ? 'bg-teal-600 text-white' : 'bg-slate-100'}`}
                >
                  ਪੰਜਾਬੀ
                </button>
              </div>
            </div>

            {staffUser ? (
              <div className="mt-2 flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div className="text-xs">
                  <p className="font-bold text-slate-800">{staffUser.name}</p>
                  <p className="text-teal-600 uppercase text-[10px]">{staffUser.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-600 font-bold px-3 py-1.5 rounded border border-rose-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 text-center py-2 text-sm font-semibold bg-teal-600 text-white rounded-lg shadow-sm"
              >
                {t.navLogin}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

