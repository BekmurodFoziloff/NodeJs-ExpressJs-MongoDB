const { body } = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('email')
        .isEmail()
        .withMessage('Emailni to\'g\'ri kiriting')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return Promise.reject('Bu emailga ega foydalanuvchi allaqachon mavjud')
                }
            } catch (err) {
                console.log(err)
            }
        })
        .normalizeEmail(),
    body('password', 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
        .isLength({ min: 6, max: 56 })
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Parollar bir xil bo\'lishi kerak')
            }
            return true
        })
        .trim(),
    body('name')
        .isLength({ min: 3 })
        .isAlpha()
        .withMessage('Ism kamida 3 ta belgidan iborat bo\'lishi kerak')
        .trim()
]

exports.courseValidators = [
    body('title')
        .isLength({ min: 3 })
        .withMessage('Nomi kamida 3 ta belgidan iborat bo\'lishi kerak')
        .trim(),
    body('price')
        .isNumeric()
        .withMessage('Narxini to\'g\'ri kiriting'),
    body('img', 'Rasm URLni to\'g\'ri kiriting')
        .isURL()
]