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
          <h1 className="text-4xl font-black tracking-tight mb-2 text-black">Doubt Clearance Forum</h1>
          <p className="text-black/70 font-semibold">Ask questions, share knowledge, and help peers.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-primary text-black border-2 border-black px-4 py-2.5 rounded-neo font-bold flex items-center gap-2 transition-all shadow-neo hover:translate-y-[2px] hover:shadow-neo-sm">
          <Plus className="w-5 h-5" />
          {showCreate ? 'Cancel' : 'Ask a Question'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border-4 border-black p-6 rounded-neo shadow-neo mb-8 space-y-4">
          <h2 className="text-2xl font-black">Post a Doubt</h2>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-black">Title</label>
            <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-blue-50 transition-colors font-medium text-black placeholder:text-black/40" placeholder="What is the difference between..." />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-black">Description</label>
            <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-blue-50 transition-colors font-medium text-black placeholder:text-black/40 h-32" placeholder="Explain your doubt here..." />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-black">Tags (comma separated)</label>
            <input type="text" value={newTags} onChange={e => setNewTags(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-blue-50 transition-colors font-medium text-black placeholder:text-black/40" placeholder="e.g. physics, kinematics" />
          </div>
          <button type="submit" className="bg-secondary text-black font-black py-2.5 px-6 rounded-neo border-2 border-black shadow-neo hover:translate-y-[2px] hover:shadow-neo-sm transition-all">
            Post Question
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-black" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-black/60 border-4 border-dashed border-black/20 rounded-neo mx-4 my-2 font-bold bg-white">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-40 text-black" />
          <p>No posts found. Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Link to={`/forum/${post._id}`} key={post._id} className="block bg-white border-4 border-black rounded-neo p-5 shadow-neo hover:-translate-y-1 hover:shadow-neo-lg transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black mb-2 line-clamp-1 hover:underline">{post.title}</h3>
                  <p className="text-black/70 font-medium line-clamp-2 mb-3">{post.description}</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-black/60 mt-1">
                    <span>Asked by <span className="text-black">{post.author?.name}</span> on {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {post.isEdited && <span className="italic text-xs ml-1">(edited)</span>}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 bg-yellow-100 p-2 rounded-neo border-2 border-black min-w-[60px]">
                  <ThumbsUp className="w-5 h-5 text-black" />
                  <span className="font-black text-black">{post.upvotes - post.downvotes}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
