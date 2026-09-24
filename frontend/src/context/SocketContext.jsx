import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  useEffect(() => {
    const newSocket = io(window.location.origin.replace('3000', '5000'), {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('join_user', user.id);
    if (user.authority_id) {
      socket.emit('join_authority', user.authority_id);
    }
    socket.emit('join_role', user.role);

    socket.on('notification', (data) => {
      setToastNotification(data);
      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setToastNotification(null);
      }, 6000);
    });

    return () => {
      socket.off('notification');
    };
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, toastNotification, setToastNotification }}>
      {children}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white border border-indigo-200 text-slate-900 p-4 rounded-xl shadow-lg border-l-4 border-l-indigo-600 animate-bounce">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-indigo-900 text-sm">{toastNotification.title}</h4>
              <p className="text-xs text-slate-600 mt-1">{toastNotification.message}</p>
            </div>
            <button 
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold ml-3"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
