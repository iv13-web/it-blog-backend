const HttpError = require('../errors/http-error')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
	try {
		const authorizationHeader = req.headers.authorization
		if (!authorizationHeader) {
			return next(HttpError.UnauthorizedError())
		}
		const accessToken = authorizationHeader.split(' ')[1]
		if (!accessToken) {
			return next(HttpError.UnauthorizedError())
		}
		const userData = tokenService.validateAccessToken(accessToken)
		if (!userData) {
			return next(HttpError.UnauthorizedError())
		}
		req.user = userData
		next()

	} catch (err) {
		return next(HttpError.UnauthorizedError())
	}
}
