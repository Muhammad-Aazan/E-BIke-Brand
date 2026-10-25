import mongoose from 'mongoose';
import { Product, Category, IProduct } from '../../database/models';
import { NotFoundError, ConflictError } from '../../common/errors/AppError';
import { slugify } from '../../common/utils/slugify';
import { paginationMeta, PaginationMeta } from '../../common/utils/response';
import { ProductQueryInput, CreateProductInput, UpdateProductInput } from './product.validators';

export async function getProducts(
  query: ProductQueryInput,
  isAdmin = false
): Promise<{ products: IProduct[]; meta: PaginationMeta }> {
  const filter: Record<string, unknown> = {};

  if (!isAdmin || !query.includeInactive) filter.isActive = true;

  if (query.category) {
    if (mongoose.isValidObjectId(query.category)) {
      filter.category = new mongoose.Types.ObjectId(query.category);
    } else {
      const catSlug = query.category.toLowerCase().trim();
      const matchedCat = await Category.findOne({
        $or: [
          { slug: catSlug },
          { slug: `electric-${catSlug}` },
          { slug: `ev-${catSlug}` },
          { slug: { $regex: catSlug.replace(/s$/, ''), $options: 'i' } },
        ],
      });

      if (matchedCat) {
        filter.category = matchedCat._id;
      } else {
        const typeMatch = catSlug.replace(/s$/, '').toLowerCase();
        if (['motorcycle', 'scooter', 'accessory', 'part'].includes(typeMatch)) {
          filter.productType = typeMatch;
        }
      }
    }
  }

  if (query.productType) filter.productType = query.productType;
  if (query.featured) filter.isFeatured = true;

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (query.minPrice !== undefined) priceFilter.$gte = query.minPrice;
    if (query.maxPrice !== undefined) priceFilter.$lte = query.maxPrice;
    filter.basePrice = priceFilter;
  }

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.color) {
    filter['colorVariants.name'] = { $regex: query.color, $options: 'i' };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc: { basePrice: 1 },
    price_desc: { basePrice: -1 },
    newest: { createdAt: -1 },
    popular: { soldCount: -1 },
    featured: { isFeatured: -1, createdAt: -1 },
    rating: { averageRating: -1 },
  };

  const sort = sortMap[query.sort || 'newest'] || sortMap.newest;
  const skip = (query.page - 1) * query.limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  return { products, meta: paginationMeta(query.page, query.limit, total) };
}

export async function getProductBySlug(slug: string, isAdmin = false): Promise<IProduct> {
  const filter: Record<string, unknown> = { slug };
  if (!isAdmin) filter.isActive = true;

  const product = await Product.findOne(filter).populate('category', 'name slug');
  if (!product) throw new NotFoundError('Product');
  return product;
}

export async function getProductById(id: string): Promise<IProduct> {
  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) throw new NotFoundError('Product');
  return product;
}

export async function getFeaturedProducts(limit = 8): Promise<IProduct[]> {
  return Product.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name slug');
}

export async function getRelatedProducts(productId: string, limit = 6): Promise<IProduct[]> {
  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError('Product');

  return Product.find({
    _id: { $ne: productId },
    isActive: true,
    $or: [
      { category: product.category },
      { productType: product.productType },
      { tags: { $in: product.tags } },
    ],
  })
    .limit(limit);
}

export async function createProduct(data: CreateProductInput): Promise<IProduct> {
  const slug = data.slug || slugify(data.name);

  let categoryId: mongoose.Types.ObjectId;
  if (data.category && mongoose.isValidObjectId(data.category)) {
    const category = await Category.findById(data.category);
    if (!category) throw new NotFoundError('Category');
    categoryId = category._id as mongoose.Types.ObjectId;
  } else {
    // Auto-match or find first category
    const matchedCategory = await Category.findOne(
      data.productType === 'accessory' || data.productType === 'part'
        ? { slug: 'ev-accessories' }
        : { slug: 'electric-motorcycles' }
    ) || await Category.findOne();
    if (!matchedCategory) throw new NotFoundError('No default category found in database');
    categoryId = matchedCategory._id as mongoose.Types.ObjectId;
  }

  const existingSlug = await Product.findOne({ slug });
  if (existingSlug) throw new ConflictError('Product with this slug already exists');

  const existingSku = await Product.findOne({ sku: data.sku });
  if (existingSku) throw new ConflictError('Product with this SKU already exists');

  return Product.create({
    ...data,
    slug,
    category: categoryId,
  } as any);
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<IProduct> {
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
  const product = await Product.findOne(query);
  if (!product) throw new NotFoundError('Product');

  const productId = product._id.toString();

  if (data.slug && data.slug !== product.slug) {
    const exists = await Product.findOne({ slug: data.slug, _id: { $ne: productId } });
    if (exists) throw new ConflictError('Slug already in use');
  }

  if (data.sku && data.sku !== product.sku) {
    const exists = await Product.findOne({ sku: data.sku, _id: { $ne: productId } });
    if (exists) throw new ConflictError('SKU already in use');
  }

  if (data.category) {
    if (mongoose.isValidObjectId(data.category)) {
      const category = await Category.findById(data.category);
      if (!category) throw new NotFoundError('Category');
      (product as any).category = category._id;
    } else {
      const category = await Category.findOne({ slug: data.category });
      if (category) {
        (product as any).category = category._id;
      }
    }
  }

  const { category: _cat, ...otherUpdates } = data;
  Object.assign(product, otherUpdates);
  await product.save();
  return (await Product.findById(product._id).populate('category', 'name slug')) || product;
}

export async function archiveProduct(id: string): Promise<void> {
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
  const result = await Product.findOneAndUpdate(query, { isActive: false });
  if (!result) throw new NotFoundError('Product');
}

export async function deleteProduct(id: string): Promise<void> {
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
  const result = await Product.findOneAndDelete(query);
  if (!result) throw new NotFoundError('Product');
}
