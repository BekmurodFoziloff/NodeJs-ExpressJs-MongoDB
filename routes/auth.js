const { Router } = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const smtpTransport = require('nodemailer-smtp-transport')
const { validationResult } = require('express-validator')
const User = require('../models/user')
const keys = require('../keys')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const { registerValidators } = require('../utils/validators')
const router = Router()

// const transporter = nodemailer.createTransport(sendgrid({
//     auth: { api_key: keys.SENDGRID_API_KEY }
// }))

const transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.gmail.com',
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
        user: 'bekmurodfozilov17@gmail.com',
        pass: 'b1e9k9m9u0r7o0d5'
    }
}))

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Ruxsat',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const candidate = await User.findOne({ email })
        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password)
            if (areSame) {
                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save(err => {
                    if (err) {
                        throw err
                    }
                    res.redirect('/')
                })
            } else {
                req.flash('loginError', 'Parol noto\'g\'ri')
                res.redirect('/auth/login#login')
            }
        } else {
            req.flash('loginError', 'Bu foydalanuvchi mavjud emas')
            res.redirect('/auth/login#login')
        }
    } catch (err) {
        console.log(err)
    }
})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, password, name } = req.body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
            email, password: hashPassword, name, cart: { items: [] }
        })
        await user.save()
        await transporter.sendMail(regEmail(email))
        res.redirect('/auth/login#login ')
    } catch (err) {
        console.log(err)
    }
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Parolni unutdingizmi?',
        error: req.flash('error')
    })
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() }
        })
        if (!user) {
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title: 'Tiklashga ruxsat',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })
        }

    } catch (err) {
        console.log(err)
    }

})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Nimadir xato ketdi, keyinroq qayta urinib ko\'ring')
                res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')
            const candidate = await User.findOne({ email: req.body.email })
            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'Bunday email yo\'q')
                res.redirect('/auth/reset')
            }
        })
    } catch (err) {
        console.log(err)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() }
        })
        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('loginError', 'Token muddati tugagan')
            res.redirect('/auth/login')
        }

    } catch (err) {
        console.log(err)
    }
})

module.exports = router