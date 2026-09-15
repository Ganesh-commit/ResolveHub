import React, { useState } from 'react';
import { X, MapPin, Paperclip, Send } from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

export const ComplaintDetailModal: React.FC = () => {
  const { selectedComplaint, setSelectedComplaint, addToast } = useResolveHub();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{ id: string; author: string; text: string; date: string }[]>([
    {
      id: 'c1',
      author: 'Officer Marcus Vance (Electrical Dept)',
      text: 'Field crew assigned. New transformer unit ordered and arriving on site.',
      date: 'Yesterday, 14:10'
    }
  ]);

  if (!selectedComplaint) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 8),
        author: 'You (Citizen)',
        text: commentText,
        date: 'Just now'
      }
    ]);

    setCommentText('');
    addToast('info', 'Comment Added', 'Your response has been attached to official grievance file.');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setSelectedComplaint(null)}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedComplaint(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-stone-200/80 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-extrabold text-white bg-emerald-800 px-3 py-1 rounded-xl">
              {selectedComplaint.id}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">
              {selectedComplaint.category}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mt-2 font-heading">
            {selectedComplaint.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {selectedComplaint.location} • Submitted on {selectedComplaint.submittedAt}
          </p>
        </div>

        {/* Complaint Full Body */}
        <div className="space-y-6">
          
          <div>
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
              Detailed Issue Description
            </h4>
            <div className="p-4 rounded-2xl bg-stone-50 text-xs sm:text-sm text-slate-700 leading-relaxed border border-stone-200/80">
              {selectedComplaint.description}
            </div>
          </div>

          {/* Assigned Officer & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Assigned Department</span>
              <div className="text-xs font-extrabold text-slate-900 mt-0.5">{selectedComplaint.department}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Lead Field Officer</span>
              <div className="text-xs font-extrabold text-slate-900 mt-0.5">{selectedComplaint.assignedOfficer}</div>
            </div>
          </div>

          {/* Attachments Section */}
          {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
            <div>
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Attached Media & Evidence
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedComplaint.attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-stone-100 p-2.5 rounded-xl border border-stone-200 text-xs text-slate-700">
                    <Paperclip className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold">{file.name}</span>
                    <span className="text-[10px] text-slate-400">({file.size})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discussion & Updates Log */}
          <div className="border-t border-stone-100 pt-5">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
              Official Communication & Citizen Notes
            </h4>
            <div className="space-y-3 mb-4">
              {comments.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>{c.author}</span>
                    <span className="text-[10px] font-normal text-slate-400">{c.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a follow-up note or additional information..."
                className="flex-1 px-4 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none"
              />
              <button
                type="submit"
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
