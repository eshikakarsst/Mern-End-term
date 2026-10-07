const mongoose = require("mongoose");
const Product = require("../models/product.model");

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || !category || !image ||
            price === undefined || price === null ||
            stock === undefined || stock === null) {
            return res.status(400).json({
                success: false,
                message: "Name, description, price, category, image and stock are required"
            });
        }

        if (Number(price) <= 0 || Number.isNaN(Number(price))) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0"
            });
        }

        if (Number(stock) < 0 || Number.isNaN(Number(stock))) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative"
            });
        }

        const product = await Product.create({
            name,
            description,
            price: Number(price),
            category,
            image,
            stock: Number(stock)
        });

        return res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors)
                    .map((item) => item.message)
                    .join(", ")
            });
        }

        console.error("Create product error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        const query = {};

        if (search?.trim()) {
            query.name = { $regex: search.trim(), $options: "i" };
        }

        if (category?.trim() && category !== "All Categories") {
            query.category = category.trim();
        }

        const products = await Product.find(query)
            .select("name description price category image stock createdAt")
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Get products error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id).select(
            "name description price category image stock createdAt"
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Get product error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    deleteProduct
};
