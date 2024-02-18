
const express = require('express')
const app = express()
const port = 3000;
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');

const userRouter = require('./router/user')
const authRouter = require('./router/auth')
const productRoute = require('./router/product')
const orderRoute = require('./router/order')
const cartRoute = require('./router/cart')

require('dotenv').config()

app.use(express.json())


app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/product', productRoute)
app.use('/api/order', orderRoute)
app.use('/api/cart', cartRoute)

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('conected to db'))
    .catch(err => console.log(err))

app.listen(port, console.log(`servr run at ${port}`))

