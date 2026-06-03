import { body, validationResult } from 'express-validator'

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    })
  }
  next()
}

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidationErrors
]

export const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
]

export const validateLogFood = [
  body('foodName')
    .trim()
    .notEmpty().withMessage('Food name is required'),
  body('quantity')
    .custom(val => {
      const num = parseFloat(val)
      if (isNaN(num) || num <= 0) {
        throw new Error('Quantity must be a positive number')
      }
      return true
    }),
  body('unit')
    .isIn(['gm', 'ounce', 'bowl', 'katori', 'piece'])
    .withMessage('Unit must be one of: gm, ounce, bowl, katori, piece'),
  handleValidationErrors
]

export const validateLogFoodText = [
  body('text')
    .trim()
    .notEmpty().withMessage('Text is required')
    .isLength({ max: 500 }).withMessage('Text cannot exceed 500 characters'),
  handleValidationErrors
]
