import { body } from 'express-validator';

export const createReportValidation = [
    body('type')
        .isIn(['accident', 'congestion', 'roadblock', 'waterlogging', 'other'])
        .withMessage('Invalid incident type'),

    body('congestionLevel')
        .isIn(['light', 'medium', 'heavy'])
        .withMessage('Congestion level must be light, medium, or heavy'),

    body('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),

    body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Valid latitude required'),

    body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Valid longitude required'),
];

export const updateReportValidation = [
    body('type')
        .optional()
        .isIn(['accident', 'congestion', 'roadblock', 'waterlogging', 'other'])
        .withMessage('Invalid incident type'),

    body('congestionLevel')
        .optional()
        .isIn(['light', 'medium', 'heavy'])
        .withMessage('Invalid congestion level'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
];
