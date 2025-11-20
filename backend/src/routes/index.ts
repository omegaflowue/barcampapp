import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { VotingController } from '../controllers/voting.controller';
import { EventController } from '../controllers/event.controller';
import { ScheduleController } from '../controllers/schedule.controller';

const router = Router();

// Initialize controllers
const sessionController = new SessionController();
const votingController = new VotingController();
const eventController = new EventController();
const scheduleController = new ScheduleController();

// Event routes
router.get('/events', eventController.getAllEvents.bind(eventController));
router.get('/events/:id', eventController.getEvent.bind(eventController));
router.post('/events', eventController.createEvent.bind(eventController));
router.patch('/events/:id/status', eventController.updateEventStatus.bind(eventController));
router.delete('/events/:id', eventController.deleteEvent.bind(eventController));

// Room routes
router.get('/events/:eventId/rooms', eventController.getRooms.bind(eventController));
router.post('/events/:eventId/rooms', eventController.createRoom.bind(eventController));
router.delete('/rooms/:id', eventController.deleteRoom.bind(eventController));

// Time slot routes
router.get('/events/:eventId/time-slots', eventController.getTimeSlots.bind(eventController));
router.post('/events/:eventId/time-slots', eventController.createTimeSlot.bind(eventController));
router.delete('/time-slots/:id', eventController.deleteTimeSlot.bind(eventController));

// Session routes
router.get('/events/:eventId/sessions', sessionController.getAllSessions.bind(sessionController));
router.get('/sessions/:id', sessionController.getSession.bind(sessionController));
router.post('/events/:eventId/sessions', sessionController.createSession.bind(sessionController));
router.put('/sessions/:id', sessionController.updateSession.bind(sessionController));
router.delete('/sessions/:id', sessionController.deleteSession.bind(sessionController));

// Voting routes
router.post('/sessions/:id/vote', votingController.addVote.bind(votingController));
router.delete('/sessions/:id/vote', votingController.removeVote.bind(votingController));
router.get('/users/:userId/votes', votingController.getUserVotes.bind(votingController));

// Schedule routes
router.get('/events/:eventId/schedule', scheduleController.getSchedule.bind(scheduleController));
router.post('/events/:eventId/schedule/optimize', scheduleController.optimizeSchedule.bind(scheduleController));
router.post('/events/:eventId/schedule/publish', scheduleController.publishSchedule.bind(scheduleController));
router.delete('/events/:eventId/schedule', scheduleController.clearSchedule.bind(scheduleController));

export default router;
