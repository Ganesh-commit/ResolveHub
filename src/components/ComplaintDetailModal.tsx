import React, { useState } from 'react';
import { X, MapPin, Paperclip, Send } from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import { StatusTimelineStepper } from './StatusTimelineStepper';

export const ComplaintDetailModal: React.FC = () => {
  const { selectedComplaint, setSelectedComplaint, addToast } = useResolveHub();
  const [commentText, setCommentText] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
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
        author: 'You (Student)',
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
            <span className="font-mono text-xs font-extrabold text-white bg-[#8B2414] px-3 py-1 rounded-xl">
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

          {/* SLA Status Timeline Stepper */}
          <StatusTimelineStepper
            currentStatus={selectedComplaint.status}
            timeline={selectedComplaint.timeline}
            escalationLevel={selectedComplaint.escalationLevel}
            escalationReason={selectedComplaint.escalationReason}
            slaDeadline={selectedComplaint.slaDeadline}
          />
          
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
          <div>
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
              Attached Media & Evidence
            </h4>
            {!selectedComplaint.attachments || selectedComplaint.attachments.length === 0 ? (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-slate-400 text-xs text-center font-medium">
                No attachments uploaded for this complaint.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedComplaint.attachments.map((att: any, i: number) => {
                  const rawUrl = att.url || (att.fileName ? `http://localhost:3001/uploads/attachments/${att.fileName}` : '');
                  const url = rawUrl.startsWith('/') ? `http://localhost:3001${rawUrl}` : rawUrl;
                  const isImage = att.type === 'image' || att.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(att.name || att.originalName || '');
                  const isPdf = att.type === 'pdf' || att.mimeType?.includes('pdf') || /\.pdf$/i.test(att.name || att.originalName || '');
                  const displayName = att.originalName || att.name || `Attachment ${i + 1}`;

                  if (isImage && url) {
                    return (
                      <div key={i} className="group relative p-2.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                        <div 
                          onClick={() => setLightboxImage(url)} 
                          className="cursor-pointer overflow-hidden rounded-xl border border-stone-200 bg-black/5 aspect-video relative group-hover:opacity-90 transition-opacity"
                        >
                          <img src={url} alt={displayName} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                            Preview
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800 truncate max-w-[140px]">{displayName}</span>
                          <a href={url} target="_blank" rel="noopener noreferrer" download className="text-indigo-600 font-extrabold hover:underline">
                            Download
                          </a>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={i} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                          {isPdf ? <Paperclip className="w-4 h-4 text-rose-600" /> : <Paperclip className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate">{displayName}</p>
                          <p className="text-[10px] text-slate-400">{att.size || 'Attachment'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {url ? (
                          <>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-slate-800 font-bold text-[10px] rounded-lg">
                              View
                            </a>
                            <a href={url} download target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-indigo-900 text-white font-bold text-[10px] rounded-lg">
                              Download
                            </a>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">{att.size || 'Uploaded'}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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

      {/* Lightbox Image Preview Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxImage(null);
          }}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white font-bold text-sm bg-stone-800 p-2 rounded-full hover:bg-stone-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxImage} alt="Attachment Preview" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
