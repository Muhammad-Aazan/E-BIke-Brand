import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { updateProfileSchema, addAddressSchema, updateAddressSchema } from './user.validators';

export const userRouter = Router();

userRouter.use(authenticate); // All user routes require authentication

userRouter.get('/profile', userController.getProfile);
userRouter.patch('/profile', validate(updateProfileSchema), userController.updateProfile);

userRouter.get('/addresses', userController.getAddresses);
userRouter.post('/addresses', validate(addAddressSchema), userController.addAddress);
userRouter.patch('/addresses/:addressId', validate(updateAddressSchema), userController.updateAddress);
userRouter.delete('/addresses/:addressId', userController.deleteAddress);

userRouter.get('/orders', userController.getOrderHistory);
userRouter.get('/orders/:orderNumber', userController.getOrderDetail);
