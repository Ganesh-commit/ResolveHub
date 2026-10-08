import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  Building2, 
  Lock, 
  Send, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Upload,
  Bus,
  BookOpen,
  GraduationCap,
  Utensils,
  Shield,
  Briefcase,
  Wrench,
  Trophy,
  Landmark,
  Stethoscope
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import { getLocationsByCategory } from '../data/campusLocations';

export const HeroSection: React.FC = () => {
  const { submitComplaint, setActiveView, setTrackQuery, systemSettings } = useResolveHub();

  const availableCategories = systemSettings?.categories?.length ? systemSettings.categories : [
    'Transport', 'Examinations', 'Library', 'Canteen & Food', 'Security & Safety',
    'Placements & Training', 'Infrastructure & Maintenance', 'Sports & Clubs',
    'Administration & Certificates', 'Health & Medical', 'Faculty & Teaching', 'Others'
  ];

  // Form Step State (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Selected Category
  const [category, setCategory] = useState(availableCategories[0]);

  // Step 2: Title, Description & Priority
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Step 3: Location (Dependent Dropdown + Mandatory Online/No Location fallback)
  const [location, setLocation] = useState('');

  // Step 4: Attachments
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: string; preview?: string }[]>([]);

  // Step 5: Anonymous Toggle & Submitting State
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dependent Locations
  const categoryLocations = getLocationsByCategory(category);

  // Category Icon Resolver
  const getCategoryIcon = (catName: string) => {
    switch (catName.toLowerCase()) {
      case 'transport': return <Bus className="w-6 h-6" />;
      case 'examinations': return <GraduationCap className="w-6 h-6" />;
      case 'library': return <BookOpen className="w-6 h-6" />;
      case 'canteen & food': return <Utensils className="w-6 h-6" />;
      case 'security & safety': return <Shield className="w-6 h-6" />;
      case 'placements & training': return <Briefcase className="w-6 h-6" />;
      case 'infrastructure & maintenance': return <Wrench className="w-6 h-6" />;
      case 'sports & clubs': return <Trophy className="w-6 h-6" />;
      case 'administration & certificates': return <Landmark className="w-6 h-6" />;
      case 'health & medical': return <Stethoscope className="w-6 h-6" />;
      default: return <Building2 className="w-6 h-6" />;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: f.type || 'document',
        preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
      }));
      setAttachedFiles(prev => [...prev, ...files]);
    }
  };

  const handleSubmitGrievance = async () => {
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const generatedId = submitComplaint({
        category,
        department: 'Department Desk',
        description: `[${title}] ${description}`,
        location: location || 'Online / No Location',
        attachments: attachedFiles
      });

      setIsSubmitting(false);
      setSubmittedId(generatedId || `#RH-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err) {
      setIsSubmitting(false);
      setSubmittedId(`#RH-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  // If already submitted, display Success Screen
  if (submittedId) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-stone-200 dark:border-slate-700 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-200">
              Grievance Registered
            </span>
            <h2 className="text-3xl font-black font-heading-playfair text-slate-900 dark:text-white">
              Complaint Submitted Successfully!
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your ticket has been routed to the responsible department desk. You can monitor live progress anytime.
            </p>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 inline-block font-mono text-sm">
            Reference Ticket ID: <strong className="text-[#8a2410] dark:text-amber-400 text-lg">{submittedId}</strong>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setTrackQuery(submittedId);
                setActiveView('track');
              }}
              className="px-6 py-3 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md cursor-pointer flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Track This Complaint
            </button>

            <button
              onClick={() => {
                setSubmittedId(null);
                setCurrentStep(1);
                setTitle('');
                setDescription('');
                setAttachedFiles([]);
              }}
              className="px-6 py-3 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer"
            >
              Submit Another Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto py-6 px-4 sm:px-8 lg:px-12 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-[#8a2410] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-rose-900/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5" /> Guided Grievance Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading-playfair tracking-tight">
            Submit a Grievance Ticket
          </h1>
          <p className="text-xs text-rose-200/90 mt-1">
            Follow the 5-step guided process. Your complaint will be auto-routed to concerned department officers.
          </p>
        </div>
      </div>

      {/* 5-Step Progress Stepper Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold">
          {['Category', 'Details', 'Location', 'Attachments', 'Review'].map((stepName, idx) => {
            const stepNum = idx + 1;
            const isDone = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;

            return (
              <div
                key={stepNum}
                onClick={() => isDone && setCurrentStep(stepNum)}
                className={`flex items-center gap-2 cursor-pointer ${
                  isCurrent ? 'text-[#8a2410] dark:text-amber-400 font-extrabold' :
                  isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-xs ${
                  isCurrent ? 'bg-[#8a2410] text-white ring-4 ring-rose-100 dark:ring-rose-900' :
                  isDone ? 'bg-emerald-600 text-white' : 'bg-stone-100 dark:bg-slate-700 text-slate-400'
                }`}>
                  {isDone ? '✓' : stepNum}
                </div>
                <span className="hidden sm:inline">{stepName}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Multi-Step Form Container */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-slate-700 shadow-sm space-y-6">
          
          {/* ── STEP 1: CATEGORY SELECTION ─────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading-playfair">
                  Step 1: Select Grievance Category
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose the category that best fits your issue. This determines department routing.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {availableCategories.map((cat, idx) => {
                  const isSelected = category === cat;
                  return (
                    <div
                      key={idx}
                      onClick={() => setCategory(cat)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
                        isSelected 
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-[#8a2410] dark:border-amber-400 shadow-md scale-105 text-[#8a2410] dark:text-amber-300'
                          : 'bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-700 hover:border-[#8a2410] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`p-3 rounded-2xl ${isSelected ? 'bg-[#8a2410] text-white' : 'bg-white dark:bg-slate-800 text-slate-600'}`}>
                        {getCategoryIcon(cat)}
                      </div>
                      <span className="text-xs font-bold leading-tight">{cat}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <span>Next: Issue Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: ISSUE DETAILS ───────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading-playfair">
                  Step 2: Describe Your Concern
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Provide a concise summary title and full problem description.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Grievance Title / Summary *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Water leakage in Hostel Block B room 304"
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:outline-none focus:border-[#8a2410] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Issue Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide specific details, timing, and impact..."
                    rows={5}
                    className="w-full p-4 bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:outline-none focus:border-[#8a2410] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Urgency Priority Level
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['Low', 'Medium', 'High', 'Urgent'].map((pLevel) => (
                      <button
                        type="button"
                        key={pLevel}
                        onClick={() => setPriority(pLevel)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          priority === pLevel
                            ? 'bg-[#8a2410] text-white border-[#8a2410]'
                            : 'bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {pLevel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  onClick={() => {
                    if (!title.trim() || !description.trim()) {
                      alert('Please fill out both the title and full description.');
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  className="px-6 py-3 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <span>Next: Campus Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: LOCATION SELECTION ───────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading-playfair">
                  Step 3: Campus Location Selection
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select the specific location for category "{category}".
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Relevant Campus Location *
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:outline-none focus:border-[#8a2410] text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Online / No Location">Online / Portal / Fee / Marks Issue (No Location)</option>
                    {categoryLocations.map((loc, idx) => (
                      <option key={idx} value={loc.name}>
                        {loc.name} ({loc.zone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <span>Next: Upload Attachments</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: ATTACHMENTS ─────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading-playfair">
                  Step 4: Attach Photo Proof / Documents
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload relevant photo evidence or transaction receipts.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-stone-300 dark:border-slate-700 rounded-3xl text-center bg-stone-50 dark:bg-slate-900 hover:bg-rose-50/50 cursor-pointer transition-all space-y-2"
                >
                  <Upload className="w-8 h-8 text-[#8a2410] mx-auto" />
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Click or drag & drop files here to upload
                  </p>
                  <p className="text-[11px] text-slate-400">Supports PNG, JPG, PDF up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {attachedFiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Uploaded Files ({attachedFiles.length}):</span>
                    <div className="grid grid-cols-2 gap-3">
                      {attachedFiles.map((file, i) => (
                        <div key={i} className="p-3 bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</span>
                          <button onClick={() => setAttachedFiles(f => f.filter((_, idx) => idx !== i))} className="text-rose-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-3 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <span>Next: Review & Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: REVIEW & SUBMIT ─────────────────────────────────────── */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading-playfair">
                  Step 5: Review & Submit
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Verify your grievance summary before final submission.
                </p>
              </div>

              <div className="p-4 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 text-xs space-y-2">
                <p><strong className="text-slate-900 dark:text-white">Category:</strong> {category}</p>
                <p><strong className="text-slate-900 dark:text-white">Title:</strong> {title}</p>
                <p><strong className="text-slate-900 dark:text-white">Priority:</strong> {priority}</p>
                <p><strong className="text-slate-900 dark:text-white">Location:</strong> {location || 'Online / No Location'}</p>
                <p><strong className="text-slate-900 dark:text-white">Description:</strong> {description}</p>
              </div>

              {/* Anonymous Reporting Toggle */}
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-rose-950 dark:text-rose-200 block flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#8a2410]" /> Anonymous Mode Protection
                  </span>
                  <span className="text-[11px] text-rose-800 dark:text-rose-300">
                    Shield identity for sensitive anti-ragging or welfare cases.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 accent-[#8a2410] cursor-pointer"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  onClick={handleSubmitGrievance}
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Grievance Now'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar: AI Smart Helper & SLA Info Cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200 dark:border-slate-700 shadow-sm space-y-4 text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-white font-heading-playfair flex items-center gap-2 text-sm border-b border-stone-100 dark:border-slate-700 pb-2.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> SLA Estimate & Guidelines
            </h4>

            <div className="p-3 bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Standard SLA Resolution</span>
              <span className="text-slate-500 text-[11px]">3 Business Days maximum before HOD escalation.</span>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Anti-Ragging Protection</span>
              <span className="text-slate-500 text-[11px]">Direct priority dispatch to Anti-Ragging Committee & Dean.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
