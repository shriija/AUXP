import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { BACKEND_URL } from '../services/api';
import { Loader2, ArrowLeft, ThumbsUp, ThumbsDown, Pencil, Trash2, X, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import ImagePreviewModal from '../components/ImagePreviewModal';
import DeleteReasonModal from '../components/DeleteReasonModal';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const handleDownloadImage = async (imageUrl, filename) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'downloaded-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download image', err);
    window.open(imageUrl, '_blank');
  }
};

const getReplyImages = (reply) => {
  if (reply.imageUrls && reply.imageUrls.length > 0) {
    return reply.imageUrls;
  }
  return reply.imageUrl ? [reply.imageUrl] : [];
};

export default function ForumPostView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [selectedReplyImage, setSelectedReplyImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const { user, getMe } = useAuthStore();
  const navigate = useNavigate();
  const [adminDeleteTarget, setAdminDeleteTarget] = useState(null);

  // Edit states
  const [postEditing, setPostEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  
  const [replyEditingId, setReplyEditingId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');

  // Image preview states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Manage memory-safe URL object preview for selected file
  useEffect(() => {
    if (!selectedReplyImage) {
      setImagePreview('');
      return;
    }
    const url = URL.createObjectURL(selectedReplyImage);
    setImagePreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedReplyImage]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/forum/${id}`);
      setData(res.data);
    } catch (error) {
      console.error(error);
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/forum/${id}`);
      navigate('/forum');
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdminDeleteClick = (itemId, itemType) => {
    setAdminDeleteTarget({ itemId, itemType });
  };

  const executeAdminDelete = async (reason) => {
    if (!adminDeleteTarget) return;
    try {
      const { itemId, itemType } = adminDeleteTarget;
      await api.post('/admin/delete-content', { itemId, itemType, reason });
      useToastStore.getState().addToast(`${itemType.toUpperCase()} DELETED BY ADMIN!`, 'info');
      setAdminDeleteTarget(null);
      if (itemType === 'post') {
        navigate('/forum');
      } else {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to admin-delete content', error);
      useToastStore.getState().addToast('FAILED TO DELETE CONTENT', 'error');
    }
  };

  const handleEditPostSubmit = async () => {
    try {
      await api.put(`/forum/${id}`, { title: editTitle, description: editDesc });
      setPostEditing(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await api.delete(`/forum/replies/${replyId}`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditReplySubmit = async (replyId) => {
    try {
      await api.put(`/forum/replies/${replyId}`, { content: editReplyContent });
      setReplyEditingId(null);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleVotePost = async (type) => {
    try {
      await api.post(`/forum/${id}/vote`, { type });
      fetchData();
      getMe();
      useToastStore.getState().addToast(type === 'up' ? 'POST UPVOTED!' : 'POST DOWNVOTED!', 'success');
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast('VOTE FAILED', 'error');
    }
  };

  const handleVoteReply = async (replyId, type) => {
    try {
      await api.post(`/forum/replies/${replyId}/vote`, { type });
      fetchData();
      getMe();
      useToastStore.getState().addToast(type === 'up' ? 'REPLY UPVOTED!' : 'REPLY DOWNVOTED!', 'success');
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast('VOTE FAILED', 'error');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('content', replyContent);
      if (selectedReplyImage) {
        formData.append('image', selectedReplyImage);
      }

      await api.post(`/forum/${id}/replies`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setReplyContent('');
      setSelectedReplyImage(null);
      fetchData();
      getMe();
      useToastStore.getState().addToast('REPLY SUBMITTED FOR ADMIN REVIEW!', 'success');
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast('FAILED TO POST REPLY', 'error');
    }
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!data) return <div className="p-8 font-semibold text-slate-700 text-center text-xl">Post not found.</div>;

  const { post, replies } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Link to="/forum" className="inline-flex items-center gap-2 mb-6 text-slate-600 font-bold hover:text-primary transition-colors text-xs">
        <ArrowLeft className="w-4 h-4" /> BACK TO FORUM
      </Link>

      <div className="bg-white border-2 border-slate-900 rounded-none shadow-neo p-6 md:p-8 mb-8 flex gap-6">
        {/* Voting Column */}
        <div className="flex flex-col items-center gap-1.5 min-w-[48px] font-mono">
          <button onClick={() => handleVotePost('up')} className="p-1 rounded-none border-2 border-transparent hover:border-slate-900 hover:bg-emerald-50 text-slate-550 hover:text-emerald-700 transition-colors">
            <ThumbsUp className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-xs text-slate-850">{post.upvotes - post.downvotes}</span>
          <button onClick={() => handleVotePost('down')} className="p-1 rounded-none border-2 border-transparent hover:border-slate-900 hover:bg-red-50 text-slate-550 hover:text-red-700 transition-colors">
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1">
          {postEditing ? (
            <div className="space-y-4">
              <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 font-bold text-base outline-none focus:bg-slate-50 text-slate-800" />
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 font-semibold text-xs leading-relaxed outline-none focus:bg-slate-50 h-32 text-slate-700" />
              <div className="flex gap-2">
                <button onClick={handleEditPostSubmit} className="p-1.5 bg-emerald-500 text-white rounded-none border-2 border-slate-900 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm"><Check className="w-4 h-4" /></button>
                <button onClick={() => setPostEditing(false)} className="p-1.5 bg-white text-slate-700 rounded-none border-2 border-slate-900 hover:bg-slate-50 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm"><X className="w-4 h-4" /></button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold text-slate-900">{post.title.toUpperCase()}</h1>
                  {post.approvalStatus === 'pending' && (
                    <span className="bg-amber-100 text-amber-800 border border-slate-900 px-2 py-0.5 text-[9px] font-black uppercase animate-pulse">
                      ⏳ IN REVIEW
                    </span>
                  )}
                  {post.approvalStatus === 'rejected' && (
                    <span className="bg-red-100 text-red-850 border border-slate-900 px-2 py-0.5 text-[9px] font-black uppercase" title={`Reason: ${post.rejectionReason}`}>
                      ❌ REJECTED (REASON: {post.rejectionReason || 'None specified'})
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {user && user._id === post.author?._id && (
                    <>
                      <button onClick={() => { setPostEditing(true); setEditTitle(post.title); setEditDesc(post.description); }} className="p-1.5 border-2 border-slate-900 rounded-none hover:bg-slate-50 text-slate-700 hover:text-slate-900 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm" title="Edit Post"><Pencil className="w-4 h-4" /></button>
                      <button onClick={handleDeletePost} className="p-1.5 border-2 border-slate-900 rounded-none hover:bg-red-50 text-slate-700 hover:text-red-700 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm" title="Delete Post"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                  {user && user.role === 'admin' && (
                    <button
                      onClick={() => handleAdminDeleteClick(post._id, 'post')}
                      className="bg-red-500 hover:bg-red-650 text-white font-extrabold text-xs px-3 py-1.5 border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                      id="admin-delete-post-btn"
                    >
                      ADMIN DELETE
                    </button>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed mb-6 text-sm">{post.description}</p>
              {post.imageUrl && (
                <div className="mt-4 mb-6 border-2 border-slate-900 shadow-neo p-2 inline-block bg-slate-50 relative group">
                  <img 
                    src={getImageUrl(post.imageUrl)} 
                    alt="Post Attachment" 
                    className="max-h-96 object-contain animate-fadeIn cursor-pointer hover:opacity-95 transition-opacity" 
                    onClick={() => {
                      setPreviewUrls([getImageUrl(post.imageUrl)]);
                      setPreviewIndex(0);
                      setIsPreviewOpen(true);
                    }}
                  />
                  <div className="mt-2 flex gap-2 justify-start border-t border-slate-200 pt-2 font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrls([getImageUrl(post.imageUrl)]);
                        setPreviewIndex(0);
                        setIsPreviewOpen(true);
                      }}
                      className="text-[10px] font-extrabold text-slate-700 hover:text-primary transition-colors uppercase px-2 py-0.5 border border-slate-900 bg-white shadow-neo-sm hover:translate-y-[0.5px] hover:shadow-none"
                    >
                      View Full Size
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadImage(getImageUrl(post.imageUrl), `post-attachment-${post._id}.png`)}
                      className="text-[10px] font-extrabold text-slate-700 hover:text-emerald-700 transition-colors uppercase px-2 py-0.5 border border-slate-900 bg-white shadow-neo-sm hover:translate-y-[0.5px] hover:shadow-none"
                    >
                      Download Image
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 bg-[#cbe3db]/40 px-3 py-1.5 rounded-none border-2 border-slate-900 inline-flex shadow-neo-sm">
                <span>ASKED BY <span className="text-slate-800 font-extrabold">{post.author?.name?.toUpperCase()}</span> ON {new Date(post.createdAt).toLocaleDateString()} AT {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()} {post.isEdited && <span className="italic text-[9px] ml-1 text-primary">(EDITED)</span>}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-slate-800 mb-6 uppercase">{replies.length} REPLIES</h3>
      
      <div className="space-y-6 mb-8">
        {replies.map(reply => (
          <div key={reply._id} className="bg-white border-2 border-slate-900 rounded-none shadow-neo p-6 flex gap-6">
            <div className="flex flex-col items-center gap-1.5 min-w-[40px] font-mono">
              <button onClick={() => handleVoteReply(reply._id, 'up')} className="p-1 hover:text-emerald-700 text-slate-500"><ThumbsUp className="w-4 h-4" /></button>
              <span className="font-extrabold text-xs text-slate-800">{reply.upvotes - reply.downvotes}</span>
              <button onClick={() => handleVoteReply(reply._id, 'down')} className="p-1 hover:text-red-700 text-slate-500"><ThumbsDown className="w-4 h-4" /></button>
            </div>
            <div className="flex-1">
              {replyEditingId === reply._id ? (
                <div className="space-y-2">
                  <textarea value={editReplyContent} onChange={e => setEditReplyContent(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-3 py-2 font-bold text-xs outline-none focus:bg-slate-50 h-24 text-slate-700" />
                  <div className="flex gap-2">
                    <button onClick={() => handleEditReplySubmit(reply._id)} className="p-1.5 bg-emerald-500 text-white rounded-none border-2 border-slate-900 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setReplyEditingId(null)} className="p-1.5 bg-white text-slate-700 rounded-none border-2 border-slate-900 hover:bg-slate-50 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="whitespace-pre-wrap font-medium text-slate-700 text-sm leading-relaxed">{reply.content}</p>
                      {getReplyImages(reply).length > 0 && (
                        <div className="mt-3 mb-2 flex flex-wrap gap-3">
                          {getReplyImages(reply).map((imgUrl, index) => (
                            <div key={index} className="border-2 border-slate-900 p-1 bg-slate-50 shadow-neo-sm inline-block relative group animate-fadeIn">
                              <img 
                                src={getImageUrl(imgUrl)} 
                                alt={`Reply Attachment ${index + 1}`} 
                                className="max-h-48 object-contain cursor-pointer hover:opacity-95 transition-opacity" 
                                onClick={() => {
                                  setPreviewUrls(getReplyImages(reply).map(url => getImageUrl(url)));
                                  setPreviewIndex(index);
                                  setIsPreviewOpen(true);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      {reply.approvalStatus === 'pending' && (
                        <div className="mt-2 text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 border border-amber-300 inline-block font-black uppercase animate-pulse">
                          ⏳ REPLY IN REVIEW
                        </div>
                      )}
                      {reply.approvalStatus === 'rejected' && (
                        <div className="mt-2 text-[9px] bg-red-50 text-red-700 px-1.5 py-0.5 border border-red-300 inline-block font-black uppercase" title={`Reason: ${reply.rejectionReason}`}>
                          ❌ REPLY REJECTED (REASON: {reply.rejectionReason || 'None specified'})
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {user && user._id === reply.author?._id && (
                        <>
                          <button onClick={() => { setReplyEditingId(reply._id); setEditReplyContent(reply.content); }} className="p-1.5 border-2 border-slate-900 rounded-none hover:bg-slate-50 text-slate-600 hover:text-slate-900 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm" title="Edit Reply"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteReply(reply._id)} className="p-1.5 border-2 border-slate-900 rounded-none hover:bg-red-50 text-slate-650 hover:text-red-705 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm" title="Delete Reply"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                      {user && user.role === 'admin' && (
                        <button
                          onClick={() => handleAdminDeleteClick(reply._id, 'reply')}
                          className="bg-red-500 hover:bg-red-650 text-white font-extrabold text-[10px] px-2 py-1 border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                          id={`admin-delete-reply-btn-${reply._id}`}
                        >
                          ADMIN DELETE
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-600 mt-2 inline-block">— {reply.author?.name?.toUpperCase()} ON {new Date(reply.createdAt).toLocaleDateString()} AT {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()} {reply.isEdited && <span className="italic text-[9px] ml-1 text-primary">(EDITED)</span>}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={handleReplySubmit} className="bg-white border-2 border-slate-900 rounded-none shadow-neo p-6 relative pt-8 font-mono">
          <div className="absolute -top-3.5 left-4 bg-primary px-3 py-1 text-xs text-white uppercase font-bold border-2 border-slate-900">
            YOUR_ANSWER
          </div>
          <textarea 
            required 
            value={replyContent} 
            onChange={e => setReplyContent(e.target.value)} 
            className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-3 outline-none focus:bg-slate-50 transition-all font-bold text-slate-800 placeholder:text-slate-400 h-32 mb-4 text-xs" 
            placeholder="Write your reply here..." 
          />
          <div className="mb-4">
            <label className="block text-xs font-bold mb-1.5 text-slate-700">ATTACH IMAGE (OPTIONAL)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => setSelectedReplyImage(e.target.files[0] || null)} 
              className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-slate-800 text-xs cursor-pointer" 
            />
            {selectedReplyImage && (
              <div className="mt-2.5 p-2.5 bg-slate-50 border-2 border-dashed border-slate-900 text-[10px] font-bold text-slate-700 space-y-1.5 font-mono shadow-neo-xs">
                <p className="font-extrabold uppercase border-b-2 border-slate-900/10 pb-1 mb-1.5 text-slate-900">SELECTED IMAGE:</p>
                <div className="max-w-xs relative bg-white border-2 border-slate-900 p-1.5 shadow-neo-xs flex flex-col justify-between group">
                  <div className="relative aspect-video w-full bg-slate-100 border border-slate-300 mb-1.5 overflow-hidden">
                    {imagePreview && (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedReplyImage(null)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-650 text-white p-1 border border-slate-900 shadow-neo-xs text-[9px] font-black uppercase transition-all"
                    >
                      X
                    </button>
                  </div>
                  <span className="truncate max-w-full text-[8px] text-slate-650 block mb-0.5">{selectedReplyImage.name}</span>
                  <span className="text-[8px] text-slate-550 font-extrabold">{(selectedReplyImage.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            )}
          </div>
          <button type="submit" className="bg-[#ffb800] text-slate-950 border-2 border-slate-900 font-bold py-2 px-5 rounded-none hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo text-xs">
            POST REPLY
          </button>
        </form>
      )}
      <ImagePreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        imageUrls={previewUrls} 
        currentIndex={previewIndex} 
        setCurrentIndex={setPreviewIndex} 
        onDownload={handleDownloadImage}
      />
      <DeleteReasonModal
        isOpen={!!adminDeleteTarget}
        onClose={() => setAdminDeleteTarget(null)}
        onSubmit={executeAdminDelete}
        title={adminDeleteTarget?.itemType === 'post' ? "Admin Delete Post" : "Admin Delete Reply"}
        placeholder={`State reason for deleting this forum ${adminDeleteTarget?.itemType || 'item'}...`}
      />
    </div>
  );
}
