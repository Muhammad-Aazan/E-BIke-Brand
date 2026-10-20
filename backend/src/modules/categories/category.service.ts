import { Category, ICategory } from '../../database/models';
import { NotFoundError, ConflictError } from '../../common/errors/AppError';
import { slugify } from '../../common/utils/slugify';

export async function getCategories(options: {
  includeInactive?: boolean;
  parent?: string | null;
}): Promise<ICategory[]> {
  const filter: Record<string, unknown> = {};
  if (!options.includeInactive) filter.isActive = true;
  if (options.parent !== undefined) filter.parent = options.parent || null;

  return Category.find(filter).sort({ sortOrder: 1, name: 1 });
}

export async function getCategoryBySlug(slug: string): Promise<ICategory> {
  const category = await Category.findOne({ slug, isActive: true });
  if (!category) throw new NotFoundError('Category');
  return category;
}

export async function getCategoryTree(): Promise<ICategory[]> {
  return Category.find({ isActive: true, parent: null }).sort({ sortOrder: 1 });
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parent?: string;
  isActive?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}): Promise<ICategory> {
  const slug = data.slug || slugify(data.name);

  const existing = await Category.findOne({ slug });
  if (existing) throw new ConflictError('Category with this slug already exists');

  return Category.create({ ...data, slug });
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    image: string;
    parent: string;
    isActive: boolean;
    sortOrder: number;
    seoTitle: string;
    seoDescription: string;
  }>
): Promise<ICategory> {
  const category = await Category.findById(id);
  if (!category) throw new NotFoundError('Category');

  if (data.slug && data.slug !== category.slug) {
    const exists = await Category.findOne({ slug: data.slug, _id: { $ne: id } });
    if (exists) throw new ConflictError('Category with this slug already exists');
  }

  Object.assign(category, data);
  return category.save();
}

export async function deleteCategory(id: string): Promise<void> {
  const category = await Category.findById(id);
  if (!category) throw new NotFoundError('Category');
  category.isActive = false;
  await category.save();
}
