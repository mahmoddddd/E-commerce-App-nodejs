const { verifyTokenAndAuthorizaion, verifyTokenAndAdmin } = require("./verifyToken")
const Cart = require('../models/Cart')
const router = require("express").Router()

// Creat Cart
router.post('/add', verifyTokenAndAuthorizaion, async (req, res) => {
    try {
        const newCart = new Cart(req.body)
        const savedCart = await newCart.save()
        res.status(200).json(savedCart)

    } catch (error) {
        console.error("Error adding Cart:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// edit product
router.put("/:id", verifyTokenAndAuthorizaion, async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Request body is empty' });
        }
        const updatedCart = await Cart.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true });

        if (!updatedCart) {
            return res.status(404).json({ error: 'Cart not found' }); // id is uncorrect
        }

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Error updating Cart:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// delete 
router.delete("/:id", verifyTokenAndAuthorizaion, async (req, res) => {
    try {
        const cart = await Cart.findByIdAndDelete(req.params.id);

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' }); // id is uncorrect
        }
        res.status(200).json("Cart deleted ");
    } catch (error) {
        console.error("Error delete cart:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user Cart
router.get('/:userId/get', verifyTokenAndAuthorizaion, async (req, res) => {
    //  const CartId = req.params.userId
    try {
        const cart = await Cart.findOne({ userId: req.params.userId })
        if (cart) {
            res.status(200).json(cart)
        } else {
            res.status(404).json('Cart not found')
        }

    } catch (error) {
        console.error("Error getting Cart:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





// get all Cart 
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const carts = await Cart.find()
        res.status(200).json(carts)
    } catch (error) {
        res.status(500).json(error)
    }
});




module.exports = router