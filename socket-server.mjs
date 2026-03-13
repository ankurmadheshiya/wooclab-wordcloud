import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*', // In production, restrict this to your domain
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-session', (sessionId) => {
        socket.join(sessionId);
        console.log(`Socket ${socket.id} joined session: ${sessionId}`);
    });

    socket.on('next-slide', ({ sessionId, index }) => {
        io.to(sessionId).emit('slide-changed', { index });
    });

    socket.on('submit-response', ({ sessionId, slideId, response }) => {
        // Broadcast to host only or everyone? Usually host needs it for charts
        io.to(sessionId).emit('new-response', { slideId, response });
    });

    socket.on('ask-question', ({ sessionId, question }) => {
        io.to(sessionId).emit('new-question', { question });
    });

    socket.on('upvote-question', ({ sessionId, questionId }) => {
        io.to(sessionId).emit('question-upvoted', { questionId });
    });

    socket.on('send-reaction', ({ sessionId, emoji }) => {
        io.to(sessionId).emit('reaction-received', { emoji });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Socket.IO server running on port ${PORT}`);
});
