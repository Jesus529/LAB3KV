const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      store: user.store
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "2h"
    }
  );
}

function generateMfaToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      purpose: "MFA"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "5m"
    }
  );
}

module.exports = { generateAccessToken, generateMfaToken };
