import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { BACKEND_URL } from '../services/api';
import { io } from 'socket.io-client';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { Loader2, Send, Trash2, ArrowLeft, Undo, Redo, Eraser, PenTool, Camera, X, Expand, Download, Plus, Check, Square, Circle, StickyNote } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import DeleteReasonModal from '../components/DeleteReasonModal';

const SOCKET_URL = BACKEND_URL;

export default function ClassroomRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState('');
  const { user, getMe } = useAuthStore();

  // Study Session States
  const [sessionStatus, setSessionStatus] = useState('scheduled');
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [sessionEndedAt, setSessionEndedAt] = useState(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  
  const [adminDeleteTarget, setAdminDeleteTarget] = useState(null);
  
  const socketRef = useRef(null);
  const canvasRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  const [strokeColor, setStrokeColor] = useState('black');
  const [isErasing, setIsErasing] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [cursors, setCursors] = useState({});
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [fullscreenSnapshot, setFullscreenSnapshot] = useState(null);
  
  const [activeTab, setActiveTab] = useState('chat');
  const [boardElements, setBoardElements] = useState([]);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchRoom();
    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  const fetchRoom = async () => {
    try {
      const res = await api.get(`/classrooms/${id}`);
      setRoom(res.data);
      setSessionStatus(res.data.sessionStatus);
      setSessionStartTime(res.data.startTime);
      setSessionDuration(res.data.duration);
      setSessionEndedAt(res.data.endedAt);
      setSessionTitle(res.data.sessionTitle);
      setShowPomodoro(res.data.pomodoroEnabled || false);
      if (res.data.startTime) {
        const d = new Date(res.data.startTime);
        const tzoffset = d.getTimezoneOffset() * 60000;
        setEditStartTime(new Date(d.getTime() - tzoffset).toISOString().slice(0, 16));
      }
      if (res.data.chatMessages) {
        setChat(res.data.chatMessages);
      }
      if (res.data.snapshots) {
        setSnapshots(res.data.snapshots);
      }
      if (res.data.tasks) {
        setTasks(res.data.tasks);
      }
      if (res.data.boardElements) {
        setBoardElements(res.data.boardElements);
      }
      if (res.data.whiteboardPaths && res.data.whiteboardPaths.length > 0) {
        setTimeout(() => {
          if (canvasRef.current) {
            isRemoteUpdate.current = true;
            canvasRef.current.loadPaths(res.data.whiteboardPaths);
            setTimeout(() => { isRemoteUpdate.current = false; }, 50);
          }
        }, 100);
      }
    } catch (error) {
      console.error(error);
      navigate('/classrooms');
    } finally {
      setLoading(false);
    }
  };

  const initSocket = () => {
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('connect', () => {
      const currentUserId = useAuthStore.getState().user?._id;
      socketRef.current.emit('join-room', { roomId: id, userId: currentUserId });
    });

    socketRef.current.on('chat-message', (data) => {
      setChat((prev) => [...prev, data]);
    });

    socketRef.current.on('cursor-move', (data) => {
      setCursors(prev => ({
        ...prev,
        [data.socketId]: data
      }));
      setTimeout(() => {
        setCursors(current => {
          const newCursors = { ...current };
          delete newCursors[data.socketId];
          return newCursors;
        });
      }, 2000);
    });

    socketRef.current.on('new-snapshot', (snapshot) => {
      setSnapshots(prev => [...prev, snapshot]);
    });

    socketRef.current.on('snapshot-deleted', (timestamp) => {
      setSnapshots(prev => prev.filter(s => s.timestamp !== timestamp));
    });

    socketRef.current.on('update-paths', (paths) => {
      if (canvasRef.current) {
        isRemoteUpdate.current = true;
        canvasRef.current.loadPaths(paths);
        setTimeout(() => { isRemoteUpdate.current = false; }, 50);
      }
    });

    socketRef.current.on('clear-canvas', () => {
      if (canvasRef.current) {
        canvasRef.current.clearCanvas();
      }
      setBoardElements([]);
    });

    socketRef.current.on('element-added', (newElement) => {
      setBoardElements(prev => {
        if (prev.some(el => el.id === newElement.id)) return prev;
        return [...prev, newElement];
      });
    });

    socketRef.current.on('element-updated', ({ elementId, ...updates }) => {
      setBoardElements(prev => prev.map(el => el.id === elementId ? { ...el, ...updates } : el));
    });

    socketRef.current.on('element-deleted', ({ elementId }) => {
      setBoardElements(prev => prev.filter(el => el.id !== elementId));
    });

    socketRef.current.on('update-tasks', (updatedTasks) => {
      setTasks(updatedTasks);
    });

    socketRef.current.on('session-started', (data) => {
      setSessionStatus('active');
      setSessionStartTime(data.startTime);
      useToastStore.getState().addToast('STUDY SESSION HAS STARTED!', 'success');
    });

    socketRef.current.on('start-time-changed', (data) => {
      setSessionStartTime(data.startTime);
      const d = new Date(data.startTime);
      const tzoffset = d.getTimezoneOffset() * 60000;
      setEditStartTime(new Date(d.getTime() - tzoffset).toISOString().slice(0, 16));
      useToastStore.getState().addToast('SESSION START TIME UPDATED', 'info');
    });

    socketRef.current.on('session-ended', (data) => {
      setSessionStatus('ended');
      setSessionEndedAt(data.endedAt);
      useToastStore.getState().addToast('STUDY SESSION HAS ENDED', 'error');
    });
    socketRef.current.on('pomodoro-toggled', ({ enabled }) => {
      setShowPomodoro(enabled);
      useToastStore.getState().addToast(
        enabled ? 'POMODORO TIMER ENABLED FOR THE ROOM 🍅' : 'POMODORO TIMER DISABLED FOR THE ROOM 🍅', 
        enabled ? 'success' : 'info'
      );
    });
    socketRef.current.on('session-extended', (data) => {
      setSessionDuration(data.duration);
      useToastStore.getState().addToast(`STUDY SESSION DURATION UPDATED TO ${data.duration} MINS!`, 'success');
    });
  };

  const handleStartSessionManual = () => {
    if (socketRef.current) {
      socketRef.current.emit('start-session-manual', { roomId: id, userId: user?._id });
    }
  };

  const handleChangeStartTime = (newTimeStr) => {
    if (socketRef.current) {
      const utcTime = new Date(newTimeStr).toISOString();
      socketRef.current.emit('change-start-time', { roomId: id, userId: user?._id, newStartTime: utcTime });
    }
  };

  const handleEndSessionManual = () => {
    const confirmEnd = window.confirm("Are you sure you want to end this study session? This will end the session for all participants.");
    if (confirmEnd && socketRef.current) {
      socketRef.current.emit('end-session-manual', { roomId: id, userId: user?._id });
    }
  };

  const handleTogglePomodoro = () => {
    if (socketRef.current) {
      socketRef.current.emit('toggle-pomodoro', { roomId: id, enabled: !showPomodoro });
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
      navigate('/classrooms');
    } catch (error) {
      console.error('Failed to admin-end classroom', error);
      useToastStore.getState().addToast('FAILED TO END CLASSROOM', 'error');
    }
  };

  const handleExtendSession = (newDuration) => {
    if (socketRef.current) {
      socketRef.current.emit('extend-session', { roomId: id, userId: user?._id, duration: newDuration });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    
    const data = { roomId: id, sender: user.name, text: msg };
    socketRef.current.emit('chat-message', data);
    setChat((prev) => [...prev, data]);
    setMsg('');
  };

  const handleClear = () => {
    canvasRef.current.clearCanvas();
    setBoardElements([]);
    socketRef.current.emit('clear-canvas', id);
  };

  const addElement = (type) => {
    const stickyColors = ['#fff9db', '#ffe3e3', '#e2f9ff', '#e3faf2'];
    const randomColor = stickyColors[Math.floor(Math.random() * stickyColors.length)];
    
    const newElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: 100 + boardElements.length * 15,
      y: 100 + boardElements.length * 15,
      width: type === 'sticky' ? 140 : 100,
      height: type === 'sticky' ? 140 : 100,
      color: type === 'sticky' ? randomColor : strokeColor,
      text: type === 'sticky' ? 'Double click to edit note' : '',
      creatorName: user.name,
    };
    
    setBoardElements(prev => [...prev, newElement]);
    socketRef.current?.emit('add-element', { roomId: id, element: newElement });
  };

  const handleDeleteElement = (elementId) => {
    setBoardElements(prev => prev.filter(el => el.id !== elementId));
    socketRef.current?.emit('delete-element', { roomId: id, elementId });
  };

  const handleUpdateElementText = (elementId, text) => {
    setBoardElements(prev => prev.map(el => el.id === elementId ? { ...el, text } : el));
    socketRef.current?.emit('update-element', { roomId: id, elementId, updates: { text } });
  };

  const handlePointerDown = (e, elementId) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    
    const element = boardElements.find(el => el.id === elementId);
    if (!element) return;
    
    const startX = e.clientX - element.x;
    const startY = e.clientY - element.y;
    
    const handlePointerMove = (moveEvent) => {
      const container = document.getElementById('whiteboard-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newX = Math.max(0, Math.min(rect.width - element.width, moveEvent.clientX - startX));
      const newY = Math.max(0, Math.min(rect.height - element.height, moveEvent.clientY - startY));
      
      setBoardElements(prev => prev.map(el => el.id === elementId ? { ...el, x: newX, y: newY } : el));
      socketRef.current?.emit('update-element', { roomId: id, elementId, updates: { x: newX, y: newY } });
    };
    
    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleSnapshot = async () => {
    try {
      const dataUrl = await canvasRef.current.exportImage('png');
      const snapshot = { dataUrl, createdBy: user.name, timestamp: new Date() };
      socketRef.current.emit('save-snapshot', { roomId: id, dataUrl, createdBy: user.name, userId: user?._id });
      setSnapshots(prev => [...prev, snapshot]);
      setTimeout(() => {
        getMe();
      }, 500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSnapshot = (timestamp) => {
    socketRef.current.emit('delete-snapshot', { roomId: id, timestamp });
    setSnapshots(prev => prev.filter(s => s.timestamp !== timestamp));
  };

  const handleDownloadSnapshot = (dataUrl, timestamp) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `snapshot-${new Date(timestamp).getTime()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTasks = [...tasks, { title: newTaskTitle.trim(), completed: false }];
    setTasks(newTasks);
    socketRef.current?.emit('update-tasks', { roomId: id, tasks: newTasks });
    setNewTaskTitle('');
  };

  const handleToggleTask = (index) => {
    const newTasks = tasks.map((t, idx) => idx === index ? { ...t, completed: !t.completed } : t);
    setTasks(newTasks);
    socketRef.current?.emit('update-tasks', { roomId: id, tasks: newTasks });
  };

  const handleDeleteTask = (index) => {
    const newTasks = tasks.filter((_, idx) => idx !== index);
    setTasks(newTasks);
    socketRef.current?.emit('update-tasks', { roomId: id, tasks: newTasks });
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (sessionStatus === 'scheduled') {
    const isCreator = room?.creator?._id === user?._id || room?.creator === user?._id;
    return (
      <div className="flex flex-col h-screen bg-background p-4 gap-4 items-center justify-center font-mono">
        <div className="bg-white border-4 border-slate-900 p-8 rounded-none shadow-neo max-w-xl w-full relative pt-12">
          <div className="absolute -top-5 left-6 bg-[#228be6] text-white px-4 py-1.5 text-xs font-black uppercase border-2 border-slate-900">
            WAITING ROOM
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Scheduled Study Session</h2>
          <p className="text-sm text-slate-600 font-bold mb-6">TOPIC: {sessionTitle.toUpperCase()}</p>
          
          <div className="bg-slate-50 border-2 border-slate-900 p-5 mb-6 text-center">
            <p className="text-xs text-slate-500 font-black mb-2 uppercase">SESSION STARTS IN</p>
            <ScheduledCountdown startTime={sessionStartTime} />
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">
              Scheduled for: {new Date(sessionStartTime).toLocaleString()}
            </p>
          </div>
          
          {isCreator ? (
             <div className="space-y-4 border-t-2 border-slate-200 pt-5">
               <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Host Controls</p>
               
               <div>
                 <label className="block text-[9px] font-bold mb-1.5 text-slate-500 uppercase">CHANGE START TIME</label>
                 <div className="flex gap-2">
                   <input 
                     type="datetime-local" 
                     value={editStartTime} 
                     onChange={(e) => setEditStartTime(e.target.value)} 
                     className="bg-white border-2 border-slate-900 rounded-none px-3 py-1.5 outline-none font-bold text-slate-800 text-xs flex-1" 
                   />
                   <button 
                     onClick={() => handleChangeStartTime(editStartTime)} 
                     className="bg-white hover:bg-slate-50 text-slate-950 font-bold py-1.5 px-4 rounded-none border-2 border-slate-900 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none transition-all text-xs"
                   >
                     UPDATE
                   </button>
                 </div>
               </div>
               
               <button 
                 onClick={handleStartSessionManual} 
                 className="w-full bg-primary text-white font-black py-3 rounded-none border-2 border-slate-900 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all text-sm uppercase tracking-wider"
               >
                 START STUDY SESSION NOW 🚀
               </button>
             </div>
          ) : (
            <div className="text-center border-t-2 border-slate-200 pt-5">
              <div className="inline-block animate-bounce mb-3 text-2xl">⏳</div>
              <p className="text-sm font-black text-slate-800 uppercase">Waiting for host to start...</p>
              <p className="text-[10px] font-bold text-slate-500 mt-1">Grab some water, get your notes, and we'll begin shortly!</p>
            </div>
          )}
          
          <button 
            onClick={() => navigate('/classrooms')} 
            className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-none border-2 border-slate-900 hover:translate-y-[1px] hover:shadow-none transition-all text-xs uppercase"
          >
            BACK TO CLASSROOMS
          </button>
        </div>
      </div>
    );
  }

  if (sessionStatus === 'ended') {
    const completedTasksCount = tasks.filter(t => t.completed).length;
    const totalTasksCount = tasks.length;
    return (
      <div className="flex flex-col h-screen bg-background p-4 gap-4 items-center justify-center font-mono">
        <div className="bg-white border-4 border-slate-900 p-8 rounded-none shadow-neo max-w-xl w-full relative pt-12">
          <div className="absolute -top-5 left-6 bg-red-500 text-white px-4 py-1.5 text-xs font-black uppercase border-2 border-slate-900">
            SESSION COMPLETED
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Study Session Has Ended</h2>
          <p className="text-sm text-slate-600 font-bold mb-6">TOPIC: {sessionTitle.toUpperCase()}</p>
          
          <div className="bg-slate-50 border-2 border-slate-900 p-5 mb-6">
            <h3 className="text-xs text-slate-500 font-black mb-3 uppercase tracking-wider text-center">Session Summary Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-800">
              <div className="bg-white border border-slate-900/10 p-3 text-center">
                <p className="text-slate-400 text-[10px]">TASKS COMPLETED</p>
                <p className="text-lg font-black pt-1">{completedTasksCount} / {totalTasksCount}</p>
              </div>
              <div className="bg-white border border-slate-900/10 p-3 text-center">
                <p className="text-slate-400 text-[10px]">CHAT MESSAGES</p>
                <p className="text-lg font-black pt-1">{chat.length}</p>
              </div>
              <div className="bg-white border border-slate-900/10 p-3 text-center">
                <p className="text-slate-400 text-[10px]">BOARD SNAPSHOTS</p>
                <p className="text-lg font-black pt-1">{snapshots.length}</p>
              </div>
              <div className="bg-white border border-slate-900/10 p-3 text-center">
                <p className="text-slate-400 text-[10px]">SESSION DURATION</p>
                <p className="text-lg font-black pt-1">{sessionDuration} MINS</p>
              </div>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-slate-500 font-semibold mb-6">
            * This room will remain visible in the dashboard for 5 minutes after ending.
          </p>

          <button 
            onClick={() => navigate('/classrooms')} 
            className="w-full bg-primary text-white font-black py-3 rounded-none border-2 border-slate-900 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all text-sm uppercase tracking-wider"
          >
            RETURN TO CLASSROOMS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background p-4 gap-4">
      {/* Top Header Panel */}
      <div className="flex items-center justify-between bg-white border-2 border-slate-900 rounded-none p-4 shadow-neo">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/classrooms')} className="p-2 border-2 border-slate-900 rounded-none hover:bg-slate-50 text-slate-700 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 uppercase">{room.name}</h1>
              <span className="bg-[#cbe3db] text-primary border border-slate-900 px-1.5 py-0.25 text-[7px] font-black uppercase inline-flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                </span>
                <span>LIVE</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 mt-0.5">
              <p className="hidden sm:block"><span className="text-slate-400 font-extrabold">TOPIC:</span> {sessionTitle.toUpperCase()}</p>
              <p className="hidden sm:block">•</p>
              <div className="flex items-center">
                <span className="text-slate-400 font-extrabold uppercase">REMAINING:</span> 
                <ActiveRemainingCountdown startTime={sessionStartTime} duration={sessionDuration} />
              </div>
              {(room?.creator?._id === user?._id || room?.creator === user?._id) && (
                <>
                  <p className="hidden sm:block">•</p>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-900/20 px-1.5 py-0.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase">EXTEND:</span>
                    <select 
                      value={sessionDuration} 
                      onChange={(e) => handleExtendSession(parseInt(e.target.value))} 
                      className="bg-white border border-slate-900 rounded-none px-1 py-0.5 font-bold text-[9px] text-slate-800 outline-none cursor-pointer"
                    >
                      <option value={sessionDuration}>CURRENT: {sessionDuration} MINS</option>
                      <optgroup label="ADD TIME (RELATIVE)">
                        <option value={sessionDuration + 15}>+15 MINS (TOTAL: {sessionDuration + 15} MINS)</option>
                        <option value={sessionDuration + 30}>+30 MINS (TOTAL: {sessionDuration + 30} MINS)</option>
                        <option value={sessionDuration + 60}>+60 MINS (TOTAL: {sessionDuration + 60} MINS)</option>
                      </optgroup>
                      <optgroup label="SET TOTAL TIME (ABSOLUTE)">
                        <option value={15}>15 MINS</option>
                        <option value={30}>30 MINS</option>
                        <option value={45}>45 MINS</option>
                        <option value={60}>60 MINS</option>
                        <option value={90}>90 MINS</option>
                        <option value={120}>120 MINS</option>
                      </optgroup>
                    </select>
                  </div>
                </>
              )}
              <p>•</p>
              <p>{room.members.length} MEMBERS</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSnapshots(true)} className="bg-[#ffb800] text-slate-955 px-4 py-2 border-2 border-slate-900 rounded-none font-bold flex items-center gap-2 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all text-xs">
            <Camera className="w-4 h-4" /> SNAPSHOTS
          </button>
          <button onClick={handleClear} className="bg-white hover:bg-red-50 text-red-650 px-4 py-2 border-2 border-slate-900 rounded-none font-bold flex items-center gap-2 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all text-xs">
            <Trash2 className="w-4 h-4" /> CLEAR BOARD
          </button>
          {(room?.creator?._id === user?._id || room?.creator === user?._id) && (
            <button onClick={handleEndSessionManual} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 border-2 border-slate-900 rounded-none font-bold flex items-center gap-2 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all text-xs uppercase">
              END SESSION
            </button>
          )}
          {user?.role === 'admin' && (
            <button 
              onClick={() => handleAdminEndClick(room._id)} 
              className="bg-red-500 hover:bg-red-650 text-white px-4 py-2 border-2 border-slate-900 rounded-none font-bold flex items-center gap-2 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all text-xs uppercase cursor-pointer"
              id="admin-end-session-btn"
            >
              ADMIN END SESSION
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden relative">
        {/* Whiteboard */}
        <div 
          id="whiteboard-container"
          className="flex-1 bg-white border-2 border-slate-900 rounded-none shadow-neo overflow-hidden relative"
          style={{ cursor: isErasing ? "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" style=\"font-size:24px\"><text y=\"24\">🧽</text></svg>') 0 24, auto" : "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" style=\"font-size:24px\"><text y=\"24\">🖍️</text></svg>') 0 24, auto" }}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            socketRef.current?.emit('cursor-move', { roomId: id, name: user.name, x, y, isErasing });
          }}
        >
          {/* Draggable Board Elements */}
          {boardElements.map((el) => {
            return (
              <div
                key={el.id}
                onPointerDown={(e) => handlePointerDown(e, el.id)}
                className={`absolute select-none cursor-move flex flex-col justify-between border-2 border-slate-900 shadow-neo-sm hover:shadow-neo`}
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  backgroundColor: el.type === 'sticky' ? el.color : 'transparent',
                  borderColor: el.type !== 'sticky' ? el.color : 'rgb(15, 23, 42)',
                  borderRadius: el.type === 'circle' ? '50%' : '0px',
                  zIndex: 10,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteElement(el.id);
                  }}
                  className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-slate-900 rounded-none flex items-center justify-center text-[10px] font-black text-red-500 hover:bg-red-50 cursor-pointer shadow-sm z-25"
                  title="Delete element"
                >
                  <X className="w-3 h-3" />
                </button>

                {el.type === 'sticky' ? (
                  <>
                    <textarea
                      value={el.text}
                      onChange={(e) => handleUpdateElementText(el.id, e.target.value)}
                      className="w-full h-full bg-transparent resize-none outline-none font-bold text-[10px] p-2 text-slate-800 border-none cursor-text leading-tight custom-scrollbar"
                      placeholder="Type a note..."
                    />
                    <div className="bg-white border-t-2 border-slate-900 px-2 py-0.5 text-[7px] font-black text-slate-600 font-mono tracking-wider flex flex-col justify-center leading-none">
                      <span className="truncate">PASTED BY:</span>
                      <span className="truncate text-primary">{el.creatorName.toUpperCase()}</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="bg-white/95 border border-slate-900 text-[6px] font-black px-1 py-0.5 rounded-none text-slate-500 font-mono tracking-wide uppercase">
                      {el.type}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Live Cursors */}
          {Object.values(cursors).map(c => (
            <div key={c.socketId} className="absolute pointer-events-none z-20 flex flex-col items-center transition-all duration-75" style={{ left: c.x, top: c.y }}>
              <div className="text-2xl drop-shadow-md">{c.isErasing ? '🧽' : '🖍️'}</div>
              <div className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-none border border-slate-700 shadow-sm mt-1 whitespace-nowrap">
                {c.name.toUpperCase()}
              </div>
            </div>
          ))}

          {/* Toolbar */}
          <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
            <div className="bg-white border-2 border-slate-900 rounded-none shadow-neo flex flex-col items-center p-2 gap-2">
              <button onClick={() => canvasRef.current.undo()} className="p-2 hover:bg-slate-50 text-slate-700 rounded-none border border-transparent hover:border-slate-900 transition-all"><Undo className="w-4 h-4"/></button>
              <button onClick={() => canvasRef.current.redo()} className="p-2 hover:bg-slate-50 text-slate-700 rounded-none border border-transparent hover:border-slate-900 transition-all"><Redo className="w-4 h-4"/></button>
              <div className="w-full border-t border-slate-200 my-1" />
              <button onClick={() => { setIsErasing(false); canvasRef.current?.eraseMode(false); }} className={`p-2 rounded-none border-2 border-slate-900 transition-all ${!isErasing ? 'bg-primary text-white shadow-neo-sm' : 'text-slate-700 hover:bg-slate-50 border-transparent'}`}><PenTool className="w-4 h-4"/></button>
              <button onClick={() => { setIsErasing(true); canvasRef.current?.eraseMode(true); }} className={`p-2 rounded-none border-2 border-slate-900 transition-all ${isErasing ? 'bg-primary text-white shadow-neo-sm' : 'text-slate-700 hover:bg-slate-50 border-transparent'}`}><Eraser className="w-4 h-4"/></button>
              <div className="w-full border-t border-slate-200 my-1" />
              {['black', 'red', 'blue', 'green'].map(c => (
                <button 
                  key={c} 
                  onClick={() => { setStrokeColor(c); setIsErasing(false); }} 
                  className={`w-4 h-4 rounded-none border-2 border-slate-900 ${strokeColor === c && !isErasing ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''} hover:scale-110 transition-transform`} 
                  style={{ backgroundColor: c }} 
                />
              ))}
              <div className="w-full border-t border-slate-200 my-1" />
              <button 
                onClick={() => addElement('sticky')} 
                className="p-2 hover:bg-slate-50 text-slate-700 rounded-none border border-transparent hover:border-slate-900 transition-all"
                title="Add Sticky Note"
              >
                <StickyNote className="w-4 h-4 text-amber-500" />
              </button>
              <button 
                onClick={() => addElement('rectangle')} 
                className="p-2 hover:bg-slate-50 text-slate-700 rounded-none border border-transparent hover:border-slate-900 transition-all"
                title="Add Rectangle Shape"
              >
                <Square className="w-4 h-4 text-blue-500" />
              </button>
              <button 
                onClick={() => addElement('circle')} 
                className="p-2 hover:bg-slate-50 text-slate-700 rounded-none border border-transparent hover:border-slate-900 transition-all"
                title="Add Circle Shape"
              >
                <Circle className="w-4 h-4 text-emerald-500" />
              </button>
            </div>
          </div>

          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={isErasing ? 20 : 4}
            strokeColor={strokeColor}
            eraserWidth={20}
            eraseMode={isErasing}
            className="w-full h-full"
            onChange={(newPaths) => {
              if (isRemoteUpdate.current) return;
              socketRef.current?.emit('update-paths', { roomId: id, paths: newPaths, userId: user?._id });
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-2 border-slate-900 rounded-none shadow-neo flex flex-col overflow-hidden font-mono">
          {/* Pomodoro Panel Toggle */}
          <div className="p-3 border-b-2 border-slate-900 bg-slate-50/50 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide flex items-center gap-1">
                🍅 POMODORO TIMER
              </span>
              <button
                onClick={handleTogglePomodoro}
                className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-none border-2 border-slate-900 transition-all hover:translate-y-[1px] hover:shadow-none ${
                  showPomodoro 
                    ? 'bg-red-500 text-white shadow-neo-sm' 
                    : 'bg-white text-slate-800 shadow-neo-sm'
                }`}
              >
                {showPomodoro ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
            {showPomodoro && <PomodoroTimer startTime={sessionStartTime} />}
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-slate-900">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-[10px] font-extrabold uppercase transition-all border-r-2 border-slate-900 ${
                activeTab === 'chat'
                  ? 'bg-[#cbe3db]/40 text-slate-800'
                  : 'bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('todo')}
              className={`flex-1 py-3 text-[10px] font-extrabold uppercase transition-all border-r-2 border-slate-900 ${
                activeTab === 'todo'
                  ? 'bg-[#cbe3db]/40 text-slate-800'
                  : 'bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              To-Do
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-3 text-[10px] font-extrabold uppercase transition-all ${
                activeTab === 'members'
                  ? 'bg-[#cbe3db]/40 text-slate-800'
                  : 'bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              Members
            </button>
          </div>

          {activeTab === 'chat' ? (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {chat.map((c, i) => (
                  <div key={i} className={`flex flex-col ${c.sender === user.name ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] font-bold text-slate-500 mb-1">{c.sender.toUpperCase()}</span>
                    <div className={`px-3 py-1.5 rounded-none text-xs font-bold border-2 border-slate-900 shadow-neo-sm ${c.sender === user.name ? 'bg-primary text-white' : 'bg-slate-50 text-slate-800'}`}>
                      {c.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="p-3 border-t-2 border-slate-900 bg-slate-50/20 flex gap-2">
                <input 
                  type="text" 
                  value={msg} 
                  onChange={e => setMsg(e.target.value)} 
                  className="flex-1 bg-white border-2 border-slate-900 rounded-none px-3 py-1.5 outline-none font-bold text-xs text-slate-800 placeholder:text-slate-400" 
                  placeholder="MESSAGE..." 
                />
                <button type="submit" className="bg-[#ffb800] text-slate-950 p-2 rounded-none border-2 border-slate-900 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo-sm">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : activeTab === 'todo' ? (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                {tasks.length === 0 ? (
                  <p className="text-slate-400 font-bold text-center mt-10 text-xs uppercase">No tasks yet.</p>
                ) : (
                  tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50/50 border-2 border-slate-900 p-2.5 shadow-neo-sm rounded-none">
                      <button
                        onClick={() => handleToggleTask(idx)}
                        className={`w-5 h-5 border-2 border-slate-900 flex items-center justify-center transition-all ${
                          task.completed ? 'bg-primary text-white' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <span className={`flex-1 font-bold text-xs ${task.completed ? 'line-through text-slate-400' : 'text-slate-850'}`}>
                        {task.title}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(idx)}
                        className="p-1 hover:bg-red-50 text-red-650 hover:text-red-700 transition-all border border-transparent hover:border-slate-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddTask} className="p-3 border-t-2 border-slate-900 bg-slate-50/20 flex gap-2">
                <input 
                  type="text" 
                  value={newTaskTitle} 
                  onChange={e => setNewTaskTitle(e.target.value)} 
                  className="flex-1 bg-white border-2 border-slate-900 rounded-none px-3 py-1.5 outline-none font-bold text-xs text-slate-800 placeholder:text-slate-400" 
                  placeholder="ADD TASK..." 
                />
                <button type="submit" className="bg-[#ffb800] text-slate-955 p-2 rounded-none border-2 border-slate-900 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo-sm">
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Active Members ({room?.members?.length || 0})
                </span>
              </div>
              
              {!room?.members || room.members.length === 0 ? (
                <p className="text-slate-400 font-bold text-center mt-10 text-xs uppercase">No members joined.</p>
              ) : (
                room.members.map((member, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col bg-slate-50 border-2 border-slate-900 p-2.5 shadow-neo-sm rounded-none font-mono text-left"
                  >
                    <span className="font-extrabold text-xs text-slate-850 flex items-center justify-between">
                      <span>{member.name.toUpperCase()}</span>
                      {(member._id === room.creator?._id || member._id === room.creator || member._id === room.creator?.toString()) && (
                        <span className="text-[8px] bg-amber-100 text-amber-700 border border-amber-400 px-1 py-0.2 uppercase font-black tracking-wider">HOST 👑</span>
                      )}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                      {member.email}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Snapshots Sidebar drawer */}
      {showSnapshots && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-96 bg-white h-full border-l-2 border-slate-900 p-4 flex flex-col shadow-2xl relative font-mono">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-extrabold text-slate-850 uppercase">Snapshots</h2>
              <div className="flex gap-2">
                <button onClick={handleSnapshot} className="p-1.5 rounded-none border-2 border-slate-900 bg-primary text-white hover:bg-primary/95 transition-all shadow-neo-sm hover:translate-y-[1px] hover:shadow-none" title="Take Snapshot"><Camera className="w-4 h-4"/></button>
                <button onClick={() => setShowSnapshots(false)} className="p-1.5 rounded-none border-2 border-slate-900 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all shadow-neo-sm hover:translate-y-[1px] hover:shadow-none"><X className="w-4 h-4"/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {snapshots.length === 0 ? (
                <p className="text-slate-500 font-bold text-center mt-10 text-xs">NO SNAPSHOTS YET.</p>
              ) : (
                snapshots.map((s, i) => (
                  <div key={i} className="border-2 border-slate-900 rounded-none overflow-hidden bg-slate-50/50 shadow-neo relative group mb-4">
                    <div className="relative">
                      <img src={s.dataUrl} alt="Snapshot" className="w-full bg-white border-b-2 border-slate-900" />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setFullscreenSnapshot(s.dataUrl)} className="p-1.5 bg-white border-2 border-slate-900 rounded-none hover:bg-slate-50 text-slate-700 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none" title="Expand"><Expand className="w-3.5 h-3.5"/></button>
                        <button onClick={() => handleDownloadSnapshot(s.dataUrl, s.timestamp)} className="p-1.5 bg-white border-2 border-slate-900 rounded-none hover:bg-slate-50 text-slate-700 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none" title="Download"><Download className="w-3.5 h-3.5"/></button>
                        {user && user.name === s.createdBy && (
                          <button onClick={() => handleDeleteSnapshot(s.timestamp)} className="p-1.5 bg-white border-2 border-slate-900 rounded-none hover:bg-red-50 text-red-650 shadow-neo-sm hover:translate-y-[1px] hover:shadow-none" title="Delete"><Trash2 className="w-3.5 h-3.5"/></button>
                        )}
                      </div>
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-[10px] font-bold text-slate-800">BY {s.createdBy.toUpperCase()}</p>
                      <p className="text-[8px] text-slate-500 font-bold">{new Date(s.timestamp).toLocaleString().toUpperCase()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {fullscreenSnapshot && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-8 backdrop-blur-md">
          <button onClick={() => setFullscreenSnapshot(null)} className="absolute top-6 right-6 text-slate-955 hover:text-red-700 bg-[#ffb800] border-2 border-slate-900 p-2 rounded-none shadow-neo hover:translate-y-[1px] hover:shadow-none font-bold text-xs flex items-center gap-1">
            <X className="w-5 h-5" /> CLOSE
          </button>
          <img src={fullscreenSnapshot} alt="Fullscreen Snapshot" className="max-w-full max-h-full object-contain border-4 border-slate-900 rounded-none shadow-neo" />
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

// Scheduled Countdown Helper Component
function ScheduledCountdown({ startTime }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(startTime) - new Date();
      if (difference <= 0) {
        setTimeLeft('00h 00m 00s');
        return;
      }
      const hrs = Math.floor(difference / (1000 * 60 * 60));
      const mins = Math.floor((difference / 1000 / 60) % 60);
      const secs = Math.floor((difference / 1000) % 60);
      
      const format = (num) => String(num).padStart(2, '0');
      setTimeLeft(`${format(hrs)}h ${format(mins)}m ${format(secs)}s`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono font-black text-2xl tracking-widest text-[#228be6]">{timeLeft}</span>;
}

// Active Study Session Countdown Banner Component
function ActiveRemainingCountdown({ startTime, duration }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const start = new Date(startTime).getTime();
      const expiry = start + duration * 60000;
      const difference = expiry - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft('00:00');
        return;
      }
      const mins = Math.floor(difference / 1000 / 60);
      const secs = Math.floor((difference / 1000) % 60);
      
      const format = (num) => String(num).padStart(2, '0');
      setTimeLeft(`${format(mins)}:${format(secs)}`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [startTime, duration]);

  return <span className="font-mono font-black text-red-500 bg-red-50 border border-red-500/20 px-2 py-0.5 ml-1.5">{timeLeft}</span>;
}

// Pomodoro Timer Component
function PomodoroTimer({ startTime }) {
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const [timeLeft, setTimeLeft] = useState('');
  const [progressPercent, setProgressPercent] = useState(100);

  useEffect(() => {
    const updateTimer = () => {
      const startMs = new Date(startTime).getTime();
      const nowMs = Date.now();
      const elapsedMs = Math.max(0, nowMs - startMs);
      
      const cycleMs = 30 * 60 * 1000; // 30 mins cycle (25 focus + 5 break)
      const focusMs = 25 * 60 * 1000; // 25 mins focus
      const breakMs = 5 * 60 * 1000;  // 5 mins break
      
      const cycleElapsedMs = elapsedMs % cycleMs;
      
      let currentMode = 'focus';
      let remainingMs = 0;
      let totalModeMs = focusMs;
      
      if (cycleElapsedMs < focusMs) {
        currentMode = 'focus';
        remainingMs = focusMs - cycleElapsedMs;
        totalModeMs = focusMs;
      } else {
        currentMode = 'break';
        remainingMs = cycleMs - cycleElapsedMs;
        totalModeMs = breakMs;
      }
      
      setMode(currentMode);
      
      const mins = Math.floor(remainingMs / 1000 / 60);
      const secs = Math.floor((remainingMs / 1000) % 60);
      setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      
      const pct = (remainingMs / totalModeMs) * 100;
      setProgressPercent(pct);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="bg-white border-2 border-slate-900 p-3 shadow-neo-sm font-mono flex flex-col gap-2 relative mt-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          🍅 {mode === 'focus' ? '🔴 FOCUS MODE' : '🟢 BREAK TIME'}
        </span>
        <span className="font-black text-sm text-slate-850 bg-slate-50 border border-slate-200 px-1.5 py-0.5">{timeLeft}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-100 border-2 border-slate-900 rounded-none overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${mode === 'focus' ? 'bg-red-500' : 'bg-emerald-500'}`} 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>
      
      <p className="text-[8px] font-bold text-slate-400 uppercase text-center tracking-wider">
        {mode === 'focus' ? 'STAY CONCENTRATED WITH YOUR GROUP!' : 'TIME TO STRETCH & GRAB WATER!'}
      </p>
    </div>
  );
}
