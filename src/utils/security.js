const crypto = require("crypto");

function validatePassword(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push("La contraseña debe tener mínimo 8 caracteres.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Debe contener al menos una mayúscula.");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Debe contener al menos un número.");
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=;'`~]/.test(password)) {
    errors.push("Debe contener al menos un carácter especial.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function generateCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = { validatePassword, generateCode, hashValue };
