import { Router } from 'express';
import AuthController from './authController';
import CalendarController from './calendarController';
import ChatController from './chatController';
import authMiddleware from '../utils/authMiddleware';

const router = Router();
const authController = new AuthController();
const calendarController = new CalendarController();
const chatController = new ChatController();

// Auth routes
router.post('/auth/authenticate', authController.authenticate);
router.get('/auth/validate', authController.validateToken);
router.post('/auth/clear-cache', authMiddleware, authController.clearUserCache);

// Calendar routes
router.get('/calendar/events', authMiddleware, calendarController.getEvents);
router.get('/calendar/events/:eventId', authMiddleware, calendarController.getEvent);
router.post('/calendar/events/:eventId/insights', authMiddleware, calendarController.generateInsights);

// Chat routes
router.get('/chat/:chatId/messages', authMiddleware, chatController.getMessages);
router.post('/chat/:chatId/insights', authMiddleware, chatController.generateInsights);

export default router;