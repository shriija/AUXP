import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImagePreviewModal({ 
  isOpen, 
  onClose, 
  imageUrls = [], 
  currentIndex = 0, 
  setCurrentIndex, 
  onDownload 
}) {
  if (!isOpen || !imageUrls || imageUrls.length === 0) return null;

  const currentUrl = imageUrls[currentIndex];

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < imageUrls.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white border-4 border-slate-900 rounded-none w-full max-w-4xl shadow-neo font-mono flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-[#ffb800] border-b-4 border-slate-900 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-white text-[10px] px-2 py-0.5 border border-slate-950 uppercase font-black">
              PREVIEW
            </span>
            <h3 className="font-extrabold text-sm text-slate-950 uppercase truncate max-w-[300px] sm:max-w-md">
              ATTACHMENT {currentIndex + 1} OF {imageUrls.length}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="bg-white hover:bg-slate-50 border-2 border-slate-900 p-1 rounded-none shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-950" />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="p-6 flex-1 overflow-y-auto bg-[#f8faf9] flex items-center justify-center min-h-[350px] relative">
          {/* Left Navigation Arrow */}
          {imageUrls.length > 1 && currentIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 z-10 bg-white hover:bg-slate-50 border-2 border-slate-900 p-2 rounded-none shadow-neo hover:translate-y-[1px] hover:shadow-neo-sm transition-all cursor-pointer"
              title="Previous Image"
            >
              <ChevronLeft className="w-5 h-5 text-slate-950" />
            </button>
          )}

          {/* Central Image View */}
          <div className="w-full max-h-[50vh] flex items-center justify-center">
            <img 
              src={currentUrl} 
              alt={`Attachment ${currentIndex + 1}`} 
              className="max-w-full max-h-[50vh] object-contain border-2 border-slate-900 shadow-neo-sm bg-white animate-fadeIn" 
            />
          </div>

          {/* Right Navigation Arrow */}
          {imageUrls.length > 1 && currentIndex < imageUrls.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 z-10 bg-white hover:bg-slate-50 border-2 border-slate-900 p-2 rounded-none shadow-neo hover:translate-y-[1px] hover:shadow-neo-sm transition-all cursor-pointer"
              title="Next Image"
            >
              <ChevronRight className="w-5 h-5 text-slate-950" />
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t-4 border-slate-900 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            CLOSE
          </button>
          <button
            type="button"
            onClick={() => onDownload(currentUrl, `reply-attachment-${currentIndex + 1}.png`)}
            className="bg-primary text-white hover:bg-primary/95 px-4.5 py-2 rounded-none font-bold border-2 border-slate-900 shadow-neo hover:translate-y-[1px] hover:shadow-neo-sm transition-all text-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD
          </button>
        </div>
      </div>
    </div>
  );
}
