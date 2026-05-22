import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, Plus, Loader2, Lock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [code, setCode] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await api.get('/classrooms');
      setClassrooms(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/classrooms', {
        name: newName,
        description: newDesc,
        isPrivate,
        code: isPrivate ? code : undefined
      });
      navigate(`/classrooms/${res.data._id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoin = async (room) => {
    try {
      let joinCode = '';
      if (room.isPrivate) {
        joinCode = window.prompt('This is a private room. Enter the 6-digit access code:');
        if (joinCode === null) return; // User cancelled
      }
      await api.post(`/classrooms/${room._id}/join`, { code: joinCode });
      navigate(`/classrooms/${room._id}`);
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Incorrect access code.');
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1.5 text-slate-900">Active Study Classrooms</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Join a live room to chat and collaborate on a shared whiteboard.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className={`${showCreate ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-primary text-white hover:bg-primary/95'} px-4.5 py-2.5 rounded-neo font-semibold flex items-center gap-2 transition-all shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-y-0 w-fit`}>
          <Plus className="w-5 h-5" />
          {showCreate ? 'Cancel' : 'Create Room'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-6 rounded-neo shadow-neo mb-8 space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Create a New Classroom</h2>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700">Room Name</label>
            <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2.5 outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/20 transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm" placeholder="e.g. Calculus Study Group" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700">Description</label>
            <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2.5 outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/20 transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm" placeholder="e.g. Preparing for finals..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="privateRoom" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-4 h-4 border border-slate-200 rounded-sm accent-primary" />
            <label htmlFor="privateRoom" className="text-sm font-semibold text-slate-700 cursor-pointer flex items-center gap-1"><Lock className="w-4 h-4"/> Private Room</label>
          </div>
          {isPrivate && (
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700">6-Digit Access Code</label>
              <input required type="text" maxLength={6} value={code} onChange={e => setCode(e.target.value)} className="w-full max-w-[200px] bg-white border border-slate-200 rounded-neo px-4 py-2.5 outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/20 transition-all font-bold text-center tracking-widest text-xl text-slate-900 placeholder:text-slate-400" placeholder="000000" />
            </div>
          )}
          <button type="submit" className="bg-primary text-white font-semibold py-2.5 px-6 rounded-neo shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-y-0 transition-all">
            Start Classroom
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : classrooms.length === 0 ? (
        <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-neo mx-4 my-2 font-medium bg-white">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
          <p className="text-sm">No active classrooms right now. Start one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map(room => (
            <div key={room._id} className="bg-white border border-slate-200 rounded-neo p-5 shadow-neo flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-neo-lg transition-all duration-200 relative group">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 pr-6 group-hover:text-primary transition-colors">{room.name}</h3>
                  {room.isPrivate && <Lock className="w-4 h-4 text-slate-400 absolute top-5 right-5" />}
                </div>
                <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-4 h-10 leading-relaxed">{room.description}</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
                  <Users className="w-4 h-4" />
                  <span>{room.members.length} members joined</span>
                </div>
              </div>
              <button onClick={() => handleJoin(room)} className="w-full bg-secondary text-slate-900 text-center font-semibold py-2.5 rounded-neo shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm">
                Join Room
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
