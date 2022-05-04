const keys = require('../keys')
module.exports = function (email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Qayta tiklashga kirish',
        html: `
            <h1>Parolingizni unutdingizmi?</h1>
            <p>Agar yo'q bo'lsa, iltimos, ushbu xatni e'tiborsiz qoldiring.</p>
            <p>Aks holda quyidagi havolani bosing:</p>
            <p><a href="${keys.BASE_URL}/auth/password/${token}">Kirishni tiklash</a></p>
            <hr>
            <a href="${keys.BASE_URL}">Online kurslar</a>
        `
    }
}