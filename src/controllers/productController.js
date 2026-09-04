import services from "../services/productServices.js";

export default class productController {
  static async createProduct(req, res, next) {
    try {
      const payload = req.body;

      if (req.file && req.file.savedPath) {
        payload.img_url = req.file.savedPath;
      }

      const newProduct = await services.createProduct(payload);

      return res.status(201).json({
        status: "success",
        message: "Success created product",
        payload: newProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProduct(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const allProduct = await services.getProduct(limit, offset);

      return res.status(200).json({
        status: "success",
        message: "Success fetch product list",
        payload: allProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductDetail(req, res, next) {
    try {
      const productId = req.params.id;

      const productDetail = await services.getProductDetail(productId);

      return res.status(200).json({
        status: "success",
        message: "Success fetch product detail",
        payload: productDetail,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const productId = req.params.id;
      const payload = req.body;

      if (req.file && req.file.savedPath) {
        payload.img_url = req.file.savedPath;
      }

      const updateProduct = await services.updateProduct(
        productId,
        payload,
      );

      return res.status(200).json({
        status: "success",
        message: "Success update product",
        payload: updateProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const productId = req.params.id;

      await services.deleteProduct(productId);

      return res.status(200).json({
        status: "success",
        message: "Success delete product",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBySlugPath(req, res, next) {
    try {
      const slugPath = req.params.slugPath;
      let slugPathArray = [];

      if (Array.isArray(slugPath)) {
        slugPathArray = slugPath.map((s) => decodeURIComponent(s).trim()).filter(Boolean);
      } else if (typeof slugPath === "string") {
        slugPathArray = slugPath.split("/").map((s) => decodeURIComponent(s).trim()).filter(Boolean);
      } else {
        const rawPath = (req.params[0] || req.path).replace(/^\/api\/categories\/?/, "").replace(/^\/+|\/+$/g, "");
        slugPathArray = rawPath ? rawPath.split("/").map((s) => decodeURIComponent(s).trim()).filter(Boolean) : [];
      }

      if (slugPathArray.length === 0) {
        return res.status(400).json({ status: "fail", message: "Invalid path" });
      }

      const result = await services.slugHandler(slugPathArray);

      return res.status(200).json({
        status: "success",
        message: `Success fetch ${result.type} detail`,
        payload: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
