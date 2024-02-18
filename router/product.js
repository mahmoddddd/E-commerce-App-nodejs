const { verifyTokenAndAuthorizaion, verifyTokenAndAdmin } = require("./verifyToken")
const Product = require('../models/Product')
const router = require("express").Router()

// Creat product
router.post('/add', verifyTokenAndAdmin, async (req, res) => {
    try {
        const newProduct = new Product(req.body)
        const savedProduct = await newProduct.save()
        res.status(200).json(savedProduct)

    } catch (error) {
        console.error("Error adding Product:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get product
router.get('/:id/get', verifyTokenAndAdmin, async (req, res) => {
    const productId = req.params.id
    try {
        const product = await Product.findById(productId)
        if (product) {
            res.status(200).json(product)
        } else {
            res.status(404).json('product not found')
        }

    } catch (error) {
        console.error("Error getting Product:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get all products
router.get('/getall', verifyTokenAndAdmin, async (req, res) => {
    const products = await Product.find()
    if (products) {
        res.status(200).json(products)
    } else {
        res.status(404).json('product not found')
    }

})

// edit product
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        // Validate request body: Check if the request body is empty
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Request body is empty' });
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' }); // id is uncorrect
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error updating Product:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// delete 
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {

        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' }); // id is uncorrect
        }

        res.status(200).json("Product deleted ");
    } catch (error) {
        console.error("Error deleting prodct:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// get all products with limet and sort with category
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    const { new: queryNew } = req.query; // Extracting the query parameter 'new'
    const qCategory = req.query.category
    try {
        let products;
        if (queryNew) {
            products = await Product.find().sort({ createdAt: -1 }).limit(2);
        }
        else if (qCategory) {
            products = await Product.find({
                categories: {
                    $in: [qCategory]
                }
            });
        } else {
            products = await Product.find()

        }

        if (!products || products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(products);
    } catch (error) {
        console.error("Error getting all products:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router