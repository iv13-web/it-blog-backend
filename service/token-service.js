const jwt = require('jsonwebtoken')
const TokenModel = require('../models/token')

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

class TokenService {
	generateToken(payload) {
		const accessToken = jwt.sign(payload, ACCESS_SECRET, {expiresIn:'60m'})
		const refreshToken = jwt.sign(payload, REFRESH_SECRET, {expiresIn:'30d'})
		return {
			accessToken,
			refreshToken
		}
	}

	validateAccessToken(token) {
		try {
			return jwt.verify(token, process.env.JWT_ACCESS_SECRET)

		} catch (err) {
			return null
		}
	}

	validateRefreshToken(token) {
		try {
			return jwt.verify(token, process.env.JWT_REFRESH_SECRET)

		} catch (err) {
			return null
		}
	}

	async saveToken(userId, refreshToken) {
		const tokenData = await TokenModel.findOne({user: userId})
		if (tokenData) {
			tokenData.refreshToken = refreshToken
			return tokenData.save()
		}
		return await TokenModel.create({user: userId, refreshToken}) // creating token
	}

	async removeToken(refreshToken) {
		const tokenData = await TokenModel.deleteOne({refreshToken})
		return tokenData
	}

	async findToken(refreshToken) {
		const tokenData = await TokenModel.findOne({refreshToken})
		return tokenData
	}
}

module.exports = new TokenService()
