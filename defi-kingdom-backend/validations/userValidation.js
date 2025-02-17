const Joi = require('joi') 

const passwordComplexityOptions = {
    min: 8,          // Minimum length
    max: 30,         // Maximum length
    lowerCase: 1,    // Require at least 1 lowercase letter
    upperCase: 1,    // Require at least 1 uppercase letter
    numeric: 1,      // Require at least 1 digit
    symbol: 1,       // Require at least 1 special character
    requirementCount: 4, // Total requirements to meet
};

const passwordComplexity = require('joi-password-complexity')(passwordComplexityOptions);

const userSchema = {
    registerUser: Joi.object().keys({ 
        name: Joi.string(),
        email: Joi.string().required(),
        password: Joi.string().required().custom((value, helpers) => {
            const validationResult = passwordComplexity.validate(value);
            if (validationResult.error) {
                return helpers.error('password complexity requirements not met');
            }
            return value;
        }, 'custom password complexity'),
    }),

    signIn: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required()
    }),

    forgotPassword: Joi.object().keys({
        email: Joi.string().required(),
    }),

    setUserPassword: Joi.object().keys({
        token: Joi.string().required(),
        password: Joi.string().required().custom((value, helpers) => {
            const validationResult = passwordComplexity.validate(value);
            if (validationResult.error) {
                return helpers.error('password complexity requirements not met');
            }
            return value;
        }, 'custom password complexity'),
    }),

    updateTelegramUsername : Joi.object().keys({
        id: Joi.number().required(),
        telegram_username : Joi.string().required()
    })

};

module.exports = userSchema;