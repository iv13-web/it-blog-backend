const Router = require('express').Router
const userController = require('../controllers/user-controller')
const router = new Router()
const {body} = require('express-validator')
const authMiddleware = require('../middlewares/auth-middleware')

router.post('/signup',
	body('email').isEmail(),
	body('password').isLength({min: 6, max: 16}),
	userController.signup
)
router.post('/login', userController.login)
router.post('/logout', userController.logout) // removing refreshToken
router.post('/check-username', userController.checkUsername) // removing refreshToken
router.get('/activate/:link', userController.activateAccount)
router.get('/refresh', userController.refreshToken) // refreshing access token

router.get('/users', authMiddleware, userController.getUsers) // ADMIN - сделать roleMiddleware для задач админки
// router.post('/createarticle', authMiddleware, userController.getUsers) // тут auth middleware

module.exports = router
