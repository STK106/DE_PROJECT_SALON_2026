require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'default-dev-secret-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
