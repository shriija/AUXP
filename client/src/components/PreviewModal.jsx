import { useEffect, useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Bookmark, Download, FileText, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function PreviewModal({ isOpen, onClose, resource, user, token, onBookmark, onVote, onDownloadSuccess }) {
  const [textContent, setTextContent] = useState('');
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (isOpen && resource) {
      const isTextFile = resource.fileUrl?.endsWith('.txt') || resource.fileUrl?.endsWith('.md');
      if (isTextFile) {
        const fetchText = async () => {
          try {
            setLoadingText(true);
            const res = await api.get(`/resources/${resource._id}/preview`, {
              params: { token },
              responseType: 'text'
            });
            setTextContent(res.data);
          } catch (e) {
            console.error('Failed to load text preview', e);
            setTextContent('Failed to load file contents.');
          } finally {
            setLoadingText(false);
          }
        };
        fetchText();
      }
    } else {
      setTextContent('');
    }
  }, [isOpen, resource, token]);

  if (!isOpen || !resource) return null;

  const fileExt = resource.fileUrl?.split('.').pop()?.toLowerCase();
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileExt);
  const isPdf = fileExt === 'pdf';
  const isText = ['txt', 'md'].includes(fileExt);

  const previewUrl = `${import.meta.env.VITE_API_URL}/resources/${resource._id}/preview?token=${token}`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-slate-900 rounded-none w-full max-w-4xl shadow-neo font-mono flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="bg-[#ffb800] border-b-4 border-slate-900 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-white text-[10px] px-2 py-0.5 border border-slate-950 uppercase font-black">
              PREVIEW
            </span>
            <h3 className="font-extrabold text-sm text-slate-950 truncate max-w-[500px]">
              {resource.title.toUpperCase()}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="bg-white hover:bg-slate-50 border-2 border-slate-900 p-1 rounded-none shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-950" />
          </button>
        </div>

        {/* Details Bar */}
        <div className="p-4 border-b-2 border-slate-900 bg-[#cbe3db]/40 flex flex-wrap gap-2 text-[10px] font-bold">
          {resource.year && <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 border-2 border-slate-900 rounded-none shadow-neo-sm">{resource.year.toUpperCase()}</span>}
          <span className="bg-teal-50 text-teal-800 px-2 py-0.5 border-2 border-slate-900 rounded-none shadow-neo-sm">{resource.subject.toUpperCase()}</span>
          <span className="bg-pink-50 text-pink-850 px-2 py-0.5 border-2 border-slate-900 rounded-none shadow-neo-sm">{resource.topic.toUpperCase()}</span>
          <span className="bg-[#ffb800] text-slate-950 px-2 py-0.5 border-2 border-slate-900 rounded-none shadow-neo-sm">⭐ QUALITY: {resource.score || 0}</span>
        </div>

        {/* Preview Panel */}
        <div className="p-6 flex-1 overflow-y-auto bg-[#f8faf9] flex items-center justify-center min-h-[300px]">
          {isImage && (
            <div className="w-full max-h-[500px] overflow-auto border-2 border-slate-900 shadow-neo-sm bg-white flex items-center justify-center p-4">
              <img src={previewUrl} alt={resource.title} className="max-w-full max-h-[440px] object-contain" />
            </div>
          )}

          {isPdf && (
            <iframe 
              src={previewUrl} 
              className="w-full h-[500px] border-2 border-slate-900 shadow-neo-sm bg-white" 
              title="PDF Preview"
            />
          )}

          {isText && (
            <div className="w-full">
              {loadingText ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <pre className="w-full h-[500px] overflow-auto border-2 border-slate-900 shadow-neo-sm bg-white p-5 text-xs font-mono whitespace-pre-wrap text-slate-800 leading-relaxed">
                  {textContent}
                </pre>
              )}
            </div>
          )}

          {!isImage && !isPdf && !isText && (
            <div className="w-full max-w-md border-2 border-slate-900 border-dashed bg-white p-8 text-center shadow-neo-sm">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="font-extrabold text-sm text-slate-900 uppercase mb-2">No Online Preview Available</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase max-w-sm mx-auto leading-relaxed">
                This file format ({fileExt?.toUpperCase()}) cannot be displayed directly. Download it to view the notes.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t-4 border-slate-900 bg-white flex flex-wrap justify-between items-center gap-4">
          {/* Left: Voting & Bookmarking */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border-2 border-slate-900 shadow-neo-sm bg-white">
              <button 
                onClick={() => onVote(resource._id, 'up')} 
                className="p-2 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border-r-2 border-slate-900 transition-colors"
                title="Upvote"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <span className="px-3 font-extrabold text-xs text-slate-800">
                {resource.upvotes - resource.downvotes}
              </span>
              <button 
                onClick={() => onVote(resource._id, 'down')} 
                className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-700 border-l-2 border-slate-900 transition-colors"
                title="Downvote"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => onBookmark(resource._id)}
              className={`px-3 py-2 text-xs font-black border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer ${
                resource.bookmarkedBy?.includes(user?._id)
                  ? 'bg-[#ffb800] text-slate-950'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              {resource.bookmarkedBy?.includes(user?._id) ? 'SAVED' : 'SAVE FOR LATER'}
            </button>
          </div>

          {/* Right: Close & Download */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
            >
              CLOSE
            </button>
            <a 
              href={`${import.meta.env.VITE_API_URL}/resources/${resource._id}/download?token=${token}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onDownloadSuccess}
              className="bg-primary text-white hover:bg-primary/95 px-4.5 py-2 rounded-none font-bold border-2 border-slate-900 shadow-neo hover:translate-y-[1px] hover:shadow-neo-sm transition-all text-xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              DOWNLOAD NOTES
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
