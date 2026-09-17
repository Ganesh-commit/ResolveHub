import React, { useState, useRef } from 'react';
import { 
  FilePlus, 
  Search, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Clock, 
  Heart, 
  Paperclip, 
  Send, 
  X,
  MapPin,
  CheckCircle2,
  GraduationCap,
  Lock,
  UserCheck,
  AlertTriangle,
  KeyRound,
  Building2,
  HelpCircle
} from 'lucide-react';
import { CivicCommunityBg } from './CivicCommunityBg';
import { useResolveHub } from '../context/ResolveHubContext';
import { BTECH_DEPARTMENTS, UNIVERSITY_ISSUES } from '../data/complaintCategories';

export const HeroSection: React.FC = () => {
  const { submitComplaint, setActiveView, setTrackQuery, userLoggedIn, currentUserRegNo, setIsLoginModalOpen, systemSettings } = useResolveHub();

  const availableDepartments = systemSettings?.departments?.length ? systemSettings.departments : BTECH_DEPARTMENTS;
  const availableCategories = systemSettings?.categories?.length ? systemSettings.categories : UNIVERSITY_ISSUES;

  const [regNoInput, setRegNoInput] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(availableDepartments[0]);
  const [selectedIssue, setSelectedIssue] = useState(availableCategories[0]);
  const [otherDescription, setOtherDescription] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [location, setLocation] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: file.type || 'document'
      }));
      setAttachedFiles(prev => [...prev, ...newFiles]);
      setAttachmentError(null);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttachmentError(null);

    // Registration number validation if not logged in
    const activeRegNo = userLoggedIn && currentUserRegNo ? currentUserRegNo : regNoInput.trim();
    if (!activeRegNo) {
      setIsLoginModalOpen(true);
      return;
    }

    // MANDATORY PHOTO OR DOCUMENT ATTACHMENT CHECK
    if (attachedFiles.length === 0) {
      setAttachmentError('Photo or Document attachment is mandatory! Complaint cannot be submitted without attaching a photo or document.');
      return;
    }

    // Validate problem description if "Other" is selected
    if (selectedIssue === 'Other' && !otherDescription.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    const finalDescription = selectedIssue === 'Other'
      ? otherDescription.trim()
      : `${selectedIssue}${extraDetails.trim() ? ` — Details: ${extraDetails.trim()}` : ''}`;

    setTimeout(() => {
      const generatedId = submitComplaint({
        category: selectedIssue,
        department: selectedDepartment,
        description: finalDescription,
        location,
        attachments: attachedFiles
      });

      if (generatedId) {
        setSubmittedId(generatedId);
        setOtherDescription('');
        setExtraDetails('');
        setLocation('');
        setAttachedFiles([]);
        setAttachmentError(null);
      }
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <section className="relative min-h-[calc(100vh-64px)] pt-3 pb-4 lg:pt-4 lg:pb-6 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden bg-[#faf8f5]">
      
      {/* Background Illustrated Community Environment */}
      <CivicCommunityBg />

      {/* Subtle White/Cream Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5]/60 via-[#faf8f5]/30 to-[#faf8f5]/85 pointer-events-none z-0" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        
        {/* Main Grid: Left Features - Center Hero - Right Features */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-3 items-center">
          
          {/* ==================================================== */}
          {/* LEFT SIDE HERO CONTENT: VERTICAL FEATURE LIST        */}
          {/* ==================================================== */}
          <div className="hidden lg:flex lg:col-span-3 flex-col space-y-2.5 xl:pr-2">
            
            <div className="flex items-start space-x-2.5 group p-2 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs transition-all duration-200 hover:bg-white hover:shadow-xs">
              <div className="w-8.5 h-8.5 rounded-full bg-emerald-100/90 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <FilePlus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold tracking-wider text-slate-900 uppercase">
                  REPORT
                </h4>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                  Raise campus issues easily
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 group p-2 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs transition-all duration-200 hover:bg-white hover:shadow-xs">
              <div className="w-8.5 h-8.5 rounded-full bg-sky-100/90 text-sky-800 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold tracking-wider text-slate-900 uppercase">
                  TRACK
                </h4>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                  Stay updated with admin
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 group p-2 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs transition-all duration-200 hover:bg-white hover:shadow-xs">
              <div className="w-8.5 h-8.5 rounded-full bg-indigo-100/90 text-indigo-800 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold tracking-wider text-slate-900 uppercase">
                  RESOLVE
                </h4>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                  Timely department action
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 group p-2 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs transition-all duration-200 hover:bg-white hover:shadow-xs">
              <div className="w-8.5 h-8.5 rounded-full bg-amber-100/90 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold tracking-wider text-slate-900 uppercase">
                  IMPROVE
                </h4>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                  Build a better campus
                </p>
              </div>
            </div>

          </div>

          {/* ==================================================== */}
          {/* CENTER HERO CONTENT: MAIN HEADLINE & COMPLAINT CARD   */}
          {/* ==================================================== */}
          <div className="lg:col-span-6 text-center flex flex-col items-center">
            
            {/* Center Top Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-[10px] font-extrabold tracking-wider uppercase mb-2 border border-emerald-200/80 shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
              <span>FOR A SAFER | SMARTER | BETTER CAMPUS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-heading">
              How can the University help you <br className="hidden sm:inline" />
              <span className="text-emerald-700 relative inline-block">
                today?
                <svg className="absolute -bottom-1.5 left-0 w-full h-2.5 text-emerald-600/40" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,15 Q50,5 100,15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Short Decorative Underline */}
            <div className="w-12 h-1 bg-emerald-700 rounded-full my-2 shadow-2xs" />

            {/* Subtitle */}
            <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-md mx-auto leading-normal mb-3.5">
              Submit your campus complaint, track resolution progress with college administration, and get timely solutions — all in one student portal.
            </p>

            {/* ==================================================== */}
            {/* FROSTED-GLASS COMPLAINT INPUT CARD                   */}
            {/* ==================================================== */}
            <div className="w-full max-w-[580px] mx-auto">
              
              {/* Submission Success Card */}
              {submittedId ? (
                <div className="glass-card-hero rounded-2xl p-5 border border-emerald-300 bg-emerald-50/90 text-left shadow-xl animate-slide-up">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-emerald-950">
                        Campus Complaint Saved in Database!
                      </h3>
                      <p className="text-xs text-emerald-800 mt-1">
                        Your Tracking Code is <span className="font-extrabold font-mono text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded text-xs">{submittedId}</span>. Logged under Reg No: <span className="font-mono font-bold">{currentUserRegNo || regNoInput}</span>.
                      </p>
                      <p className="text-xs text-emerald-700 mt-1.5 font-medium">
                        Copy this code and paste it into the "Track Status" section to view real-time department updates.
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => {
                            setTrackQuery(submittedId);
                            setActiveView('track');
                          }}
                          className="bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-emerald-900 shadow-md cursor-pointer uppercase tracking-wider"
                        >
                          Track Status Now →
                        </button>
                        <button
                          onClick={() => setSubmittedId(null)}
                          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 cursor-pointer"
                        >
                          Submit Another Issue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form 
                  onSubmit={handleSubmit}
                  className="glass-card-hero rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 border border-white/90 shadow-glass relative overflow-hidden space-y-2.5"
                >

                  {/* Student Login Status Indicator Header */}
                  {userLoggedIn && currentUserRegNo ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-900">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Logged in Student Reg No: <strong className="font-mono">{currentUserRegNo}</strong></span>
                      </div>
                      <span className="text-[9px] font-extrabold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">AUTHENTICATED</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-[11px] text-amber-900">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                        <div>
                          <strong className="block text-amber-950 text-[11px]">Student Registration Required</strong>
                          <span className="text-[10px] text-amber-800">Enter Registration Number or login below.</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLoginModalOpen(true)}
                        className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-xs cursor-pointer flex-shrink-0"
                      >
                        Sign In Modal →
                      </button>
                    </div>
                  )}

                  {/* 1. FIELD: Enter Registration Number */}
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <KeyRound className="w-3 h-3 text-emerald-700" />
                      <span>Enter Registration Number</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userLoggedIn && currentUserRegNo ? currentUserRegNo : regNoInput}
                      onChange={(e) => setRegNoInput(e.target.value)}
                      placeholder="Enter your Registration Number"
                      disabled={userLoggedIn && !!currentUserRegNo}
                      className="w-full px-3 py-2 text-[11px] bg-white/90 rounded-xl border border-stone-300 focus:bg-white focus:border-emerald-600 outline-none text-slate-900 font-mono font-bold tracking-wider uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal disabled:bg-emerald-50/70 disabled:text-emerald-950"
                    />
                  </div>

                  {/* 2. FIELD: Select Department (B.Tech Related Departments) */}
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Building2 className="w-3 h-3 text-emerald-700" />
                      <span>Select Department (B.Tech Engineering)</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-[11px] bg-white/90 rounded-xl border border-stone-300 focus:bg-white focus:border-emerald-600 outline-none text-slate-900 font-bold cursor-pointer"
                    >
                      {availableDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. FIELD: Select Issue (University College Related + Other) */}
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <HelpCircle className="w-3 h-3 text-emerald-700" />
                      <span>Select Issue</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <select
                      value={selectedIssue}
                      onChange={(e) => {
                        setSelectedIssue(e.target.value);
                        setAttachmentError(null);
                      }}
                      className="w-full px-3 py-2 text-[11px] bg-white/90 rounded-xl border border-stone-300 focus:bg-white focus:border-emerald-600 outline-none text-slate-900 font-bold cursor-pointer"
                    >
                      {availableCategories.map((issue) => (
                        <option key={issue} value={issue}>
                          {issue}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. FIELD: If "Other" is selected, show mandatory problem input field */}
                  {selectedIssue === 'Other' ? (
                    <div className="animate-slide-up">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <span>Type Your Problem Details</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={otherDescription}
                        onChange={(e) => setOtherDescription(e.target.value)}
                        placeholder="Please type your specific problem here..."
                        className="w-full p-2.5 text-[11px] bg-white rounded-xl border border-emerald-500 focus:border-emerald-700 outline-none text-slate-900 font-sans resize-none shadow-xs"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                        Additional Details / Location Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={extraDetails}
                        onChange={(e) => setExtraDetails(e.target.value)}
                        placeholder="Add specific room, lab, or details if needed..."
                        className="w-full p-2 text-[11px] bg-white/80 rounded-xl border border-stone-200 focus:border-emerald-600 outline-none text-slate-900 font-sans resize-none"
                      />
                    </div>
                  )}

                  {/* Optional Specific Campus Location */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Campus Location (e.g. Block C Room 302, Lab 4)"
                      className="w-full pl-9 pr-3 py-2 text-[11px] bg-white/80 rounded-lg border border-stone-200 focus:border-emerald-600 outline-none text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* 5. FIELD: Attach Photo or Document (MANDATORY VALIDATION) */}
                  <div className="pt-2 border-t border-stone-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Attach Photo / Document</span>
                        <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                          Mandatory *
                        </span>
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-800 hover:text-emerald-900 bg-stone-100 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-stone-300 transition-colors cursor-pointer"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Choose Photo or Document</span>
                      </button>

                      {attachedFiles.length > 0 ? (
                        <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {attachedFiles.length} File(s) Attached
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                          * Photo/Doc Required
                        </span>
                      )}
                    </div>

                    {/* Preview attached pills */}
                    {attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {attachedFiles.map((file, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-white text-emerald-900 border border-emerald-300 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg shadow-2xs"
                          >
                            <span className="truncate max-w-[120px]">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* RED ERROR BOX IF SUBMITTED WITHOUT ATTACHMENT */}
                    {attachmentError && (
                      <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-1.5 font-bold animate-slide-up">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        <span>{attachmentError}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1.5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs tracking-wider py-2.5 rounded-full shadow-md shadow-emerald-900/20 btn-lift transition-all cursor-pointer uppercase"
                    >
                      {isSubmitting ? (
                        <span>Saving Complaint to Database...</span>
                      ) : (
                        <>
                          <span>SUBMIT COMPLAINT</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>

          {/* ==================================================== */}
          {/* RIGHT SIDE HERO CONTENT: VERTICAL FEATURE LIST       */}
          {/* ==================================================== */}
          <div className="hidden lg:flex lg:col-span-3 flex-col space-y-2.5 xl:pl-2">
            
            <div className="flex items-start space-x-2.5 group p-2 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs transition-all duration-200 hover:bg-white hover:shadow-xs">
              <div className="w-8.5 h-8.5 rounded-full bg-pink-100/90 text-pink-800 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold tracking-wider text-slate-900 uppercase">
                  STUDENT VOICE MATTERS
                </h4>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                  Here for every student
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 group p-2 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs transition-all duration-200 hover:bg-white hover:shadow-xs">
              <div className="w-8.5 h-8.5 rounded-full bg-teal-100/90 text-teal-800 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold tracking-wider text-slate-900 uppercase">
                  CONFIDENTIAL & SAFE
                </h4>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                  Anti-ragging & welfare support
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 group p-2 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs transition-all duration-200 hover:bg-white hover:shadow-xs">
              <div className="w-8.5 h-8.5 rounded-full bg-amber-100/90 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold tracking-wider text-slate-900 uppercase">
                  TRANSPARENT TRACKING
                </h4>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                  Track status step-by-step
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 group p-2 rounded-xl bg-white/80 backdrop-blur-xs border border-slate-200/70 shadow-2xs transition-all duration-200 hover:bg-white hover:shadow-xs">
              <div className="w-8.5 h-8.5 rounded-full bg-rose-100/90 text-rose-800 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold tracking-wider text-slate-900 uppercase">
                  BETTER COLLEGE LIFE
                </h4>
                <p className="text-[10px] font-medium text-slate-600 mt-0.5">
                  Empowering campus resolution
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
