module.exports = class HttpError extends Error {
	status
	errors

	constructor(status, message, errors = []) {
		super(message)
		this.status = status
		this.errors = errors
	}

	static UnauthorizedError() {
		return new HttpError(401, 'Not authenticated user')
	}

	static BadRequest(message, errors = []) {
		return new HttpError(400, message, errors)
	}
}