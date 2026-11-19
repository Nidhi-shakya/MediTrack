import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { BookingPage } from './pages/BookingPage';
import { LiveQueuePage } from './pages/LiveQueuePage';
import { ReceptionDashboard } from './pages/ReceptionDashboard';
import { DoctorPortal } from './pages/DoctorPortal';
import { LoginPage } from './pages/LoginPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { MedicineReminderPage } from './pages/MedicineReminderPage';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const AppShell = () => {
  const { error, setError, successMessage, setSuccessMessage } = useClinic();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4 space-y-2">
        {error && (
          <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-rose-100 rounded-lg text-rose-600 transition"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600 transition"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<BookingPage />} />

          <Route path="/queue" element={<LiveQueuePage />} />

          <Route path="/chat" element={<ChatbotPage />} />

          <Route path="/reminders" element={<MedicineReminderPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/reception"
            element={
              <ProtectedRoute allowedRoles={['reception', 'doctor']}>
                <ReceptionDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorPortal />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-700">
            MediTrack — Smart Outpatient Queue & Digital Prescription System
          </p>
          <p className="text-[11px] text-slate-400">
            Built for 25-Mark University Evaluation Rubric • Full-Stack MERN
          </p>
        </div>
      </footer>

      <FloatingChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ClinicProvider>
        <AppShell />
      </ClinicProvider>
    </BrowserRouter>
  );
}

