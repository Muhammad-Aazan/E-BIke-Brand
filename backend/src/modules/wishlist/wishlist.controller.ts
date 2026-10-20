import { Request, Response, NextFunction } from 'express';
import * as wishlistService from './wishlist.service';
import { successResponse } from '../../common/utils/response';

export async function getWishlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const wishlist = await wishlistService.getWishlist(req.user!.userId);
    successResponse(res, { wishlist });
  } catch (err) {
    next(err);
  }
}

export async function addToWishlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const wishlist = await wishlistService.addToWishlist(
      req.user!.userId,
      req.params.productId as string
    );
    successResponse(res, { wishlist }, { message: 'Product added to wishlist' });
  } catch (err) {
    next(err);
  }
}

export async function removeFromWishlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const wishlist = await wishlistService.removeFromWishlist(
      req.user!.userId,
      req.params.productId as string
    );
    successResponse(res, { wishlist }, { message: 'Product removed from wishlist' });
  } catch (err) {
    next(err);
  }
}
