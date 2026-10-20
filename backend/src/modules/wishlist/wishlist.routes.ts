import { Router } from 'express';
import * as wishlistController from './wishlist.controller';
import { authenticate } from '../../common/middleware/auth';

export const wishlistRouter = Router();

wishlistRouter.use(authenticate);

wishlistRouter.get('/', wishlistController.getWishlist);
wishlistRouter.post('/:productId', wishlistController.addToWishlist);
wishlistRouter.delete('/:productId', wishlistController.removeFromWishlist);
