import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import {
  X,
  ShieldAlert,
  PhoneCall,
  Mail,
  Copy,
  Check
} from 'lucide-react';

export const EmergencyModal: React.FC = () => {
  const { isEmergencyModalOpen, setIsEmergencyModalOpen, showToast } = useGrievance();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isEmergencyModalOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to Clipboard', text, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const emergencyContacts = [
    {
      id: 'hotline',
      title: 'Central 24/7 Redressal Hotline',
      value: '+91 (0) 80 2345 6789',
      desc: 'Immediate dispatcher priority line (Toll Free)',
      type: 'phone'
    },
    {
      id: 'email',
      title: 'Statutory Grievance Email',
      value: 'support@resolvepulse.gov',
      desc: 'Official escalation & statutory paper trail',
      type: 'email'
    },
    {
      id: 'medical',
      title: 'Campus Health Center & Ambulance',
      value: '+91 99880 11223',
      desc: 'First response medical unit & trauma triage',
      type: 'phone'
    },
    {
      id: 'security',
      title: 'Campus Central Security Post',
      value: '+91 80 9900 4455',
      desc: 'Physical safety, hostel gate control, fire marshals',
      type: 'phone'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-rose-500/40 relative shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2
                style={{ fontFamily: 'var(--font-heading)' }}
                className="text-xl font-semibold text-white tracking-tight"
              >
                Emergency Redressal Desk
              </h2>
              <p className="text-xs text-rose-300/80 font-mono">
                CRITICAL DISPATCH ESCALATION PROTOCOL
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(false)}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-white/70 mb-5 leading-relaxed bg-rose-950/30 p-3 rounded-xl border border-rose-500/20">
          If you are facing an active fire hazard, gas leakage, physical safety compromise, or medical trauma, contact these emergency response lines immediately.
        </p>

        {/* Contacts List */}
        <div className="space-y-3 mb-6">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="glass-card rounded-2xl p-4 border border-white/10 hover:border-rose-400/40 transition-all flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {contact.title}
                </div>
                <div className="text-sm font-mono font-bold text-rose-400 tracking-wide mt-0.5">
                  {contact.value}
                </div>
                <div className="text-[11px] text-white/50">{contact.desc}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {contact.type === 'phone' ? (
                  <a
                    href={`tel:${contact.value}`}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-300 border border-white/10 transition-colors"
                    title="Call Now"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                ) : (
                  <a
                    href={`mailto:${contact.value}`}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-300 border border-white/10 transition-colors"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleCopy(contact.id, contact.value)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  title="Copy to Clipboard"
                >
                  {copiedKey === contact.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsEmergencyModalOpen(false)}
          className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          Dismiss Emergency Desk
        </button>
      </div>
    </div>
  );
};
