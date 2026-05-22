import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MessageSquare, Plus, Loader2, ThumbsUp } from 'lucide-react';

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('');

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
      await api.post('/forum', {
        title: newTitle,
        description: newDesc,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setShowCreate(false);
      setNewTitle('');
      setNewDesc('');
      setNewTags('');
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-900">Doubt Clearance Forum</h1>
          <p className="text-sm font-medium text-slate-500">Ask questions, share knowledge, and help peers.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className={`px-4 py-2 rounded-neo font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow ${showCreate ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-primary text-white hover:bg-primary/95'}`}>
          <Plus className="w-5 h-5" />
          {showCreate ? 'Cancel' : 'Ask a Question'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-6 rounded-neo shadow-sm mb-8 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800">Post a Doubt</h2>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700">Title</label>
            <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-slate-800 placeholder:text-slate-400" placeholder="What is the difference between..." />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700">Description</label>
            <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-slate-800 placeholder:text-slate-400 h-32" placeholder="Explain your doubt here..." />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700">Tags (comma separated)</label>
            <input type="text" value={newTags} onChange={e => setNewTags(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-slate-800 placeholder:text-slate-400" placeholder="e.g. physics, kinematics" />
          </div>
          <button type="submit" className="bg-secondary text-slate-900 font-bold py-2 px-5 rounded-neo hover:bg-secondary/90 transition-colors shadow-sm">
            Post Question
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-neo mx-4 my-2 font-medium bg-white">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-450" />
          <p>No posts found. Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Link to={`/forum/${post._id}`} key={post._id} className="block bg-white border border-slate-200 rounded-neo p-5 shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-slate-650 font-medium text-sm line-clamp-2 mb-3">{post.description}</p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-1">
                    <span>Asked by <span className="text-slate-700 font-bold">{post.author?.name}</span> on {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {post.isEdited && <span className="italic text-xs ml-1">(edited)</span>}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 bg-slate-50/50 p-2.5 rounded-neo border border-slate-200/65 min-w-[54px]">
                  <ThumbsUp className="w-4 h-4 text-slate-500" />
                  <span className="font-extrabold text-sm text-slate-700">{post.upvotes - post.downvotes}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
