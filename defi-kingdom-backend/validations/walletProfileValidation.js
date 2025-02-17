const Joi = require("joi");

const walletProfileSchema = {
    getProfileByWalletAddressSchema: Joi.object().keys({
        address: Joi.string().required()
    }),

    getProfileByNameSchema: Joi.object().keys({
        name: Joi.string().required()
    }),

};
module.exports = walletProfileSchema;
