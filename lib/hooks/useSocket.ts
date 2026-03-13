import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const useSocket = (sessionId?: string) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL);
        }

        const socket = socketRef.current;

        socket.on('connect', () => {
            setIsConnected(true);
            if (sessionId) {
                socket.emit('join-session', sessionId);
            }
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            if (socket) {
                socket.disconnect();
                socketRef.current = null;
            }
        };
    }, [sessionId]);

    const emit = (event: string, data: any) => {
        if (socketRef.current) {
            socketRef.current.emit(event, { ...data, sessionId });
        }
    };

    const on = (event: string, callback: (data: any) => void) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    };

    return { socket: socketRef.current, isConnected, emit, on };
};
