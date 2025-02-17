module.exports = (sequelize, Sequelize) => {
    const UserActivity = sequelize.define("user_activity", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        action: {
            type: Sequelize.STRING,
            allowNull: false
        },
        ip_address: {
            type: Sequelize.STRING
        },
        transaction_hash: {
            type: Sequelize.STRING
        }
    }, {
        freezeTableName: true,
        timestamps: true,  // to automatically add 'createdAt' and 'updatedAt'
    });

    return UserActivity;
};