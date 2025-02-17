class UserActivityLogger {
    constructor(db) {
        this.db = db;
    }

    async logActivity(req, userId, methodType,transaction_hash) {
        try {
            const ipAddress = this.getPublicIP(req);

            await this.db.user_activity.create({
                user_id: userId,
                action: methodType,
                ip_address: ipAddress,
                transaction_hash: transaction_hash
            });

            return true;
        } catch (error) {
            console.error('Error logging user activity:', error);
            return false;
        }
    }

    getPublicIP(req) {
        const forwardedFor = req.headers['x-forwarded-for'];
        if (forwardedFor) {
            const ipArray = forwardedFor.split(',');
            return ipArray[ipArray.length - 1].trim();
        }
        return req.connection.remoteAddress;
    }
}

module.exports = UserActivityLogger;