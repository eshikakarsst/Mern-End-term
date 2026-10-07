const crypto = require("crypto");
const mongoose = require("mongoose");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

const isMockPaymentMode = () => {
    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    return !keyId || !keySecret ||
        keyId.includes("your_key") ||
        keySecret.includes("your_key") ||
        keyId.includes("your_key_id") ||
        keySecret.includes("your_key_secret");
};

const cleanAddress = (shippingAddress = {}) => ({
    fullName: String(shippingAddress.fullName || "").trim(),
    phone: String(shippingAddress.phone || "").trim(),
    addressLine1: String(shippingAddress.addressLine1 || "").trim(),
    city: String(shippingAddress.city || "").trim(),
    state: String(shippingAddress.state || "").trim(),
    pincode: String(shippingAddress.pincode || "").trim()
});

const validateShippingAddress = (address) => {
    const required = [
        ["fullName", "Full name is required"],
        ["phone", "Phone number is required"],
        ["addressLine1", "Address is required"],
        ["city", "City is required"],
        ["state", "State is required"],
        ["pincode", "Pincode is required"]
    ];

    for (const [key, message] of required) {
        if (!address[key]) return message;
    }

    if (!/^[0-9]{10}$/.test(address.phone)) {
        return "Phone number must contain 10 digits.";
    }

    if (!/^[0-9]{6}$/.test(address.pincode)) {
        return "Pincode must contain 6 digits.";
    }

    return null;
};

const getValidatedCart = async (customer) => {
    const cart = customer.cart || [];

    if (cart.length === 0) {
        const error = new Error("Your cart is empty.");
        error.statusCode = 400;
        throw error;
    }

    const ids = cart.map((item) => item.product);
    const products = await Product.find({ _id: { $in: ids } });
    const byId = new Map(products.map((product) => [product._id.toString(), product]));

    const items = [];
    let totalAmount = 0;

    for (const cartItem of cart) {
        const productId = cartItem.product.toString();
        const product = byId.get(productId);

        if (!product) {
            const error = new Error("A product in your cart is no longer available.");
            error.statusCode = 400;
            throw error;
        }

        const quantity = Number(cartItem.quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
            const error = new Error(`Invalid quantity for ${product.name}.`);
            error.statusCode = 400;
            throw error;
        }

        if (product.stock < quantity) {
            const error = new Error(`Insufficient stock for ${product.name}.`);
            error.statusCode = 400;
            throw error;
        }

        const price = Number(product.price);
        totalAmount += price * quantity;

        items.push({
            product: product._id,
            name: product.name,
            price,
            quantity,
            image: product.image || ""
        });
    }

    return { items, totalAmount };
};

const createPaymentOrder = async (req, res) => {
    try {
        const shippingAddress = cleanAddress(req.body.shippingAddress);
        const validationError = validateShippingAddress(shippingAddress);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        if (isMockPaymentMode()) {
            const customer = await Customer.findById(req.user._id);

            if (!customer) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            const { items, totalAmount } = await getValidatedCart(customer);

            const shopKartOrder = await Order.create({
                user: customer._id,
                items,
                shippingAddress,
                totalAmount,
                paymentStatus: "PENDING",
                status: "PENDING_PAYMENT"
            });

            const mockOrderId = `mock_order_${shopKartOrder._id.toString()}`;
            shopKartOrder.razorpayOrderId = mockOrderId;
            await shopKartOrder.save();

            return res.status(201).json({
                success: true,
                mockPayment: true,
                shopKartOrderId: shopKartOrder._id,
                razorpayOrderId: mockOrderId,
                amount: Math.round(totalAmount * 100),
                currency: "INR",
                key: "mock_key"
            });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Razorpay test keys are not configured on the backend."
            });
        }

        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const { items, totalAmount } = await getValidatedCart(customer);

        const shopKartOrder = await Order.create({
            user: customer._id,
            items,
            shippingAddress,
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        try {
            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: "INR",
                receipt: shopKartOrder._id.toString()
            });

            shopKartOrder.razorpayOrderId = razorpayOrder.id;
            await shopKartOrder.save();

            return res.status(201).json({
                success: true,
                shopKartOrderId: shopKartOrder._id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID
            });
        } catch (razorpayError) {
            await Order.findByIdAndDelete(shopKartOrder._id);
            console.error("Razorpay order creation error:", razorpayError);
            return res.status(502).json({
                success: false,
                message: "Unable to create the payment order. Your cart was not changed."
            });
        }
    } catch (error) {
        console.error("Create payment order error:", error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to create order."
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(shopKartOrderId) ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Incomplete payment verification data."
            });
        }

        const order = await Order.findOne({
            _id: shopKartOrderId,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (order.paymentStatus === "PAID") {
            return res.json({
                success: true,
                order
            });
        }

        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Payment order does not match."
            });
        }

        const mockPaymentMode = isMockPaymentMode();

        if (mockPaymentMode) {
            if (razorpay_order_id !== order.razorpayOrderId) {
                return res.status(400).json({
                    success: false,
                    message: "Payment order does not match."
                });
            }
        } else {
            const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body)
                .digest("hex");

            const signaturesMatch =
                expectedSignature.length === razorpay_signature.length &&
                crypto.timingSafeEqual(
                    Buffer.from(expectedSignature),
                    Buffer.from(razorpay_signature)
                );

            if (!signaturesMatch) {
                order.paymentStatus = "FAILED";
                await order.save();

                return res.status(400).json({
                    success: false,
                    message: "Invalid payment signature."
                });
            }
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        customer.cart = [];
        await customer.save();

        return res.json({
            success: true,
            message: "Payment verified and order placed.",
            order
        });
    } catch (error) {
        console.error("Verify payment error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to verify payment."
        });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Get orders error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load orders."
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        const order = await Order.findById(req.params.id).lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this order."
            });
        }

        return res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Get order error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load order."
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getOrders,
    getOrderById
};
