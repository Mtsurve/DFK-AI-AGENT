const db = require("../config/db.config");
const Response = require("../classes/Response");
const USER_CONSTANTS = require("../constants/userConstants");

const fetchUserByEmail = async (email) => {
    try {
        const user = await db.users.findOne({ where: { email: email } });
        if (!user) {
            throw new Error(USER_CONSTANTS.USER_NOT_FOUND);  
        }
        return user;
    } catch (error) {
        throw error;  
    }
};

const fetchUserByWalletAddress = async (wallet_address) => {
    try {
        const user = await db.users.findOne({ where: { wallet_address: wallet_address } });
        if (!user) {
            throw new Error(USER_CONSTANTS.USER_NOT_FOUND); 
        }
        return user;
    } catch (error) {
        throw error;  
    }
};

module.exports = {
    fetchUserByEmail,
    fetchUserByWalletAddress
};