import { Router } from 'express';
import { z } from 'zod';
import { ContactRequest } from '../../database/models';
import { successResponse } from '../../common/utils/response';
import { authenticate, authorize } from '../../common/middleware/auth';

export const contactRouter = Router();

const submitSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(5).max(2000),
  requestType: z.enum(['contact', 'booking', 'test_ride', 'service']).default('contact'),
});

// Public — submit a contact/booking request
contactRouter.post('/', async (req, res, next) => {
  try {
    const body = submitSchema.parse(req.body);
    const contact = await ContactRequest.create({
      ...body,
      ipAddress: req.ip,
    });
    successResponse(res, { contact }, { statusCode: 201, message: 'Request submitted. Our team will contact you shortly.' });
  } catch (err) {
    next(err);
  }
});

// User — get their own requests
contactRouter.get('/my-requests', authenticate, async (req, res, next) => {
  try {
    const { User } = await import('../../database/models');
    const user = await User.findById(req.user!.userId);
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }
    const requests = await ContactRequest.find({ email: user.email.toLowerCase() }).sort({ createdAt: -1 });
    successResponse(res, { requests });
  } catch (err) {
    next(err);
  }
});

// Admin — list all requests
contactRouter.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const filter: any = {};
    if (status && status !== 'all') filter.status = status;

    const requests = await ContactRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    const total = await ContactRequest.countDocuments(filter);
    const newCount = await ContactRequest.countDocuments({ status: 'new' });

    successResponse(res, { requests, total, newCount });
  } catch (err) {
    next(err);
  }
});

// Admin — update request status + admin reply details (time/place)
contactRouter.patch('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { status, adminNote, adminReplyTime, adminReplyLocation } = req.body;
    const contact = await ContactRequest.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }

    if (status) contact.status = status;
    if (adminNote !== undefined) contact.adminNote = adminNote;
    if (adminReplyTime) contact.adminReplyTime = new Date(adminReplyTime);
    if (adminReplyLocation !== undefined) contact.adminReplyLocation = adminReplyLocation;

    await contact.save();
    successResponse(res, { contact }, { message: 'Request updated successfully' });
  } catch (err) {
    next(err);
  }
});
