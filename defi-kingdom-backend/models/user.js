module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        telegram_username:{
            type: Sequelize.STRING
        },
        telegram_chatid:{
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        wallet_address: {
            type: Sequelize.STRING
        },
        wallet_private_key: {
            type: Sequelize.TEXT
        }
    }, {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
    })
    return User;
}