import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, ThumbsUp, ThumbsDown, Pencil, Trash2, X, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

export default function ForumPostView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const { user, getMe } = useAuthStore();
  const navigate = useNavigate();

  // Edit states
  const [postEditing, setPostEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  
  const [replyEditingId, setReplyEditingId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');

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
      await api.post(`/forum/${id}/replies`, { content: replyContent });
      setReplyContent('');
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
                {user && user._id === post.author?._id && (
                  <div className="flex gap-2">
                    <button onClick={() => { setPostEditing(true); setEditTitle(post.title); setEditDesc(post.description); }} className="p-1.5 border-2 border-slate-900 rounded-none hover:bg-slate-50 text-slate-700 hover:text-slate-900 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm" title="Edit Post"><Pencil className="w-4 h-4" /></button>
                    <button onClick={handleDeletePost} className="p-1.5 border-2 border-slate-900 rounded-none hover:bg-red-50 text-slate-700 hover:text-red-700 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm" title="Delete Post"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <p className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed mb-6 text-sm">{post.description}</p>
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
                    {user && user._id === reply.author?._id && (
                      <div className="flex gap-2">
                        <button onClick={() => { setReplyEditingId(reply._id); setEditReplyContent(reply.content); }} className="p-1.5 border-2 border-slate-900 rounded-none hover:bg-slate-50 text-slate-600 hover:text-slate-900 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm" title="Edit Reply"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteReply(reply._id)} className="p-1.5 border-2 border-slate-900 rounded-none hover:bg-red-50 text-slate-650 hover:text-red-705 hover:translate-y-[1px] hover:shadow-none transition-colors shadow-neo-sm" title="Delete Reply"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
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
          <button type="submit" className="bg-[#ffb800] text-slate-950 border-2 border-slate-900 font-bold py-2 px-5 rounded-none hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo text-xs">
            POST REPLY
          </button>
        </form>
      )}
    </div>
  );
}
