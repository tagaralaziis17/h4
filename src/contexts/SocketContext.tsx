import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const retryDelay = 5000;

  useEffect(() => {
    // Use HTTPS for socket connection
    const socketUrl = import.meta.env.VITE_SOCKET_SERVER || 'https://dev-suhu.umm.ac.id';
    
    const socketInstance = io(socketUrl, {
      reconnectionAttempts: maxRetries,
      reconnectionDelay: retryDelay,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      forceNew: true,
      withCredentials: true,
      secure: true, // Force secure connection
      rejectUnauthorized: false, // Accept self-signed certificates
      extraHeaders: {
        'Access-Control-Allow-Credentials': 'true'
      }
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully via HTTPS');
      setConnected(true);
      setRetryCount(0);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setRetryCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= maxRetries) {
          console.log('Max retry attempts reached');
          socketInstance.disconnect();
        }
        return newCount;
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [retryCount]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};