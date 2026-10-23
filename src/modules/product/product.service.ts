import pool from "../../config/db.js";
import { ProductModel } from "./product.model.js";
import { CreateProductDTO, ProductResponse, UpdateProductDTO } from "./product.types.js";
import { AppError } from "../../utils/appError.js";

export class ProductServices {
  static async createProduct({ variants, ...productData }: CreateProductDTO): Promise<ProductResponse> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const newProduct = await ProductModel.createProduct(client, productData);

      const createdVariants: any[] = [];

      if (variants && variants.length > 0) {
        for (const variant of variants) {
          const newVariant = await ProductModel.createVariant(client, newProduct.id, variant);
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

  static async getProduct(limit = 10, offset = 0): Promise<{ products: ProductResponse[]; totalItems: number }> {
    return await ProductModel.getAllProducts(limit, offset);
  }

  static async getProductFeed(
    limit: number = 10,
    cursor?: number,
    search?: string
  ): Promise<{ products: ProductResponse[]; nextCursor: number | null }> {
    return await ProductModel.getProductsByCursor(limit, cursor, search);
  }

  static async getProductDetail(productId: number | string): Promise<ProductResponse> {
    const productDetail = await ProductModel.getProductById(productId);
    if (!productDetail) {
      throw new AppError("Product not found", 404);
    }
    return productDetail;
  }

  static async updateProduct(
    productId: number | string,
    { variants, ...productData }: UpdateProductDTO
  ): Promise<ProductResponse> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const updatedProduct = await ProductModel.updateProduct(client, productId, productData);

      if (!updatedProduct) {
        throw new AppError("Product not found", 404);
      }

      const processedVariants: any[] = [];
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          if (variant.id) {
            const updatedVariant = await ProductModel.updateProductVariant(client, variant.id, variant);
            processedVariants.push(updatedVariant);
          } else {
            const newVariant = await ProductModel.createVariant(client, Number(productId), variant);
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

  static async deleteProduct(productId: number | string): Promise<boolean> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await ProductModel.deleteVariants(client, productId);

      const deletedProduct = await ProductModel.deleteProduct(client, productId);

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

  static async slugHandler(slugPathArray: string[]): Promise<any> {
    if (!slugPathArray || slugPathArray.length === 0) {
      throw new AppError("Invalid category or product path", 400);
    }

    let currentParentId: number | null = null;
    const categoryHierarchy: any[] = [];
    let isCategoryHierarchyValid = true;

    for (let i = 0; i < slugPathArray.length; i++) {
      const slug = slugPathArray[i];
      const category = await ProductModel.findCategories(slug, currentParentId);
      if (category) {
        categoryHierarchy.push(category);
        currentParentId = category.id;
      } else {
        isCategoryHierarchyValid = false;
        break;
      }
    }

    if (isCategoryHierarchyValid && categoryHierarchy.length === slugPathArray.length) {
      const targetCategory = categoryHierarchy[categoryHierarchy.length - 1];
      const subcategories = await ProductModel.getSubcategories(targetCategory.id);
      const products = await ProductModel.getProductsByCategoryId(targetCategory.id);

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

    const lastSlug = slugPathArray[slugPathArray.length - 1];
    const product = await ProductModel.getProductBySlug(lastSlug);

    if (product) {
      const category = await ProductModel.getCategoriesById(product.category_id);

      const categoryBreadcrumbs: any[] = [];
      if (category) {
        // Optimasi N+1: Ambil hirarki kategori sekaligus menggunakan recursive CTE dalam 1 kali query
        const hierarchyResult = await pool.query(
          `WITH RECURSIVE category_tree AS (
             SELECT id, name, slug, parent_id FROM categories WHERE id = $1
             UNION ALL
             SELECT c.id, c.name, c.slug, c.parent_id 
             FROM categories c
             INNER JOIN category_tree ct ON ct.parent_id = c.id
           )
           SELECT id, name, slug, parent_id FROM category_tree;`,
          [category.id]
        );
        // Hasil unshift agar urut dari root parent ke child
        categoryBreadcrumbs.push(...hierarchyResult.rows.reverse());
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

    throw new AppError("Category or product not found", 404);
  }
}
