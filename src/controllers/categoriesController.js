import services from "../services/categoriesService.js";

export default class categoriesController {
  static async createCategories(req, res, next) {
    try {
      const payload = req.body;

      const newCategories = await services.createCategories(payload);

      return res.status(201).json({
        status: "success",
        message: "Success created categories",
        payload: newCategories,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const allCategories = await services.getAllCategories();

      return res.status(200).json({
        status: "success",
        message: "Success fetch categories",
        payload: allCategories,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategories(req, res, next) {
    try {
      const categoriesId = req.params.id;

      await services.deleteCategories(categoriesId);

      return res.status(200).json({
        status: "success",
        message: "Success delete categories",
      });
    } catch (error) {
      next(error);
    }
  }
}