import model from "../models/categoriesModels.js";
import { AppError } from "../utils/appError.js";

export default class categoriesService {
  static async createCategories({
    parent_id,
    parent_slug,
    ...categoriesData
  }) {
    let parentId = parent_id || null;

    if (!parentId && parent_slug) {
      const parentCategories = await model.getCategoryBySlug(parent_slug);
      if (parentCategories) {
        parentId = parentCategories.id;
      }
    }

    const newCategories = await model.createCategories({
      name: categoriesData.name,
      slug: categoriesData.slug,
      parent_id: parentId,
    });

    return newCategories;
  }

  static async getAllCategories() {
    const categories = await model.getAllCategories();
    return categories;
  }

  static async deleteCategories(categoriesId) {
    const existingCategories = await model.getCategoriesById(categoriesId);
    if (!existingCategories) {
      throw new AppError("Categories not found", 404);
    }
    await model.deleteCategories(categoriesId);
    return true;
  }
}