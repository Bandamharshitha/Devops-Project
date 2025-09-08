const { body, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
exports.validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

// Blood request validation
exports.validateBloodRequest = [
  body('patientInfo.name')
    .notEmpty()
    .withMessage('Patient name is required'),
  body('bloodInfo.bloodType')
    .isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])
    .withMessage('Valid blood type is required'),
  body('bloodInfo.unitsRequired')
    .isInt({ min: 1 })
    .withMessage('At least 1 unit is required'),
  body('contactInfo.primaryContact')
    .notEmpty()
    .withMessage('Primary contact is required')
];

// Donor information validation
exports.validateDonorInfo = [
  body('personalInfo.age')
    .isInt({ min: 18, max: 65 })
    .withMessage('Age must be between 18 and 65'),
  body('personalInfo.weight')
    .isFloat({ min: 45 })
    .withMessage('Minimum weight is 45kg'),
  body('healthInfo.bloodType')
    .isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])
    .withMessage('Valid blood type is required')
];