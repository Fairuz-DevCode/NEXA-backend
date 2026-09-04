import pool from "../config/db.js";
import model from "../models/productModel.js";
import { AppError } from "../utils/appError.js";

export default class productServices {
  static async createProduct({ variants, ...productData }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const newProduct = await model.createProduct(
        client,
        productData,
      );

      const createdVariants = [];

      if (variants && variants.length > 0) {
        for (const variant of variants) {
          const newVariant = await model.createVariant(
            client,
            newProduct.id,
            variant,
          );
          createdVariants.push(newVariant);
        }
      }

      await client.query("COMMIT");

      return {
        ...newProduct,
        variants: createdVariants,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async getProduct(limit = 10, offset = 0) {
    const product = await model.getAllProducts(limit, offset);
    return product;
  }

  static async getProductDetail(productId) {
    const productDetail = await model.getProductById(productId);
    if (!productDetail) {
      throw new AppError("Product not found", 404);
    }
    return productDetail;
  }

  static async updateProduct(
    productId,
    { variants, ...productData },
  ) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const updatedProduct = await model.updateProduct(
        client,
        productId,
        productData,
      );

      if (!updatedProduct) {
        throw new AppError("Product not found", 404);
      }

      const processedVariants = [];
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          if (variant.id) {
            const updatedVariant = await model.updateProductVariant(
              client,
              variant.id,
              variant,
            );
            processedVariants.push(updatedVariant);
          } else {
            const newVariant = await model.createVariant(
              client,
              productId,
              variant,
            );
            processedVariants.push(newVariant);
          }
        }
      }

      await client.query("COMMIT");

      return {
        ...updatedProduct,
        variants: processedVariants,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteProduct(productId) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await model.deleteVariants(client, productId);

      const deletedProduct = await model.deleteProduct(client, productId);

      if (!deletedProduct) {
        throw new AppError("Product not found", 404);
      }

      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async slugHandler(slugPathArray) {
    if (!slugPathArray || slugPathArray.length === 0) {
      throw new AppError(
        "Invalid category or product path",
        400,
      );
    }

    // 1. Attempt to match category hierarchy from path array
    let currentParentId = null;
    let categoryHierarchy = [];
    let isCategoryHierarchyValid = true;

    for (let i = 0; i < slugPathArray.length; i++) {
      const slug = slugPathArray[i];
      const category = await model.findCategories(
        slug,
        currentParentId,
      );
      if (category) {
        categoryHierarchy.push(category);
        currentParentId = category.id;
      } else {
        isCategoryHierarchyValid = false;
        break;
      }
    }

    // If entire path matches a category hierarchy:
    if (
      isCategoryHierarchyValid &&
      categoryHierarchy.length === slugPathArray.length
    ) {
      const targetCategory =
        categoryHierarchy[categoryHierarchy.length - 1];
      const subcategories = await model.getSubcategories(
        targetCategory.id,
      );
      const products = await model.getProductsByCategoryId(
        targetCategory.id,
      );

      return {
        type: "category",
        category: {
          ...targetCategory,
          hierarchy: categoryHierarchy,
        },
        subcategories,
        products,
        path: `/categories/${slugPathArray.join("/")}`,
      };
    }

    // 2. If path doesn't match a full category hierarchy, check if last segment is a product slug
    const lastSlug = slugPathArray[slugPathArray.length - 1];
    const product = await model.getProductBySlug(lastSlug);

    if (product) {
      // Fetch category detail for this product
      const category = await model.getCategoriesById(
        product.category_id,
      );

      // Build parent path chain for category
      let categoryBreadcrumbs = [];
      if (category) {
        let currCat = category;
        categoryBreadcrumbs.unshift(currCat);
        while (currCat && currCat.parent_id) {
          currCat = await model.getCategoriesById(
            currCat.parent_id,
          );
          if (currCat) categoryBreadcrumbs.unshift(currCat);
        }
      }

      return {
        type: "product",
        product: {
          ...product,
          category: category
            ? {
                ...category,
                path: `/categories/${categoryBreadcrumbs.map((c) => c.slug).join("/")}`,
              }
            : null,
        },
        path: `/categories/${slugPathArray.join("/")}`,
      };
    }

    // 3. Neither category nor product found
    throw new AppError(
      "Category or product not found",
      404,
    );
  }
}
