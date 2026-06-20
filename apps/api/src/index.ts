import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import assetRoutes from './routes/assets';
import threatRoutes from './routes/threats';
import vulnerabilityRoutes from './routes/vulnerabilities';
import aiRoutes from './routes/ai';
import remediationRoutes from './routes/remediation';
import basRoutes from './routes/bas';
import devsecopsRoutes from './routes/devsecops';
import incidentRoutes from './routes/incidents';
import reportRoutes from './routes/reports';
import knowledgeBaseRoutes from './routes/knowledge-base';
import dashboardRoutes from './routes/dashboard';
import settingsRoutes from './routes/settings';
import auditLogRoutes from './routes/audit-log';
import { authMiddleware } from './middleware/auth';
import { setupSocketHandlers } from './services/socket';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: '*', methods: ['GET', 'POST'] } });

export const prisma = new PrismaClient();
export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'kiber-dnt-api' }));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/assets', authMiddleware, assetRoutes);
app.use('/api/threats', authMiddleware, threatRoutes);
app.use('/api/vulnerabilities', authMiddleware, vulnerabilityRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/remediation', authMiddleware, remediationRoutes);
app.use('/api/bas', authMiddleware, basRoutes);
app.use('/api/devsecops', authMiddleware, devsecopsRoutes);
app.use('/api/incidents', authMiddleware, incidentRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/knowledge-base', authMiddleware, knowledgeBaseRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/audit-log', authMiddleware, auditLogRoutes);

// Socket.io
setupSocketHandlers(io);

const PORT = parseInt(process.env.API_PORT || '4000');
httpServer.listen(PORT, () => {
  console.log(`🧬 Kiber-DNT API running on port ${PORT}`);
  console.log(`   REST: http://localhost:${PORT}/api`);
  console.log(`   WS:   ws://localhost:${PORT}`);
});
