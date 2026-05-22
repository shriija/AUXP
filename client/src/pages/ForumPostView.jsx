import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, ThumbsUp, ThumbsDown, Pencil, Trash2, X, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function ForumPostView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuthStore();
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
    } catch (error) {
      console.error(error);
    }
  };

  const handleVoteReply = async (replyId, type) => {
    try {
      await api.post(`/forum/replies/${replyId}/vote`, { type });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/forum/${id}/replies`, { content: replyContent });
      setReplyContent('');
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!data) return <div className="p-8 font-semibold text-slate-700 text-center text-xl">Post not found.</div>;

  const { post, replies } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Link to="/forum" className="inline-flex items-center gap-2 mb-6 text-slate-500 font-semibold hover:text-primary transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Forum
      </Link>

      <div className="bg-white border border-slate-200 rounded-neo shadow-neo p-6 md:p-8 mb-8 flex gap-6">
        {/* Voting Column */}
        <div className="flex flex-col items-center gap-1.5 min-w-[48px]">
          <button onClick={() => handleVotePost('up')} className="p-1.5 rounded-full hover:bg-emerald-50 text-slate-450 hover:text-emerald-600 transition-colors">
            <ThumbsUp className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm text-slate-700">{post.upvotes - post.downvotes}</span>
          <button onClick={() => handleVotePost('down')} className="p-1.5 rounded-full hover:bg-red-50 text-slate-450 hover:text-red-600 transition-colors">
            <ThumbsDown className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1">
          {postEditing ? (
            <div className="space-y-4">
              <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2 font-bold text-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2 font-medium text-base leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 h-32" />
              <div className="flex gap-2">
                <button onClick={handleEditPostSubmit} className="p-2 bg-emerald-500 text-white rounded-neo hover:bg-emerald-600 transition-colors shadow-sm"><Check className="w-5 h-5" /></button>
                <button onClick={() => setPostEditing(false)} className="p-2 bg-slate-100 text-slate-600 rounded-neo hover:bg-slate-200 transition-colors shadow-sm"><X className="w-5 h-5" /></button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900">{post.title}</h1>
                {user && user._id === post.author?._id && (
                  <div className="flex gap-2">
                    <button onClick={() => { setPostEditing(true); setEditTitle(post.title); setEditDesc(post.description); }} className="p-1.5 border border-slate-200 rounded-neo hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors" title="Edit Post"><Pencil className="w-4 h-4" /></button>
                    <button onClick={handleDeletePost} className="p-1.5 border border-slate-200 rounded-neo hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors" title="Delete Post"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <p className="whitespace-pre-wrap font-medium text-base text-slate-700 leading-relaxed mb-6">{post.description}</p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-neo border border-slate-100 inline-flex">
                <span>Posted by <span className="text-slate-750 font-bold">{post.author?.name}</span> on {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {post.isEdited && <span className="italic text-xs ml-1">(edited)</span>}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="text-xl font-extrabold text-slate-800 mb-6">{replies.length} Replies</h3>
      
      <div className="space-y-6 mb-8">
        {replies.map(reply => (
          <div key={reply._id} className="bg-white border border-slate-200 rounded-neo shadow-sm p-6 flex gap-6">
            <div className="flex flex-col items-center gap-1 min-w-[40px]">
              <button onClick={() => handleVoteReply(reply._id, 'up')} className="p-1 hover:text-emerald-600 text-slate-400"><ThumbsUp className="w-5 h-5" /></button>
              <span className="font-extrabold text-sm text-slate-700">{reply.upvotes - reply.downvotes}</span>
              <button onClick={() => handleVoteReply(reply._id, 'down')} className="p-1 hover:text-red-600 text-slate-400"><ThumbsDown className="w-5 h-5" /></button>
            </div>
            <div className="flex-1">
              {replyEditingId === reply._id ? (
                <div className="space-y-2">
                  <textarea value={editReplyContent} onChange={e => setEditReplyContent(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-3 py-2 font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 h-24" />
                  <div className="flex gap-2">
                    <button onClick={() => handleEditReplySubmit(reply._id)} className="p-1.5 bg-emerald-500 text-white rounded-neo hover:bg-emerald-600 transition-colors shadow-sm"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setReplyEditingId(null)} className="p-1.5 bg-slate-100 text-slate-600 rounded-neo hover:bg-slate-200 transition-colors shadow-sm"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <p className="whitespace-pre-wrap font-medium text-slate-700 text-sm md:text-base leading-relaxed">{reply.content}</p>
                    {user && user._id === reply.author?._id && (
                      <div className="flex gap-2">
                        <button onClick={() => { setReplyEditingId(reply._id); setEditReplyContent(reply.content); }} className="p-1.5 border border-slate-200 rounded-neo hover:bg-slate-50 text-slate-500 hover:text-slate-755 transition-colors" title="Edit Reply"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteReply(reply._id)} className="p-1.5 border border-slate-200 rounded-neo hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors" title="Delete Reply"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-2 inline-block">— {reply.author?.name} on {new Date(reply.createdAt).toLocaleDateString()} at {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {reply.isEdited && <span className="italic text-xs ml-1">(edited)</span>}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={handleReplySubmit} className="bg-white border border-slate-200 rounded-neo shadow-sm p-6">
          <h4 className="font-extrabold text-lg text-slate-800 mb-4">Your Answer</h4>
          <textarea 
            required 
            value={replyContent} 
            onChange={e => setReplyContent(e.target.value)} 
            className="w-full bg-white border border-slate-200 rounded-neo px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-slate-800 placeholder:text-slate-400 h-32 mb-4" 
            placeholder="Write your reply here..." 
          />
          <button type="submit" className="bg-primary text-white font-bold py-2 px-5 rounded-neo hover:bg-primary/95 transition-all shadow-sm">
            Post Reply
          </button>
        </form>
      )}
    </div>
  );
}
