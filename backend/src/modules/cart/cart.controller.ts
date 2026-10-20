import { Request, Response, NextFunction } from 'express';
import * as cartService from './cart.service';
import { successResponse } from '../../common/utils/response';

function getCartIdentifiers(req: Request): { userId?: string; sessionId?: string } {
  return {
    userId: req.user?.userId,
    sessionId: req.user ? undefined : (req.headers['x-session-id'] as string),
  };
}

export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const cart = await cartService.getOrCreateCart(userId, sessionId);
    const summary = await cartService.getCartSummary(cart);
    successResponse(res, { cart: summary });
  } catch (err) {
    next(err);
  }
}

export async function addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const { productId, variantId, quantity } = req.body;
    const cart = await cartService.addItem(userId, sessionId, productId, variantId, quantity);
    const summary = await cartService.getCartSummary(cart);
    successResponse(res, { cart: summary }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const cart = await cartService.updateItem(
      userId,
      sessionId,
      req.params.itemId as string,
      req.body.quantity
    );
    const summary = await cartService.getCartSummary(cart);
    successResponse(res, { cart: summary });
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const cart = await cartService.removeItem(userId, sessionId, req.params.itemId as string);
    const summary = await cartService.getCartSummary(cart);
    successResponse(res, { cart: summary });
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    await cartService.clearCart(userId, sessionId);
    successResponse(res, null, { message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
}
