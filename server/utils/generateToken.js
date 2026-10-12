import jwt from 'jsonwebtoken';

/**
 * Generates a signed JSON Web Token (JWT)
 * @param {string} id - User's MongoDB _id
 * @returns {string} Signed JWT token valid for 30 days
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};
