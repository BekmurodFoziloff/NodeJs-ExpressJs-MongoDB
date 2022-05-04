const keys = require('../keys')
module.exports = function (email) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Hisob yaratildi',
        html: `
            <h1>Bizning online kurslarimizga xush kelibsiz</h1>
            <p>Siz ${email} e-pochta manzili bilan muvaffaqiyatli hisob yaratdingiz</p>
            <hr />
            <a href="${keys.BASE_URL}">Online kurslar</a>
        `
    }
}