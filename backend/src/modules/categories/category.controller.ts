import { Request, Response, NextFunction } from 'express';
import * as categoryService from './category.service';
import { successResponse } from '../../common/utils/response';

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true' && req.user?.role === 'admin';
    const parent = req.query.parent as string | undefined;
    const categories = await categoryService.getCategories({ includeInactive, parent });
    successResponse(res, { categories });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug as string);
    successResponse(res, { category });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.createCategory(req.body);
    successResponse(res, { category }, { statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await categoryService.updateCategory(req.params.id as string, req.body);
    successResponse(res, { category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await categoryService.deleteCategory(req.params.id as string);
    successResponse(res, null, { message: 'Category deactivated' });
  } catch (err) {
    next(err);
  }
}
