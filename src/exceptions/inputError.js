const ClientError = require("./clientError");

class InputError extends ClientError {
  constructor(message) {
    super(message, 400);
    this.name = 'InputError';
  }
}

module.exports = InputError;
