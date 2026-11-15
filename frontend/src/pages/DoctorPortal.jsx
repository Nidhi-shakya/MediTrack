// [Requirement 1: Multiple React Components]
// [Requirement 4: Fetch API]
// [Requirement 5: Error Handling]
// [Requirement 6: Props & State]
// [Requirement 7: Conditional Rendering]
// [Requirement 8: React Router Protected Route]
// frontend/src/pages/DoctorPortal.jsx

import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import {
  Stethoscope,
  FileText,
  User,
  Plus,
  Trash2,
  Printer,
  CheckCircle,
  AlertCircle,
  History,
  Clock,
  Sparkles,
  ChevronRight,
  Activity,
  HeartPulse,
} from 'lucide-react';

export const DoctorPortal = () => {
  const {
    patients,
    prescriptions,
    savePrescription,
    updatePatientStatus,
    staffUser,
    loading,
    t,
  } = useClinic();

  // Active Selected Patient for consultation
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Digital Prescription Form State
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medicines: [
      { medicineName: 'Paracetamol 650mg', dosage: '1-0-1', duration: '3 Days' },
      { medicineName: 'Cetirizine 10mg', dosage: '0-0-1', duration: '5 Days' },
    ],
    notes: 'Adequate hydration. Avoid strenuous activities. Review in OPD after 3 days if symptoms do not improve.',
  });

  // Modal for printable digital prescription
  const [printedPrescription, setPrintedPrescription] = useState(null);

  // Active Tab: 'active' (write rx) or 'history' (view completed)
  const [viewTab, setViewTab] = useState('active');

  // Filter patients needing consultation (In-Consultation or Waiting)
  const waitingForDoctor = patients.filter(
    (p) => p.status === 'In-Consultation' || p.status === 'Waiting'
  );

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    // If patient was waiting, automatically move them to In-Consultation
    if (patient.status === 'Waiting') {
      await updatePatientStatus(patient._id, 'In-Consultation');
    }
  };

  const handleAddMedicineRow = () => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { medicineName: '', dosage: '1-0-1', duration: '5 Days' },
      ],
    }));
  };

  const handleRemoveMedicineRow = (index) => {
    if (prescriptionForm.medicines.length <= 1) {
      alert('Prescription must have at least one medicine.');
      return;
    }
    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setPrescriptionForm((prev) => {
      const updated = [...prev.medicines];
      updated[index][field] = value;
      return { ...prev, medicines: updated };
    });
  };

  // Save Prescription via Fetch API [Requirement 4]
  const handleSaveAndPrint = async (e) => {
    e.preventDefault();

    if (!selectedPatient) {
      alert('Please select a patient from the queue first.');
      return;
    }

    if (!prescriptionForm.diagnosis.trim()) {
      alert('Please provide a clinical diagnosis.');
      return;
    }

    // Validate medicines
    for (const med of prescriptionForm.medicines) {
      if (!med.medicineName.trim()) {
        alert('Please fill out all medicine names or remove blank rows.');
        return;
      }
    }

    const payload = {
      patientId: selectedPatient._id,
      patientName: selectedPatient.name,
      tokenNumber: selectedPatient.tokenNumber,
      doctorName: staffUser ? staffUser.name : 'Dr. A. Verma (MBBS, MD - General Medicine)',
      diagnosis: prescriptionForm.diagnosis.trim(),
      medicines: prescriptionForm.medicines,
      notes: prescriptionForm.notes.trim(),
    };

    const res = await savePrescription(payload);
    if (res.success) {
      setPrintedPrescription(res.data);
      // Reset form
      setPrescriptionForm({
        diagnosis: '',
        medicines: [{ medicineName: '', dosage: '1-0-1', duration: '3 Days' }],
        notes: 'Adequate rest and hydration. Return if symptoms worsen.',
      });
      setSelectedPatient(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
            PHYSICIAN CONSULTATION DESK
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Doctor Digital Prescription Pad
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Diagnose queued patients, prescribe medications, and issue print-ready OPD slips.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-sm">
          <button
            onClick={() => setViewTab('active')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
              viewTab === 'active' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Active Queue ({waitingForDoctor.length})
          </button>
          <button
            onClick={() => setViewTab('history')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
              viewTab === 'history' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            Issued Prescriptions ({prescriptions.length})
          </button>
        </div>
      </div>

      {viewTab === 'active' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Waiting Patients Selection List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
              <span>Patients for Consultation</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                {waitingForDoctor.length} in line
              </span>
            </h3>

            {/* [Requirement 7: Conditional Rendering] */}
            {waitingForDoctor.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No patients awaiting consultation.
              </div>
            ) : (
              waitingForDoctor.map((p) => {
                const isSelected = selectedPatient && selectedPatient._id === p._id;
                return (
                  <div
                    key={p._id}
                    onClick={() => handleSelectPatient(p)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 shadow-md ring-2 ring-teal-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-slate-900 text-teal-300 font-black rounded-lg text-xs font-mono">
                          {p.tokenNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          p.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : p.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {p.priority}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                      <span>
                        {p.age} yrs • {p.gender}
                      </span>
                      <span className="font-semibold text-slate-700">Temp: {p.temperature}°F</span>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-600 line-clamp-1 italic bg-slate-50 p-1.5 rounded">
                      "{p.symptoms}"
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Digital Prescription Pad Form */}
          <div className="lg:col-span-8">
            {selectedPatient ? (
              <form
                onSubmit={handleSaveAndPrint}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6"
              >
                {/* Active Patient Details Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-800">
                      CURRENT PATIENT IN CABIN
                    </span>
                    <h3 className="text-lg font-black text-slate-900">
                      {selectedPatient.tokenNumber} — {selectedPatient.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {selectedPatient.age} Y / {selectedPatient.gender} • Ph: {selectedPatient.phone}
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <div className="font-bold text-slate-700">
                      Recorded Temp: <span className="text-teal-700">{selectedPatient.temperature}°F</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Symptoms: <span className="font-medium text-slate-800">{selectedPatient.symptoms}</span>
                    </div>
                  </div>
                </div>

                {/* Clinical Diagnosis Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clinical Diagnosis & Findings <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={prescriptionForm.diagnosis}
                    onChange={(e) =>
                      setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })
                    }
                    placeholder="e.g. Acute Upper Respiratory Tract Infection with Mild Pharyngitis"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
                  />
                </div>

                {/* Medicines List Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Prescribed Medications (Rx)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMedicineRow}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Medicine
                    </button>
                  </div>

                  <div className="space-y-3">
                    {prescriptionForm.medicines.map((med, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2.5 items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                      >
                        <div className="col-span-12 sm:col-span-6">
                          <input
                            type="text"
                            required
                            placeholder="Medicine Name & Strength (e.g. Amoxicillin 500mg)"
                            value={med.medicineName}
                            onChange={(e) =>
                              handleMedicineChange(idx, 'medicineName', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <select
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                          >
                            <option value="1-0-1">1-0-1 (Morning & Night)</option>
                            <option value="1-0-0">1-0-0 (Morning Only)</option>
                            <option value="0-0-1">0-0-1 (Night Only)</option>
                            <option value="1-1-1">1-1-1 (Thrice a Day)</option>
                            <option value="0-1-0">0-1-0 (Afternoon Only)</option>
                            <option value="As Needed">As Needed (SOS)</option>
                          </select>
                        </div>

                        <div className="col-span-5 sm:col-span-2">
                          <input
                            type="text"
                            required
                            placeholder="Duration (5 Days)"
                            value={med.duration}
                            onChange={(e) =>
                              handleMedicineChange(idx, 'duration', e.target.value)
                            }
                            className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>

                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-100 rounded transition"
                            title="Remove medicine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Notes / Advice */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Special Advice & Doctor's Instructions
                  </label>
                  <textarea
                    rows="3"
                    value={prescriptionForm.notes}
                    onChange={(e) =>
                      setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })
                    }
                    placeholder="Dietary instructions, precautions, review date..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
                  />
                </div>

                {/* Save and Print Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <p className="text-xs text-slate-500 italic">
                    Saving prescription will automatically mark patient status as <strong>'Completed'</strong>.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 flex items-center gap-2 transition"
                  >
                    <Printer className="w-4 h-4" />
                    Save & Generate Prescription Slip
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
                <Stethoscope className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <h4 className="text-base font-bold text-slate-700">No Patient Currently Selected</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click on any patient from the waiting queue on the left to review vitals and write a digital prescription.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Prescriptions History Tab */
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Issued Digital Prescriptions History</h3>
          {prescriptions.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-400">
              No prescriptions issued yet today.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div
                  key={rx._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="font-mono text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {rx.tokenNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{rx.patientName}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rx.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    <strong>Diagnosis:</strong> {rx.diagnosis}
                  </p>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                    <p className="font-bold text-slate-700">Medications:</p>
                    {rx.medicines.map((m, i) => (
                      <div key={i} className="flex justify-between text-[11px]">
                        <span>• {m.medicineName}</span>
                        <span className="font-mono text-teal-800">
                          {m.dosage} ({m.duration})
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setPrintedPrescription(rx)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    View & Print Slip
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Printable Digital Prescription Modal / Slip */}
      {/* [Requirement 7: Conditional Rendering] */}
      {printedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative">
            {/* Action Bar (hidden when printing) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 print:hidden">
              <span className="text-xs font-extrabold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Prescription Generated Successfully
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Now
                </button>
                <button
                  onClick={() => setPrintedPrescription(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Prescription Body */}
            <div id="printable-prescription" className="space-y-6 text-slate-800">
              {/* Clinic Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-teal-800 tracking-tight">
                    MediTrack PolyClinic
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Civil Lines Hospital Enclave, New Delhi - 110001
                  </p>
                  <p className="text-xs text-slate-500">OPD Helpdesk: +91 11-23456789</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-black text-slate-900">
                    {printedPrescription.doctorName}
                  </h3>
                  <p className="text-xs text-slate-500">Regn. No: MCI-2018-98421</p>
                  <p className="text-xs text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Patient Demographics Box */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold">Patient Name:</span>{' '}
                  <span className="font-bold">{printedPrescription.patientName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-semibold">Token No:</span>{' '}
                  <span className="font-bold font-mono text-teal-700">
                    {printedPrescription.tokenNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Diagnosis:</span>{' '}
                  <span className="font-bold text-rose-700">{printedPrescription.diagnosis}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-semibold">Consultation Mode:</span> Regular OPD
                </div>
              </div>

              {/* Prescription Rx Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-lg font-black text-teal-800">
                  <span>℞</span>
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                    Prescribed Medicines
                  </span>
                </div>

                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="py-2">#</th>
                      <th className="py-2">Medicine Name</th>
                      <th className="py-2">Dosage Frequency</th>
                      <th className="py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {printedPrescription.medicines.map((m, idx) => (
                      <tr key={idx} className="font-medium">
                        <td className="py-2.5 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 font-bold text-slate-900">{m.medicineName}</td>
                        <td className="py-2.5 font-mono text-teal-800">{m.dosage}</td>
                        <td className="py-2.5 text-slate-600">{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Doctor Instructions */}
              <div className="text-xs bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                <p className="font-bold text-teal-900 uppercase text-[10px] tracking-wider mb-1">
                  General Instructions & Advice:
                </p>
                <p className="text-slate-700 italic">{printedPrescription.notes}</p>
              </div>

              {/* Doctor Signature */}
              <div className="pt-12 flex justify-between items-end border-t border-slate-200">
                <div className="text-[10px] text-slate-400">
                  * Valid for 14 days from issue date. Computer generated prescription.
                </div>
                <div className="text-center">
                  <div className="font-serif italic font-bold text-slate-800 text-sm">Dr. A. Verma</div>
                  <div className="w-36 border-t border-slate-800 mt-1 pt-0.5 text-[10px] uppercase font-bold text-slate-600">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

