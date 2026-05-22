import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { io } from 'socket.io-client';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { Loader2, Send, Trash2, ArrowLeft, Undo, Redo, Eraser, PenTool, Camera, X, Expand, Download } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function ClassroomRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState('');
  const { user } = useAuthStore();
  
  const socketRef = useRef(null);
  const canvasRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  const [strokeColor, setStrokeColor] = useState('black');
  const [isErasing, setIsErasing] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [cursors, setCursors] = useState({});
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [fullscreenSnapshot, setFullscreenSnapshot] = useState(null);

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
      socketRef.current.emit('join-room', id);
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
      socketRef.current.emit('save-snapshot', { roomId: id, dataUrl, createdBy: user.name });
      setSnapshots(prev => [...prev, snapshot]);
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

  if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col h-screen bg-background p-4 gap-4">
      {/* Top Header Panel */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-neo p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/classrooms')} className="p-2 border border-slate-200 rounded-neo hover:bg-slate-50 text-slate-650 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{room.name}</h1>
            <p className="text-xs font-semibold text-slate-500">{room.members.length} members in room</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSnapshots(true)} className="bg-secondary text-slate-900 px-4 py-2 rounded-neo font-semibold flex items-center gap-2 shadow-sm hover:bg-secondary/90 transition-all">
            <Camera className="w-4 h-4" /> Snapshots
          </button>
          <button onClick={handleClear} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-neo font-semibold flex items-center gap-2 border border-red-200 shadow-sm transition-all">
            <Trash2 className="w-4 h-4" /> Clear Board
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden relative">
        {/* Whiteboard */}
        <div 
          className="flex-1 bg-white border border-slate-200 rounded-neo shadow-sm overflow-hidden relative"
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
              <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm mt-1 whitespace-nowrap">
                {c.name}
              </div>
            </div>
          ))}

          {/* Toolbar */}
          <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
            <div className="bg-white border border-slate-200 rounded-neo shadow-md flex flex-col items-center p-2 gap-2">
              <button onClick={() => canvasRef.current.undo()} className="p-2 hover:bg-slate-50 text-slate-650 rounded-neo transition-all"><Undo className="w-5 h-5"/></button>
              <button onClick={() => canvasRef.current.redo()} className="p-2 hover:bg-slate-50 text-slate-650 rounded-neo transition-all"><Redo className="w-5 h-5"/></button>
              <div className="w-full border-t border-slate-200 my-1" />
              <button onClick={() => { setIsErasing(false); canvasRef.current?.eraseMode(false); }} className={`p-2 rounded-neo transition-all ${!isErasing ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><PenTool className="w-5 h-5"/></button>
              <button onClick={() => { setIsErasing(true); canvasRef.current?.eraseMode(true); }} className={`p-2 rounded-neo transition-all ${isErasing ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><Eraser className="w-5 h-5"/></button>
              <div className="w-full border-t border-slate-200 my-1" />
              {['black', 'red', 'blue', 'green'].map(c => (
                <button 
                  key={c} 
                  onClick={() => { setStrokeColor(c); setIsErasing(false); }} 
                  className={`w-5 h-5 rounded-full border ${strokeColor === c && !isErasing ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'border-slate-350'} hover:scale-110 transition-transform`} 
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
              socketRef.current?.emit('update-paths', { roomId: id, paths: newPaths });
            }}
          />
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-white border border-slate-200 rounded-neo shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-primary/5">
            <h2 className="font-extrabold text-base text-slate-800">Live Chat</h2>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chat.map((c, i) => (
              <div key={i} className={`flex flex-col ${c.sender === user.name ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-semibold text-slate-400 mb-1">{c.sender}</span>
                <div className={`px-3 py-1.5 rounded-neo text-sm font-medium border ${c.sender === user.name ? 'bg-primary text-white border-primary/20' : 'bg-slate-50 border-slate-200/60 text-slate-700'}`}>
                  {c.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="p-3 border-t border-slate-200 bg-slate-50/20 flex gap-2">
            <input 
              type="text" 
              value={msg} 
              onChange={e => setMsg(e.target.value)} 
              className="flex-1 bg-white border border-slate-200 rounded-neo px-3 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-medium text-sm text-slate-700 placeholder:text-slate-450" 
              placeholder="Message..." 
            />
            <button type="submit" className="bg-primary text-white p-2 rounded-neo hover:bg-primary/95 transition-all shadow-sm">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Snapshots Sidebar drawer */}
      {showSnapshots && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-96 bg-white h-full border-l border-slate-200 p-4 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-extrabold text-slate-850">Snapshots</h2>
              <div className="flex gap-2">
                <button onClick={handleSnapshot} className="p-1.5 rounded-neo bg-primary text-white hover:bg-primary/95 transition-all shadow-sm" title="Take Snapshot"><Camera className="w-5 h-5"/></button>
                <button onClick={() => setShowSnapshots(false)} className="p-1.5 rounded-neo border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all"><X className="w-5 h-5"/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {snapshots.length === 0 ? (
                <p className="text-slate-400 font-semibold text-center mt-10">No snapshots yet.</p>
              ) : (
                snapshots.map((s, i) => (
                  <div key={i} className="border border-slate-200 rounded-neo overflow-hidden bg-slate-50/50 shadow-sm relative group">
                    <div className="relative">
                      <img src={s.dataUrl} alt="Snapshot" className="w-full bg-white border-b border-slate-200" />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setFullscreenSnapshot(s.dataUrl)} className="p-1.5 bg-white border border-slate-200 rounded-neo hover:bg-slate-50 text-slate-600 shadow-sm" title="Expand"><Expand className="w-4 h-4"/></button>
                        <button onClick={() => handleDownloadSnapshot(s.dataUrl, s.timestamp)} className="p-1.5 bg-white border border-slate-200 rounded-neo hover:bg-slate-50 text-slate-600 shadow-sm" title="Download"><Download className="w-4 h-4"/></button>
                        {user && user.name === s.createdBy && (
                          <button onClick={() => handleDeleteSnapshot(s.timestamp)} className="p-1.5 bg-white border border-slate-200 rounded-neo hover:bg-red-50 text-red-650 shadow-sm" title="Delete"><Trash2 className="w-4 h-4"/></button>
                        )}
                      </div>
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-xs font-bold text-slate-700">By {s.createdBy}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(s.timestamp).toLocaleString()}</p>
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
          <button onClick={() => setFullscreenSnapshot(null)} className="absolute top-6 right-6 text-white hover:text-red-400 transition-colors bg-white/10 p-2 rounded-full">
            <X className="w-8 h-8" />
          </button>
          <img src={fullscreenSnapshot} alt="Fullscreen Snapshot" className="max-w-full max-h-full object-contain border border-white/20 rounded-neo shadow-2xl" />
        </div>
      )}
    </div>
  );
}
