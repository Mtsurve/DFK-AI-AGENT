module.exports = (sequelize, Sequelize) => {
    const HeroQuest = sequelize.define("hero_quests", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        hero_id: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        quest_start_time: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        quest_end_time: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        quest_status: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        hero_level: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        hero_experience: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        wallet_address: {
            type: Sequelize.STRING,
            allowNull: true
        },
        start_time: {
            type: Sequelize.BIGINT,
            allowNull: true
        },
        end_time: {
            type: Sequelize.BIGINT,
            allowNull: true
        },
        quest_instance_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        hero_address: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
        freezeTableName: true,
        timestamps: true,  // to automatically add 'createdAt' and 'updatedAt'
        underscored: true, // ensures snake_case column names in the table
    });

    return HeroQuest;
};
