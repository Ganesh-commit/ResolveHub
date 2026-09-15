import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import {
  X,
  UploadCloud,
  CheckCircle,
  Loader2,
  Paperclip,
  Trash2,
  Sparkles,
  AlertTriangle,
  KeyRound,
  Building2,
  HelpCircle
} from 'lucide-react';
import { BTECH_DEPARTMENTS, UNIVERSITY_ISSUES } from '../data/complaintCategories';

export const ComplaintModal: React.FC = () => {
  const {
    isComplaintModalOpen,
    setIsComplaintModalOpen,
    addTicket,
    setActiveView
  } = useGrievance();

  const [regNo, setRegNo] = useState('241FA07001');
  const [department, setDepartment] = useState(BTECH_DEPARTMENTS[0]);
  const [issue, setIssue] = useState(UNIVERSITY_ISSUES[0]);
  const [otherDescription, setOtherDescription] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [location, setLocation] = useState('');
  const [attachments, setAttachments] = useState<Array<{ name: string; size: string; type: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  if (!isComplaintModalOpen) return null;

  const handleSimulatedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const sampleFiles = [
      { name: 'fault_evidence_photo.jpg', size: '1.2 MB', type: 'image/jpeg' }
    ];
    setAttachments((prev) => [...prev, ...sampleFiles]);
    setAttachmentError(null);
  };

  const handleAddSampleAttachment = () => {
    const sample = {
      name: `evidence_photo_${attachments.length + 1}.jpg`,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      type: 'image/jpeg'
    };
    setAttachments((prev) => [...prev, sample]);
    setAttachmentError(null);
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttachmentError(null);

    if (!regNo.trim()) return;

    // MANDATORY ATTACHMENT VALIDATION
    if (attachments.length === 0) {
      setAttachmentError('Photo or Document attachment is mandatory! Complaint cannot be submitted without attaching a photo or document.');
      return;
    }

    if (issue === 'Other' && !otherDescription.trim()) return;

    setIsSubmitting(true);

    const finalDescription = issue === 'Other' 
      ? otherDescription.trim() 
      : `${issue}${extraDetails.trim() ? ` — Details: ${extraDetails.trim()}` : ''}`;

    setTimeout(() => {
      addTicket({
        title: issue === 'Other' ? otherDescription.slice(0, 50) : issue,
        category: issue as any,
        urgency: 'medium',
        location: location || 'Main Campus',
        description: finalDescription,
        complainantName: `Reg No: ${regNo}`,
        complainantEmail: `${regNo.toLowerCase()}@vignan.ac.in`,
        attachments
      });

      setIsSubmitting(false);
      setIsComplaintModalOpen(false);

      // Reset form
      setOtherDescription('');
      setExtraDetails('');
      setLocation('');
      setAttachments([]);
      setAttachmentError(null);

      // Switch to Citizen View to track new ticket
      setActiveView('citizen');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-cyan-500/30 my-auto shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 mb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Grievance Portal</span>
            </div>
            <h2
              style={{ fontFamily: 'var(--font-heading)' }}
              className="text-xl sm:text-2xl font-semibold text-white tracking-tight"
            >
              Submit Campus Complaint
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Please fill in your Registration number, select department & issue, and attach proof.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsComplaintModalOpen(false)}
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Complaint Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Enter Registration Number */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-cyan-300 mb-1 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              Enter Registration Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              placeholder="Enter Registration Number"
              className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white font-mono uppercase font-bold focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 2. Select Department (B.Tech Related Departments) */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-cyan-300 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Select Department (B.Tech Engineering) <span className="text-rose-400">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {BTECH_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Select Issue (University Issues + Other) */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-cyan-300 mb-1 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Select Issue <span className="text-rose-400">*</span>
            </label>
            <select
              value={issue}
              onChange={(e) => {
                setIssue(e.target.value);
                setAttachmentError(null);
              }}
              className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {UNIVERSITY_ISSUES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* 4. If "Other" is selected, show mandatory problem input field */}
          {issue === 'Other' ? (
            <div className="animate-slide-up">
              <label className="block text-[11px] font-mono uppercase text-rose-300 mb-1">
                Type Your Problem Details <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={otherDescription}
                onChange={(e) => setOtherDescription(e.target.value)}
                placeholder="Please type your specific problem here..."
                className="w-full bg-[#090a0f] border border-cyan-500 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-300 resize-none font-sans"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
                Additional Details / Room Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={extraDetails}
                onChange={(e) => setExtraDetails(e.target.value)}
                placeholder="Add room numbers or extra details if needed..."
                className="w-full bg-[#090a0f] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 resize-none font-sans"
              />
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
              Campus Location / Block (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Block C Room 304 / Lab 2"
              className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* 5. Mandatory Attach Photo / Evidence */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono uppercase mb-1">
              <span className="text-white flex items-center gap-1.5">
                Attach Photo / Document 
                <span className="text-rose-400 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                  MANDATORY *
                </span>
              </span>
              <button
                type="button"
                onClick={handleAddSampleAttachment}
                className="text-cyan-400 hover:underline normal-case font-sans cursor-pointer text-xs"
              >
                + Add Photo Evidence
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleSimulatedDrop}
              onClick={handleAddSampleAttachment}
              className={`border border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/30'
                  : 'border-cyan-500/40 bg-[#090a0f] hover:border-cyan-400'
              }`}
            >
              <UploadCloud className="w-6 h-6 text-cyan-400 mx-auto mb-1.5" />
              <div className="text-xs font-medium text-white">
                Click here or drag photo/document to attach
              </div>
              <div className="text-[10px] text-cyan-300/70 mt-0.5 font-mono">
                Mandatory: Photo or Document proof required for submission
              </div>
            </div>

            {/* Uploaded items preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((file, idx) => (
                  <div
                    key={file.name + idx}
                    className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-xs"
                  >
                    <Paperclip className="w-3 h-3 text-emerald-400" />
                    <span className="text-white truncate max-w-[140px]">{file.name}</span>
                    <span className="text-[10px] text-emerald-300 font-mono">({file.size})</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAttachment(idx);
                      }}
                      className="text-white/40 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* RED ERROR BANNER IF NO ATTACHMENT */}
            {attachmentError && (
              <div className="mt-2.5 p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-center gap-2 font-semibold animate-slide-up">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{attachmentError}</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsComplaintModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer uppercase font-mono tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Complaint...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Grievance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
