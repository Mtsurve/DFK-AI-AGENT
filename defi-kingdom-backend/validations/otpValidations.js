const Joi = require("joi");

const otpValidationSchema = {
    verifyOTPSchema: Joi.object().keys({
        otp: Joi.any().required()
    })
};
module.exports = otpValidationSchema;
