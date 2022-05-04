const { Router } = require('express')
const auth = require('../middleware/auth')
const Course = require('../models/course')
const router = Router()

function mapCartItems(cart) {
    return cart.items.map(c => ({
        ...c.courseId._doc, // _doc equivalent to toJSON()
        id: c.courseId.id,
        count: c.count
    }))
}

function computePrice(courses) {
    return courses.reduce((total, course) => {
        return total += course.price * course.count
    }, 0)
}

router.post('/add', async (req, res) => {
    const course = await Course.findById(req.body.id).lean()
    await req.user.addToCart(course)
    res.redirect('/card')
})

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id)
    const user = await req.user
        .populate('cart.items.courseId')
    // .execPopulate()
    const courses = mapCartItems(user.cart)
    const cart = {
        courses: courses,
        price: computePrice(courses)
    }
    res.status(200).json(cart)
})

router.get('/', auth, async (req, res) => {
    const user = await req.user
        .populate('cart.items.courseId')
    // .execPopulate()

    const courses = mapCartItems(user.cart)
    res.render('card', {
        title: 'Savat',
        isCard: true,
        courses: courses,
        price: computePrice(courses)
    })
})

module.exports = router