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
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-900">Study Classrooms</h1>
          <p className="text-sm font-medium text-slate-500">Join a live room to chat and collaborate on a shared whiteboard.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className={`px-4 py-2 rounded-neo font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow ${showCreate ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-primary text-white hover:bg-primary/95'}`}>
          <Plus className="w-5 h-5" />
          {showCreate ? 'Cancel' : 'Create Room'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-6 rounded-neo shadow-sm mb-8 space-y-4 max-w-2xl">
          <h2 className="text-xl font-extrabold text-slate-800">Create a New Classroom</h2>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700">Room Name</label>
            <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-slate-800 placeholder:text-slate-400" placeholder="e.g. Calculus Study Group" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700">Description</label>
            <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-white border border-slate-200 rounded-neo px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-slate-800 placeholder:text-slate-400" placeholder="e.g. Preparing for finals..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="privateRoom" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-4 h-4 border border-slate-200 rounded-sm accent-primary" />
            <label htmlFor="privateRoom" className="text-sm font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5"><Lock className="w-4 h-4"/> Private Room</label>
          </div>
          {isPrivate && (
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700">6-Digit Access Code</label>
              <input required type="text" maxLength={6} value={code} onChange={e => setCode(e.target.value)} className="w-full max-w-[200px] bg-white border border-slate-200 rounded-neo px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-black text-center tracking-widest text-xl text-slate-800 placeholder:text-slate-400" placeholder="000000" />
            </div>
          )}
          <button type="submit" className="bg-secondary text-slate-900 font-bold py-2 px-5 rounded-neo hover:bg-secondary/90 transition-colors shadow-sm">
            Start Classroom
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : classrooms.length === 0 ? (
        <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-neo mx-4 my-2 font-medium bg-white">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-450" />
          <p>No active classrooms right now. Start one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map(room => (
            <div key={room._id} className="bg-white border border-slate-200 rounded-neo p-5 shadow-neo flex flex-col justify-between hover:shadow-neo-lg hover:-translate-y-0.5 transition-all relative">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-850 line-clamp-1 pr-6">{room.name}</h3>
                  {room.isPrivate && <Lock className="w-4 h-4 text-slate-400 absolute top-5 right-5" />}
                </div>
                <p className="text-slate-550 font-medium text-sm line-clamp-2 mb-4 h-10">{room.description}</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{room.members.length} members joined</span>
                </div>
              </div>
              <button onClick={() => handleJoin(room)} className="w-full bg-primary text-white font-bold py-2.5 rounded-neo hover:bg-primary/95 transition-colors shadow-sm">
                Join Room
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
