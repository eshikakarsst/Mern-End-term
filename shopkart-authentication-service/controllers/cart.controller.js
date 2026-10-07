const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const populateCart = (customerId) =>
    Customer.findById(customerId).populate({
        path: "cart.product",
        select: "name description price category image stock"
    });

const getCartResponse = (customer) =>
    (customer.cart || [])
        .filter((item) => item.product)
        .map((item) => ({
            product: item.product,
            quantity: item.quantity
        }));

const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        req.user.cart = req.user.cart || [];

        const product = await Product.findById(productId).select("_id stock");

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (product.stock < 1) {
            return res.status(400).json({ success: false, message: "Product is out of stock" });
        }

        const existing = req.user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (existing) {
            if (existing.quantity + 1 > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} unit${product.stock === 1 ? "" : "s"} available`
                });
            }
            existing.quantity += 1;
        } else {
            req.user.cart.push({ product: product._id, quantity: 1 });
        }

        await req.user.save();
        const customer = await populateCart(req.user._id);

        return res.json({
            success: true,
            message: "Cart updated",
            cart: getCartResponse(customer)
        });
    } catch (error) {
        console.error("Add cart error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getCart = async (req, res) => {
    try {
        const customer = await populateCart(req.user._id);

        if (!customer) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        return res.json({
            success: true,
            cart: getCartResponse(customer)
        });
    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
            return res.status(400).json({ success: false, message: "Quantity must be a whole number" });
        }

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
        }

        req.user.cart = req.user.cart || [];

        const cartItem = req.user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Product is not in cart" });
        }

        const product = await Product.findById(productId).select("_id stock");

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} unit${product.stock === 1 ? "" : "s"} available`
            });
        }

        cartItem.quantity = quantity;
        await req.user.save();

        const customer = await populateCart(req.user._id);

        return res.json({
            success: true,
            message: "Cart quantity updated",
            cart: getCartResponse(customer)
        });
    } catch (error) {
        console.error("Update cart error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        req.user.cart = req.user.cart || [];

        const index = req.user.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({ success: false, message: "Product is not in cart" });
        }

        req.user.cart.splice(index, 1);
        await req.user.save();

        const customer = await populateCart(req.user._id);

        return res.json({
            success: true,
            message: "Product removed from cart",
            cart: getCartResponse(customer)
        });
    } catch (error) {
        console.error("Remove cart error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
};
