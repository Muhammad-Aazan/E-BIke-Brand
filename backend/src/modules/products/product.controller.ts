import { Request, Response, NextFunction } from 'express';
import * as productService from './product.service';
import { successResponse } from '../../common/utils/response';
import { productQuerySchema } from './product.validators';

export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = productQuerySchema.parse(req.query);
    const isAdmin = req.user?.role === 'admin';
    const result = await productService.getProducts(query, isAdmin);
    successResponse(res, { products: result.products }, { meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = req.user?.role === 'admin';
    const product = await productService.getProductBySlug(req.params.slug as string, isAdmin);
    successResponse(res, { product });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = parseInt((req.query.limit as string) || '8', 10);
    const products = await productService.getFeaturedProducts(Math.min(limit, 20));
    successResponse(res, { products });
  } catch (err) {
    next(err);
  }
}

export async function getRelatedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await productService.getRelatedProducts(req.params.id as string);
    successResponse(res, { products });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.createProduct(req.body);
    successResponse(res, { product }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.updateProduct(req.params.id as string, req.body);
    successResponse(res, { product });
  } catch (err) {
    next(err);
  }
}

export async function archiveProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productService.archiveProduct(req.params.id as string);
    successResponse(res, null, { message: 'Product archived' });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productService.deleteProduct(req.params.id as string);
    successResponse(res, null, { message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}
