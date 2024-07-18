const ClientError = require("./ClientError");

class UnprocessableContentError extends ClientError {
    constructor(message) {
        super(message, 422);
        this.name = 'UnprocessableContentError';
    }
}

module.exports = UnprocessableContentError;