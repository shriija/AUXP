import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { io } from 'socket.io-client';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { Loader2, Send, Trash2, ArrowLeft, Undo, Redo, Eraser, PenTool, Camera, X, Expand, Download, Plus, Check } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function ClassroomRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState('');
  const { user, getMe } = useAuthStore();
  
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
      if (res.data.chatMessages) {
        setChat(res.data.chatMessages);
      }
      if (res.data.snapshots) {
        setSnapshots(res.data.snapshots);
      }
      if (res.data.tasks) {
        setTasks(res.data.tasks);
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
    });

    socketRef.current.on('update-tasks', (updatedTasks) => {
      setTasks(updatedTasks);
    });
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
    socketRef.current.emit('clear-canvas', id);
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

  return (
    <div className="flex flex-col h-screen bg-background p-4 gap-4">
      {/* Top Header Panel */}
      <div className="flex items-center justify-between bg-white border-2 border-slate-900 rounded-none p-4 shadow-neo">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/classrooms')} className="p-2 border-2 border-slate-900 rounded-none hover:bg-slate-50 text-slate-700 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 uppercase">{room.name}</h1>
            <p className="text-[10px] font-bold text-slate-500">{room.members.length} MEMBERS IN ROOM</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSnapshots(true)} className="bg-[#ffb800] text-slate-955 px-4 py-2 border-2 border-slate-900 rounded-none font-bold flex items-center gap-2 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all text-xs">
            <Camera className="w-4 h-4" /> SNAPSHOTS
          </button>
          <button onClick={handleClear} className="bg-white hover:bg-red-50 text-red-650 px-4 py-2 border-2 border-slate-900 rounded-none font-bold flex items-center gap-2 shadow-neo hover:translate-y-[1px] hover:shadow-none transition-all text-xs">
            <Trash2 className="w-4 h-4" /> CLEAR BOARD
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden relative">
        {/* Whiteboard */}
        <div 
          className="flex-1 bg-white border-2 border-slate-900 rounded-none shadow-neo overflow-hidden relative"
          style={{ cursor: isErasing ? "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" style=\"font-size:24px\"><text y=\"24\">🧽</text></svg>') 0 24, auto" : "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" style=\"font-size:24px\"><text y=\"24\">🖍️</text></svg>') 0 24, auto" }}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            socketRef.current?.emit('cursor-move', { roomId: id, name: user.name, x, y, isErasing });
          }}
        >
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
          {/* Tabs */}
          <div className="flex border-b-2 border-slate-900">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-extrabold uppercase transition-all border-r-2 border-slate-900 ${
                activeTab === 'chat'
                  ? 'bg-[#cbe3db]/40 text-slate-800'
                  : 'bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              Live Chat
            </button>
            <button
              onClick={() => setActiveTab('todo')}
              className={`flex-1 py-3 text-xs font-extrabold uppercase transition-all ${
                activeTab === 'todo'
                  ? 'bg-[#cbe3db]/40 text-slate-800'
                  : 'bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              To-Do Board
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
          ) : (
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
                <button type="submit" className="bg-[#ffb800] text-slate-950 p-2 rounded-none border-2 border-slate-900 hover:translate-y-[1px] hover:shadow-none transition-all shadow-neo-sm">
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </>
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
          <button onClick={() => setFullscreenSnapshot(null)} className="absolute top-6 right-6 text-slate-950 hover:text-red-700 bg-[#ffb800] border-2 border-slate-900 p-2 rounded-none shadow-neo hover:translate-y-[1px] hover:shadow-none font-bold text-xs flex items-center gap-1">
            <X className="w-5 h-5" /> CLOSE
          </button>
          <img src={fullscreenSnapshot} alt="Fullscreen Snapshot" className="max-w-full max-h-full object-contain border-4 border-slate-900 rounded-none shadow-neo" />
        </div>
      )}
    </div>
  );
}
