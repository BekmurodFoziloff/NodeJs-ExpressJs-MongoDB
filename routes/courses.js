const { Router } = require('express')
const { validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const Course = require('../models/course')
const { courseValidators } = require('../utils/validators')
const router = Router()

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().lean()
            .populate('userId', 'email name') // populate() ichida ko'rsatilgan obyektni elementlarini ko'rsatadi
            .select('price title img') // select() ichida ko'rsatilgan elementlarni ko'rsatadi faqat

        res.render('courses', {
            title: 'Kurslar',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses
        })
    } catch (err) {
        console.log(err)
    }

})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }
    try {
        const course = await Course.findById(req.params.id).lean()
        if (!isOwner(course, req)) {
            res.redirect('/courses')
        }
        res.render('course-edit', {
            title: `${course.title}ni tahrirlash`,
            course
        })
    } catch (err) {
        console.log(err)
    }

})

router.post('/edit', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req)
    const { id } = req.body
    if (!errors.isEmpty()) {
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }
    try {
        const { id } = req.body
        delete req.body.id
        const course = await Course.findById(id).lean()
        if (!isOwner(course, req)) {
            res.redirect('/courses')
        }
        // Object.assign(course, req.body) // Course.findByIdAndUpdate(id, req.body) bilan bir xil vazifa bajaradi
        // await course.save()
        await Course.findByIdAndUpdate(id, req.body).lean()
        res.redirect('/courses')
    } catch (err) {
        console.log(err)
    }

})

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({ _id: req.body.id, userId: req.user._id }).lean()
        res.redirect('/courses')
    } catch (err) {
        console.log(err)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).lean()
        res.render('course', {
            layout: 'empty',
            title: `${course.title} kurs`,
            course
        })
    } catch (err) {
        console.log(err)
    }

})

module.exports = router