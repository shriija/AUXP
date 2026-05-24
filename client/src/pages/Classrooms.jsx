import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, Plus, Loader2, Lock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [code, setCode] = useState('');
  const { user, getMe } = useAuthStore();
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
      getMe();
      useToastStore.getState().addToast('CLASSROOM CREATED SUCCESSFULLY!', 'success');
      navigate(`/classrooms/${res.data._id}`);
    } catch (error) {
      console.error(error);
      useToastStore.getState().addToast('FAILED TO CREATE CLASSROOM', 'error');
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
      getMe();
      useToastStore.getState().addToast(`SUCCESSFULLY JOINED CLASSROOM: ${room.name.toUpperCase()}!`, 'success');
      navigate(`/classrooms/${room._id}`);
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Incorrect access code.');
        useToastStore.getState().addToast('INCORRECT ACCESS CODE', 'error');
      } else {
        console.error(error);
        useToastStore.getState().addToast('FAILED TO JOIN CLASSROOM', 'error');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-900 uppercase">AUXP CLASSROOMS</h1>
          <p className="text-sm font-semibold text-slate-650">Join a live room to chat and collaborate on a shared whiteboard.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className={`px-4.5 py-2 rounded-none font-bold flex items-center gap-2 border-2 border-slate-900 shadow-neo hover:translate-y-[1px] hover:shadow-neo-sm transition-all text-xs ${showCreate ? 'bg-slate-100 text-slate-700' : 'bg-primary text-white hover:bg-primary/95'}`}>
          <Plus className="w-5 h-5" />
          {showCreate ? 'CANCEL' : 'CREATE ROOM'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border-2 border-slate-900 p-6 rounded-none shadow-neo mb-8 space-y-4 max-w-2xl relative pt-8 font-mono">
          <div className="absolute -top-3.5 left-4 bg-[#ffb800] px-3 py-1 text-xs text-slate-955 uppercase font-bold border-2 border-slate-900">
            NEW_CLASSROOM
          </div>
          <div className="pt-2">
            <label className="block text-xs font-bold mb-1.5 text-slate-750">ROOM NAME</label>
            <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-slate-800 placeholder:text-slate-400 text-xs" placeholder="e.g. Calculus Study Group" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-750">DESCRIPTION</label>
            <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-slate-800 placeholder:text-slate-400 text-xs" placeholder="e.g. Preparing for finals..." />
          </div>
          <div className="flex items-center gap-2 pt-1.5">
            <input type="checkbox" id="privateRoom" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-4 h-4 border-2 border-slate-900 rounded-none accent-primary cursor-pointer" />
            <label htmlFor="privateRoom" className="text-xs font-bold text-slate-750 cursor-pointer flex items-center gap-1.5"><Lock className="w-3.5 h-3.5"/> PRIVATE ROOM</label>
          </div>
          {isPrivate && (
            <div className="pt-1">
              <label className="block text-xs font-bold mb-1.5 text-slate-750">6-DIGIT ACCESS CODE</label>
              <input required type="text" maxLength={6} value={code} onChange={e => setCode(e.target.value)} className="w-full max-w-[200px] bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-black text-center tracking-widest text-lg text-slate-800 placeholder:text-slate-400" placeholder="000000" />
            </div>
          )}
          <button type="submit" className="bg-[#ffb800] text-slate-950 font-bold py-2 px-5 rounded-none border-2 border-slate-900 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo text-xs">
            START CLASSROOM
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : classrooms.length === 0 ? (
        <div className="text-center py-20 text-slate-505 border-2 border-dashed border-slate-900 rounded-none mx-4 my-2 font-bold bg-[#cbe3db]/20">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-700" />
          <p>NO ACTIVE CLASSROOMS RIGHT NOW. START ONE!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map(room => (
            <div key={room._id} className="bg-white border-2 border-slate-900 rounded-none p-5 shadow-neo flex flex-col justify-between hover:translate-y-[1px] hover:shadow-neo-sm transition-all relative font-mono">
              <div className="relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-extrabold text-slate-850 line-clamp-1 pr-6 uppercase">{room.name}</h3>
                  {room.isPrivate && <Lock className="w-4 h-4 text-slate-500 absolute top-0 right-0" />}
                </div>
                <p className="text-slate-650 font-semibold text-xs line-clamp-2 mb-4 h-10">{room.description}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 mb-6">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{room.members.length} MEMBERS JOINED</span>
                </div>
              </div>
              <button onClick={() => handleJoin(room)} className="w-full bg-primary text-white font-bold py-2.5 rounded-none border-2 border-slate-900 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo text-xs">
                JOIN ROOM
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
