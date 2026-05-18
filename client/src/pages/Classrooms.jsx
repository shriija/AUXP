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
          <h1 className="text-4xl font-black tracking-tight mb-2 text-black">Study Classrooms</h1>
          <p className="text-black/70 font-semibold">Join a live room to chat and collaborate on a shared whiteboard.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-primary text-black border-2 border-black px-4 py-2.5 rounded-neo font-bold flex items-center gap-2 transition-all shadow-neo hover:translate-y-[2px] hover:shadow-neo-sm">
          <Plus className="w-5 h-5" />
          {showCreate ? 'Cancel' : 'Create Room'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border-4 border-black p-6 rounded-neo shadow-neo mb-8 space-y-4 max-w-2xl">
          <h2 className="text-2xl font-black">Create a New Classroom</h2>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-black">Room Name</label>
            <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-pink-50 transition-colors font-medium text-black placeholder:text-black/40" placeholder="e.g. Calculus Study Group" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-black">Description</label>
            <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-pink-50 transition-colors font-medium text-black placeholder:text-black/40" placeholder="e.g. Preparing for finals..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="privateRoom" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-4 h-4 border-2 border-black rounded-sm accent-black" />
            <label htmlFor="privateRoom" className="text-sm font-bold text-black cursor-pointer flex items-center gap-1"><Lock className="w-4 h-4"/> Private Room</label>
          </div>
          {isPrivate && (
            <div>
              <label className="block text-sm font-bold mb-1.5 text-black">6-Digit Access Code</label>
              <input required type="text" maxLength={6} value={code} onChange={e => setCode(e.target.value)} className="w-full max-w-[200px] bg-white border-2 border-black rounded-neo px-4 py-2.5 outline-none focus:shadow-neo-sm focus:bg-pink-50 transition-colors font-black text-center tracking-widest text-xl text-black placeholder:text-black/40" placeholder="000000" />
            </div>
          )}
          <button type="submit" className="bg-secondary text-black font-black py-2.5 px-6 rounded-neo border-2 border-black shadow-neo hover:translate-y-[2px] hover:shadow-neo-sm transition-all">
            Start Classroom
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-black" />
        </div>
      ) : classrooms.length === 0 ? (
        <div className="text-center py-20 text-black/60 border-4 border-dashed border-black/20 rounded-neo mx-4 my-2 font-bold bg-white">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-40 text-black" />
          <p>No active classrooms right now. Start one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map(room => (
            <div key={room._id} className="bg-white border-4 border-black rounded-neo p-5 shadow-neo flex flex-col justify-between hover:-translate-y-1 hover:shadow-neo-lg transition-all relative">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-black line-clamp-1 pr-6">{room.name}</h3>
                  {room.isPrivate && <Lock className="w-5 h-5 text-black absolute top-5 right-5" />}
                </div>
                <p className="text-black/70 font-medium line-clamp-2 mb-4 h-10">{room.description}</p>
                <div className="flex items-center gap-2 text-sm font-bold text-black/60 mb-6">
                  <Users className="w-4 h-4 text-black" />
                  <span>{room.members.length} members joined</span>
                </div>
              </div>
              <button onClick={() => handleJoin(room)} className="w-full bg-black text-white font-black py-2.5 rounded-neo border-2 border-black hover:bg-black/80 transition-colors">
                Join Room
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
