const { verifyTokenAndAuthorizaion, verifyTokenAndAdmin } = require("./verifyToken")
const Order = require('../models/Order')
const router = require("express").Router()

// Creat Order
router.post('/add', verifyTokenAndAuthorizaion, async (req, res) => {
    try {
        const newOrder = new Order(req.body)
        const savedOrder = await newOrder.save()
        res.status(200).json(savedOrder)

    } catch (error) {
        console.error("Error adding Order:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// edit product
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Request body is empty' });
        }
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' }); // id is uncorrect
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error("Error updating Order:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// delete Order
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' }); // id is uncorrect
        }
        res.status(200).json("Order deleted ");
    } catch (error) {
        console.error("Error delete user:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user Order
router.get('/:userId/get', verifyTokenAndAuthorizaion, async (req, res) => {
    //  const OrderId = req.params.userId
    try {
        const ordersForUser = await Order.findOne({ userId: req.params.userId }) // no think
        if (ordersForUser) {
            res.status(200).json(ordersForUser)
        } else {
            res.status(404).json('Order not found')
        }

    } catch (error) {
        console.error("Error getting Order:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





// get all Cart 
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json(error)
    }
});

// get orders with totlal sale
router.get('/income', async (req, res) => {
    try {
        const currentDate = new Date();
        const startDateOfThisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startDateOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const startDateOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);
        const income = await Order.aggregate([
            {
                $match: { createdAt: { $gte: startDateOfPreviousMonth } }
            },
            {
                $project: {
                    // Extract the month from the order's createdAt date
                    month: { $month: "$createdAt" },
                    // Get the amount of each order as sales
                    sales: "$amount"
                }
            },
            {
                // Group the orders by month and calculate the total sales for each month
                $group: {
                    _id: '$month',
                    total: { $sum: "$sales" }
                }
            }
        ]);
        res.status(200).json(income);
    } catch (error) {
        console.error("Error fetching income:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router