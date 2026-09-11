import Product from "../models/Product.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import ApiFeatures from "../utils/apiFeatures.js";

// @desc    Get all products (search, filter, sort, paginate)
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const baseQuery = Product.find({ isActive: true });
  const features = new ApiFeatures(baseQuery, req.query).search().filter().sort().paginate();

  const [products, total] = await Promise.all([
    features.query,
    Product.countDocuments({ isActive: true }),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: { products },
  });
});

// @desc    Get single product by id or slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
  const product = isObjectId
    ? await Product.findById(id)
    : await Product.findOne({ slug: id });

  if (!product || !product.isActive) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({ success: true, data: { product } });
});

// @desc    Get distinct categories
// @route   GET /api/products/meta/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  res.status(200).json({ success: true, data: { categories } });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: "Product created", data: { product } });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) throw new AppError("Product not found", 404);

  res.status(200).json({ success: true, message: "Product updated", data: { product } });
});

// @desc    Delete (soft-delete) a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) throw new AppError("Product not found", 404);

  res.status(200).json({ success: true, message: "Product removed" });
});

// @desc    Add a product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found", 404);

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) throw new AppError("You have already reviewed this product", 400);

  product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
  product.ratingsCount = product.reviews.length;
  product.ratingsAverage =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ success: true, message: "Review added", data: { product } });
});
