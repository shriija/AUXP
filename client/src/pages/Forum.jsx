import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { BACKEND_URL } from '../services/api';
import { MessageSquare, Plus, Loader2, ThumbsUp } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

export default function Forum() {
  const { getMe } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/forum');
      setPosts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('description', newDesc);
      formData.append('tags', JSON.stringify(newTags.split(',').map(t => t.trim()).filter(Boolean)));
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await api.post('/forum', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowCreate(false);
      setNewTitle('');
      setNewDesc('');
      setNewTags('');
      setSelectedImage(null);
      fetchPosts();
      getMe();
      useToastStore.getState().addToast('FORUM POST SUBMITTED FOR ADMIN REVIEW!', 'success');
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast('FAILED TO CREATE FORUM POST', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-900 uppercase">AUXP FORUM</h1>
          <p className="text-sm font-semibold text-slate-600">Ask questions, share knowledge, and help peers.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className={`px-4.5 py-2 rounded-none font-bold flex items-center gap-2 border-2 border-slate-900 shadow-neo hover:translate-y-[1px] hover:shadow-neo-sm transition-all text-xs ${showCreate ? 'bg-slate-100 text-slate-700' : 'bg-primary text-white hover:bg-primary/95'}`}>
          <Plus className="w-5 h-5" />
          {showCreate ? 'CANCEL' : 'ASK A QUESTION'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border-2 border-slate-900 p-6 rounded-none shadow-neo mb-8 space-y-4 font-mono relative">
          <div className="absolute -top-3.5 left-4 bg-[#ffb800] px-3 py-1 text-xs text-slate-955 uppercase font-bold border-2 border-slate-900">
            POST_A_DOUBT
          </div>
          <div className="pt-2">
            <label className="block text-xs font-bold mb-1.5 text-slate-700">TITLE</label>
            <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-slate-800 placeholder:text-slate-400 text-xs" placeholder="What is the difference between..." />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700">DESCRIPTION</label>
            <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-slate-800 placeholder:text-slate-400 h-32 text-xs" placeholder="Explain your doubt here..." />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700">TAGS (COMMA SEPARATED)</label>
            <input type="text" value={newTags} onChange={e => setNewTags(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-slate-800 placeholder:text-slate-400 text-xs" placeholder="e.g. physics, kinematics" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700">ATTACH IMAGE (OPTIONAL)</label>
            <input type="file" accept="image/*" onChange={e => setSelectedImage(e.target.files[0])} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-slate-800 text-xs" />
          </div>
          <button type="submit" className="bg-[#ffb800] text-slate-950 font-bold py-2 px-5 rounded-none border-2 border-slate-900 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo text-xs">
            POST QUESTION
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-900 rounded-none mx-4 my-2 font-bold bg-[#cbe3db]/20">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-700" />
          <p>NO POSTS FOUND. BE THE FIRST TO ASK A QUESTION!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Link to={`/forum/${post._id}`} key={post._id} className="block bg-white border-2 border-slate-900 rounded-none p-5 shadow-neo hover:translate-y-[1px] hover:shadow-neo-sm transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">{post.title.toUpperCase()}</h3>
                    {post.approvalStatus === 'pending' && (
                      <span className="bg-amber-100 text-amber-800 border border-slate-900 px-1.5 py-0.25 text-[8px] font-black uppercase animate-pulse">
                        ⏳ IN REVIEW
                      </span>
                    )}
                    {post.approvalStatus === 'rejected' && (
                      <span className="bg-red-100 text-red-850 border border-slate-900 px-1.5 py-0.25 text-[8px] font-black uppercase" title={`Reason: ${post.rejectionReason}`}>
                        ❌ REJECTED (HOVER REASON)
                      </span>
                    )}
                  </div>
                  <p className="text-slate-650 font-medium text-sm line-clamp-2 mb-3">{post.description}</p>
                  {post.imageUrl && (
                    <div className="mt-2 mb-3 max-w-md">
                      <img 
                        src={getImageUrl(post.imageUrl)} 
                        alt="Question Attachment" 
                        className="border-2 border-slate-900 shadow-neo-sm max-h-32 object-cover" 
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 mt-1">
                    <span>ASKED BY <span className="text-slate-850 font-extrabold">{post.author?.name?.toUpperCase()}</span> ON {new Date(post.createdAt).toLocaleDateString()} AT {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()} {post.isEdited && <span className="italic text-[9px] ml-1 text-primary">(EDITED)</span>}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 bg-[#cbe3db]/40 p-2.5 rounded-none border-2 border-slate-900 min-w-[54px] shadow-neo-sm font-mono">
                  <ThumbsUp className="w-4 h-4 text-slate-750" />
                  <span className="font-extrabold text-xs text-slate-800">{post.upvotes - post.downvotes}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
