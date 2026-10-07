const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId).select("_id");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const alreadySaved = req.user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadySaved) {
            return res.status(409).json({
                success: false,
                message: "Product is already in wishlist"
            });
        }

        req.user.wishlist.push(product._id);
        await req.user.save();

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (error) {
        console.error("Add wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getWishlist = async (req, res) => {
    try {
        req.params
        const customer = await Customer.findById(req.user._id)
            .populate({
                path: "wishlist",
                select: "name description price category image stock"
            });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const wishlist = (customer.wishlist || []).filter(Boolean);

        return res.json({
            success: true,
            count: wishlist.length,
            wishlist
        });
    } catch (error) {
        console.error("Get wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const index = req.user.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product is not in wishlist"
            });
        }

        req.user.wishlist.splice(index, 1);
        await req.user.save();

        return res.json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (error) {
        console.error("Remove wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};
