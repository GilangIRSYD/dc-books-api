class ErrorResponse extends Error {
    constructor(message, code = 500, status = 'error') {
        super(message)
        this.name = "ResponseError"
        this.code = code
        this.status = status
    }

    static CODE = {
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    }

    static bind = (err, handler) => {
        if (err instanceof ErrorResponse) {
            return handler.response({
                status: err.status,
                message: err.message
            }).code(err.code)
        }

        // general Error
        return handler.response({
            status: 'error',
            message: 'An internal server error occurred'
        }).code(this.CODE.INTERNAL_SERVER_ERROR)
    }
}

module.exports = ErrorResponse