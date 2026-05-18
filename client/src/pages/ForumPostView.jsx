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

  if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>;
  if (!data) return <div className="p-8 font-black text-center text-xl">Post not found.</div>;

  const { post, replies } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Link to="/forum" className="inline-flex items-center gap-2 mb-6 text-black font-bold hover:underline">
        <ArrowLeft className="w-5 h-5" /> Back to Forum
      </Link>

      <div className="bg-white border-4 border-black rounded-neo shadow-neo p-6 md:p-8 mb-8 flex gap-6">
        <div className="flex flex-col items-center gap-2 min-w-[50px]">
          <button onClick={() => handleVotePost('up')} className="p-2 border-2 border-transparent rounded-neo hover:border-black hover:bg-green-300 transition-colors">
            <ThumbsUp className="w-6 h-6" />
          </button>
          <span className="font-black text-xl">{post.upvotes - post.downvotes}</span>
          <button onClick={() => handleVotePost('down')} className="p-2 border-2 border-transparent rounded-neo hover:border-black hover:bg-red-300 transition-colors">
            <ThumbsDown className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1">
          {postEditing ? (
            <div className="space-y-4">
              <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2 font-black text-2xl outline-none focus:bg-yellow-50" />
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2 font-medium text-lg leading-relaxed outline-none focus:bg-yellow-50 h-32" />
              <div className="flex gap-2">
                <button onClick={handleEditPostSubmit} className="p-2 bg-green-300 border-2 border-black rounded-neo shadow-neo-sm hover:translate-y-[1px]"><Check className="w-5 h-5" /></button>
                <button onClick={() => setPostEditing(false)} className="p-2 bg-red-300 border-2 border-black rounded-neo shadow-neo-sm hover:translate-y-[1px]"><X className="w-5 h-5" /></button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-black">{post.title}</h1>
                {user && user._id === post.author?._id && (
                  <div className="flex gap-2">
                    <button onClick={() => { setPostEditing(true); setEditTitle(post.title); setEditDesc(post.description); }} className="p-2 border-2 border-black rounded-neo hover:bg-yellow-100 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={handleDeletePost} className="p-2 border-2 border-black rounded-neo hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <p className="whitespace-pre-wrap font-medium text-lg leading-relaxed mb-6">{post.description}</p>
              <div className="flex items-center gap-2 text-sm font-bold bg-secondary/20 inline-flex px-4 py-2 rounded-neo border-2 border-black">
                <span>Posted by {post.author?.name} on {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {post.isEdited && <span className="italic text-xs ml-1">(edited)</span>}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="text-2xl font-black mb-6">{replies.length} Replies</h3>
      
      <div className="space-y-6 mb-8">
        {replies.map(reply => (
          <div key={reply._id} className="bg-white border-4 border-black rounded-neo shadow-neo p-6 flex gap-6">
            <div className="flex flex-col items-center gap-1 min-w-[40px]">
              <button onClick={() => handleVoteReply(reply._id, 'up')} className="p-1 hover:text-green-600"><ThumbsUp className="w-5 h-5" /></button>
              <span className="font-black text-lg">{reply.upvotes - reply.downvotes}</span>
              <button onClick={() => handleVoteReply(reply._id, 'down')} className="p-1 hover:text-red-600"><ThumbsDown className="w-5 h-5" /></button>
            </div>
            <div className="flex-1">
              {replyEditingId === reply._id ? (
                <div className="space-y-2">
                  <textarea value={editReplyContent} onChange={e => setEditReplyContent(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-3 py-2 font-medium outline-none focus:bg-yellow-50 h-24" />
                  <div className="flex gap-2">
                    <button onClick={() => handleEditReplySubmit(reply._id)} className="p-1.5 bg-green-300 border-2 border-black rounded-neo shadow-neo-sm hover:translate-y-[1px]"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setReplyEditingId(null)} className="p-1.5 bg-red-300 border-2 border-black rounded-neo shadow-neo-sm hover:translate-y-[1px]"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <p className="whitespace-pre-wrap font-medium">{reply.content}</p>
                    {user && user._id === reply.author?._id && (
                      <div className="flex gap-2">
                        <button onClick={() => { setReplyEditingId(reply._id); setEditReplyContent(reply.content); }} className="p-1.5 border-2 border-black rounded-neo hover:bg-yellow-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteReply(reply._id)} className="p-1.5 border-2 border-black rounded-neo hover:bg-red-200 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-bold text-black/60 mt-1">— {reply.author?.name} on {new Date(reply.createdAt).toLocaleDateString()} at {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {reply.isEdited && <span className="italic text-xs ml-1">(edited)</span>}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={handleReplySubmit} className="bg-white border-4 border-black rounded-neo shadow-neo p-6">
          <h4 className="font-black text-xl mb-4">Your Answer</h4>
          <textarea 
            required 
            value={replyContent} 
            onChange={e => setReplyContent(e.target.value)} 
            className="w-full bg-white border-2 border-black rounded-neo px-4 py-3 outline-none focus:shadow-neo-sm focus:bg-yellow-50 transition-colors font-medium text-black placeholder:text-black/40 h-32 mb-4" 
            placeholder="Write your reply here..." 
          />
          <button type="submit" className="bg-primary text-black font-black py-2.5 px-6 rounded-neo border-2 border-black shadow-neo hover:translate-y-[2px] hover:shadow-neo-sm transition-all">
            Post Reply
          </button>
        </form>
      )}
    </div>
  );
}
