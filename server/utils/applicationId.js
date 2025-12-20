'use strict';

/**
 * Generate unique application ID in format: APP-XXXXXX
 * Example: APP-A7B9C2
 */
function generateApplicationId() {
  const prefix = 'APP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `${prefix}-${timestamp. slice(-3)}${random. slice(0, 3)}`;
}

/**
 * Validate application ID format
 */
function isValidApplicationId(id) {
  const pattern = /^APP-[A-Z0-9]{6}$/;
  return pattern. test(id);
}

module.exports = {
  generateApplicationId,
  isValidApplicationId
};