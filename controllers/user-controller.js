const userService = require('../service/user-service')
const {daysToMs} = require('../utils/utils')
const {validationResult} = require('express-validator')
const HttpError = require('../errors/http-error')

class UserController {
	async signup(req, res, next) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return next(HttpError.BadRequest('Validation failed. Please check email and password', errors))
			}
			const {email, password, username} = req.body
			const userData = await userService.createAccount(email, password, username)
			res.cookie('refreshToken', userData.refreshToken, {maxAge: daysToMs(30), httpOnly: true})
			return res.json(userData)
		} catch (err) {
			next(err)
		}
	}

	async login(req, res, next) {
		try {
			const {email, password} = req.body
			const userData = await userService.login(email, password)
			res.cookie('refreshToken', userData.refreshToken, {maxAge: daysToMs(30), httpOnly: true})
			return res.json(userData)

		} catch (err) {
			next(err)

		}
	}

	async logout(req, res, next) {
		try {
			const {refreshToken} = req.cookies
			const token = await userService.logout(refreshToken)
			res.clearCookie('refreshToken')
			return res.end()
		} catch (err) {
			next(err)
		}
	}

	async activateAccount(req, res, next) {
		try {
			const activationLink = req.params.link
			await userService.activateAccount(activationLink)
			return res.redirect(process.env.CLIENT_URL)
		} catch (err) {
			next(err)
		}
	}

	async refreshToken(req, res, next) {
		try {
			const {refreshToken} = req.cookies
			const userData = await userService.refresh(refreshToken)
			res.cookie('refreshToken', userData.refreshToken, {maxAge: daysToMs(30), httpOnly: true})
			return res.json(userData)
		} catch (err) {
			next(err)

		}
	}

	async getUsers(req, res, next) {
		try {
			const users = await userService.getAllUsers()
			return res.json(users)
		} catch (err) {
			next(err)
		}
	}

	async checkUsername(req, res, next) {
		try {
			const {username} = req.body
			const exist = await userService.checkUsername(username)
			return res.json({available: !exist})
		} catch (err) {
			next(err)
		}
	}
}

module.exports = new UserController()