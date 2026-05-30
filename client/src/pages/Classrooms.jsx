import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, Plus, Loader2, Lock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import DeleteReasonModal from '../components/DeleteReasonModal';

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [code, setCode] = useState('');
  
  // Study Session States
  const [sessionTitle, setSessionTitle] = useState('');
  const [startImmediately, setStartImmediately] = useState(true);
  const [startTime, setStartTime] = useState(() => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    const tzoffset = future.getTimezoneOffset() * 60000;
    return new Date(future.getTime() - tzoffset).toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState(60);

  const { user, getMe } = useAuthStore();
  const navigate = useNavigate();
  const [adminDeleteTarget, setAdminDeleteTarget] = useState(null);

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
        code: isPrivate ? code : undefined,
        sessionTitle: sessionTitle || newName,
        startTime: startImmediately ? new Date().toISOString() : new Date(startTime).toISOString(),
        duration: Number(duration),
        sessionStatus: startImmediately ? 'active' : 'scheduled'
      });
      getMe();
      useToastStore.getState().addToast('CLASSROOM SUBMITTED FOR ADMIN REVIEW!', 'success');
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      setIsPrivate(false);
      setCode('');
      setSessionTitle('');
      fetchClassrooms();
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
      if (room.sessionStatus === 'ended') {
        useToastStore.getState().addToast('SESSION SUMMARY RETRIEVED SUCCESSFULLY!', 'success');
      } else {
        useToastStore.getState().addToast(`SUCCESSFULLY JOINED CLASSROOM: ${room.name.toUpperCase()}!`, 'success');
      }
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

  const handleAdminEndClick = (roomId) => {
    setAdminDeleteTarget({ itemId: roomId, itemType: 'classroom' });
  };

  const executeAdminEnd = async (reason) => {
    if (!adminDeleteTarget) return;
    try {
      const { itemId, itemType } = adminDeleteTarget;
      await api.post('/admin/delete-content', { itemId, itemType, reason });
      useToastStore.getState().addToast('CLASSROOM ENDED BY ADMIN!', 'info');
      setAdminDeleteTarget(null);
      fetchClassrooms();
    } catch (error) {
      console.error('Failed to admin-end classroom', error);
      useToastStore.getState().addToast('FAILED TO END CLASSROOM', 'error');
    }
  };

  const getStatusBadge = (room) => {
    if (room.approvalStatus === 'pending') {
      return <span className="bg-amber-100 text-amber-800 border-2 border-slate-900 px-2 py-0.5 text-[9px] font-black uppercase animate-pulse">⏳ IN REVIEW</span>;
    }
    if (room.approvalStatus === 'rejected') {
      return <span className="bg-red-100 text-red-800 border-2 border-slate-900 px-2 py-0.5 text-[9px] font-black uppercase" title={`Reason: ${room.rejectionReason}`}>❌ REJECTED</span>;
    }
    switch (room.sessionStatus) {
      case 'active':
        return <span className="bg-[#cbe3db] text-primary border-2 border-slate-900 px-2 py-0.5 text-[9px] font-black uppercase">LIVE NOW</span>;
      case 'scheduled':
        return <span className="bg-[#d0ebff] text-[#228be6] border-2 border-slate-900 px-2 py-0.5 text-[9px] font-black uppercase">SCHEDULED</span>;
      case 'ended':
        return <span className="bg-[#ffe3e3] text-[#fa5252] border-2 border-slate-900 px-2 py-0.5 text-[9px] font-black uppercase">ENDED</span>;
      default:
        return null;
    }
  };

  const getButtonText = (room) => {
    switch (room.sessionStatus) {
      case 'active':
        return 'JOIN LIVE SESSION';
      case 'scheduled':
        return 'ENTER WAITING ROOM';
      case 'ended':
        return 'VIEW SESSION SUMMARY';
      default:
        return 'JOIN ROOM';
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

          <div className="pt-4 border-t-2 border-slate-200">
            <h4 className="text-xs font-black text-slate-800 mb-3 uppercase tracking-wider">Study Session Settings</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-750">SESSION TOPIC / TITLE</label>
                <input type="text" value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} className="w-full bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-slate-800 placeholder:text-slate-400 text-xs" placeholder="e.g. DSA Heap Trees Revision (default: same as room name)" />
              </div>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="startNow" checked={startImmediately} onChange={e => setStartImmediately(e.target.checked)} className="w-4 h-4 border-2 border-slate-900 rounded-none accent-primary cursor-pointer" />
                  <label htmlFor="startNow" className="text-xs font-bold text-slate-750 cursor-pointer">START SESSION NOW</label>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-750">DURATION</label>
                  <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="bg-white border-2 border-slate-900 rounded-none px-3 py-1.5 outline-none font-bold text-slate-800 text-xs">
                    <option value={1}>1 MIN (TESTING)</option>
                    <option value={5}>5 MINS</option>
                    <option value={15}>15 MINS</option>
                    <option value={30}>30 MINS</option>
                    <option value={60}>60 MINS</option>
                    <option value={90}>90 MINS</option>
                    <option value={120}>120 MINS</option>
                  </select>
                </div>
              </div>

              {!startImmediately && (
                <div className="pt-1 animate-fadeIn">
                  <label className="block text-xs font-bold mb-1.5 text-slate-750">SCHEDULED START TIME</label>
                  <input required={!startImmediately} type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-white border-2 border-slate-900 rounded-none px-4 py-2 outline-none font-bold text-slate-800 text-xs" />
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="bg-[#ffb800] text-slate-950 font-bold py-2 px-5 rounded-none border-2 border-slate-900 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo text-xs mt-2">
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
                <div className="flex justify-between items-start mb-2.5">
                  <h3 className="text-base font-extrabold text-slate-850 line-clamp-1 pr-6 uppercase">{room.name}</h3>
                  {room.isPrivate && <Lock className="w-4 h-4 text-slate-500 absolute top-0 right-0" />}
                </div>
                
                <div className="mb-3.5 flex items-center justify-between">
                  {getStatusBadge(room)}
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{room.members.length} JOINED</span>
                  </div>
                </div>

                <p className="text-slate-650 font-semibold text-xs line-clamp-2 mb-4 h-10">{room.description}</p>
                
                {/* Session Panel */}
                <div className="mb-6 flex flex-col gap-1 text-[10px] font-bold text-slate-700 bg-slate-50 border-2 border-slate-900 p-2.5 relative font-mono">
                  <div className="absolute top-0 right-2 -translate-y-1/2 bg-white border-2 border-slate-900 text-slate-800 px-1.5 py-0.5 text-[8px] font-black">
                    SESSION_INFO
                  </div>
                  <p className="line-clamp-1 pt-1"><span className="text-slate-400 font-extrabold">TOPIC:</span> {room.sessionTitle.toUpperCase()}</p>
                  <p><span className="text-slate-400 font-extrabold">DURATION:</span> {room.duration} MINS</p>
                  {room.sessionStatus === 'scheduled' && (
                    <p className="text-[#228be6] font-black">
                      <span className="text-slate-400 font-extrabold">STARTS:</span> {new Date(room.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {room.sessionStatus === 'ended' && (
                    <>
                      <p className="text-slate-700 font-bold">
                        <span className="text-slate-400 font-extrabold">STARTED AT:</span> {new Date(room.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-red-500 font-black">
                        <span className="text-slate-400 font-extrabold">ENDED AT:</span> {new Date(room.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {user?.role === 'admin' && room.sessionStatus !== 'ended' && (
                <button
                  onClick={() => handleAdminEndClick(room._id)}
                  className="w-full mb-2 py-2 rounded-none border-2 border-slate-900 font-extrabold text-xs bg-red-500 hover:bg-red-650 text-white shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  id={`admin-end-classroom-btn-${room._id}`}
                >
                  ADMIN END ROOM
                </button>
              )}
                <button 
                  disabled={room.approvalStatus !== 'approved'}
                  onClick={() => handleJoin(room)}
                  className={`w-full py-2.5 rounded-none border-2 border-slate-900 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    room.approvalStatus !== 'approved'
                      ? 'bg-slate-100 text-slate-450 border-slate-400 cursor-not-allowed shadow-none'
                      : 'shadow-neo hover:translate-y-[1px] hover:shadow-none bg-primary text-white hover:bg-primary/95'
                  }`}
                >
                  {room.approvalStatus === 'pending' ? '⏳ PENDING REVIEW' : room.approvalStatus === 'rejected' ? '❌ REJECTED' : getButtonText(room)}
                </button>
            </div>
          ))}
        </div>
      )}
      <DeleteReasonModal
        isOpen={!!adminDeleteTarget}
        onClose={() => setAdminDeleteTarget(null)}
        onSubmit={executeAdminEnd}
        title="Admin End Study Room"
        placeholder="State reason for ending this live study classroom..."
      />
    </div>
  );
}
