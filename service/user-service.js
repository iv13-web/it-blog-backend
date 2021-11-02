const UserModel = require('../models/user')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('../service/mail-service')
const tokenService = require('../service/token-service')
const UserDto = require('../dtos/user-dto')
const HttpError = require('../errors/http-error')

class UserService {

	async createAccount(email, password) {
		const candidate = await UserModel.findOne({email})
		if (candidate) {
			throw HttpError.BadRequest(`User with provided email: ${email} already exists`)
		}
		const hashPassword = await bcrypt.hash(password, 5)
		const activationLink = uuid.v4()
		const user = await UserModel.create({
			email,
			password: hashPassword,
			activationLink: `${process.env.API_URL}/activate/${activationLink}`
		})
		await mailService.sendActivationMail(email, activationLink)
		const userDto = new UserDto(user) // filtering through dto not to send password into generateToken -> jwt.sign hash fn
		const tokens = tokenService.generateToken({...userDto}) // sending plain object, not instance of UserDto
		await tokenService.saveToken(userDto.id, tokens.refreshToken)
		return {...tokens, user: userDto}
	}

	async activateAccount(activationLink) {
		const user = await UserModel.findOne({activationLink})
		if (!user) {
			throw HttpError.BadRequest('Invalid activation link')
		}
		user.isActivated = true
		await user.save()
	}

	async login(email, password) {
		const user = await UserModel.findOne({email})
		if (!user) {
			throw HttpError.BadRequest('Provided email does not belong to an existing user')
		}
		const passwordsEqual = await bcrypt.compare(password, user.password)
		if (!passwordsEqual) {
			throw HttpError.BadRequest('Invalid password provided')
		}
		const userDto = new UserDto(user)
		const tokens = tokenService.generateToken({...userDto})
		await tokenService.saveToken(userDto.id, tokens.refreshToken)
		return {...tokens, user: userDto}
	}

	async logout(refreshToken) {
		return await tokenService.removeToken(refreshToken)
	}

	async refresh(refreshToken) {
		if (!refreshToken) {
			throw HttpError.UnauthorizedError()
		}
		const userData = tokenService.validateRefreshToken(refreshToken)
		const tokenFromDB = await tokenService.findToken(refreshToken)
		if (!userData || !tokenFromDB) {
			throw HttpError.UnauthorizedError()
		}
		const user = await UserModel.findById(userData.id)
		const userDto = new UserDto(user)
		const tokens = tokenService.generateToken({...userDto})
		await tokenService.saveToken(userDto.id, tokens.refreshToken)
		return {...tokens, user: userDto}
	}

	async getAllUsers() {
		const users = await UserModel.find()
		return users
	}
}

module.exports = new UserService()
