import { Router } from 'express';
import * as cartController from './cart.controller';
import { optionalAuth } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { addCartItemSchema, updateCartItemSchema } from './cart.validators';

export const cartRouter = Router();

// All cart endpoints support both authenticated and guest (sessionId) access
cartRouter.get('/', optionalAuth, cartController.getCart);
cartRouter.post('/items', optionalAuth, validate(addCartItemSchema), cartController.addItem);
cartRouter.patch('/items/:itemId', optionalAuth, validate(updateCartItemSchema), cartController.updateItem);
cartRouter.delete('/items/:itemId', optionalAuth, cartController.removeItem);
cartRouter.delete('/', optionalAuth, cartController.clearCart);
