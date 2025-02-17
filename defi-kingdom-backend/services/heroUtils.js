const ethers = require('ethers');
const axios = require('axios');
const TOKEN_CONSTANTS = require("../constants/tokenConstants");
const QUEST_CORE_CONTRACT_ADDRESS = "0x530fff22987E137e7C8D2aDcC4c15eb45b4FA752";
const QUEST_ABI = [
    "function getHeroQuest(uint256 _heroId) view returns (address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint8)"
];

const QuestStatus = {
    NONE: 0,
    STARTED: 1,
    COMPLETED: 2,
    CANCELED: 3,
    EXPEDITION: 4
};

const fetchHeroSkeleton = async (heroId) => {
    const url = `https://heroes.defikingdoms.com/token/${heroId}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch skeleton for heroId: ${heroId}`, error);
        return null;
    }
};

const formatHeroData = async (hero, skeleton) => {
    return {
        id: skeleton?.heroData?.id || hero.id,
        image: skeleton?.image || null,
        name: skeleton?.name || `${hero.firstName} ${hero.lastName}`,
        male: hero.gender,
        subclass: hero.subClassStr,
        rarity: hero.rarity,
        level: hero.level,
        generation: hero.generation,
        element: hero.element,
        background: hero.background,
        stamina: hero.stamina,
        staminaFullAt : hero.staminaFullAt,
        summons: hero.summons,
        xp: hero.xp,
        hp: hero.hp,
        mp: hero.mp,
        class: hero.mainClassStr,
        strength: hero.strength,
        dexterity: hero.dexterity,
        agility: hero.agility,
        vitality: hero.vitality,
        endurance: hero.endurance,
        intelligence: hero.intelligence,
        wisdom: hero.wisdom,
        luck: hero.luck,
        mining: hero.mining / 10,
        gardening: hero.gardening / 10,
        foraging: hero.foraging / 10,
        fishing: hero.fishing / 10,
        strengthGrowthP: hero.strengthGrowthP / 100,
        dexterityGrowthP: hero.dexterityGrowthP / 100,
        agilityGrowthP: hero.agilityGrowthP / 100,
        vitalityGrowthP: hero.vitalityGrowthP / 100,
        enduranceGrowthP: hero.enduranceGrowthP / 100,
        intelligenceGrowthP: hero.intelligenceGrowthP / 100,
        wisdomGrowthP: hero.wisdomGrowthP / 100,
        luckGrowthP: hero.luckGrowthP / 100,
        strengthGrowthS: hero.strengthGrowthS / 100,
        dexterityGrowthS: hero.dexterityGrowthS / 100,
        agilityGrowthS: hero.agilityGrowthS / 100,
        vitalityGrowthS: hero.vitalityGrowthS / 100,
        enduranceGrowthS: hero.enduranceGrowthS / 100,
        intelligenceGrowthS: hero.intelligenceGrowthS / 100,
        wisdomGrowthS: hero.wisdomGrowthS / 100,
        luckGrowthS: hero.luckGrowthS / 100,
        currentQuest : hero.currentQuest,
        on_sale: !!hero.saleAuction,
    };
};

// Common function to fetch and format hero data
const fetchAndFormatHeroData = async (hero) => {
    try {
        const skeleton = await fetchHeroSkeleton(hero.id);
        const formattedHero = await formatHeroData(hero, skeleton);

        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
        const contract = new ethers.Contract(QUEST_CORE_CONTRACT_ADDRESS, QUEST_ABI, provider);

        const heroes_quest = await contract.getHeroQuest(hero.id);
        const questStatus = Number(heroes_quest[9]);
        formattedHero.quest_status = Object.keys(QuestStatus).find(key => QuestStatus[key] === questStatus) || "UNKNOWN";

        return formattedHero;
    } catch (error) {
        console.error("Error in fetchAndFormatHeroData:", error);
        return null;
    }
};

module.exports = {
    fetchHeroSkeleton,
    formatHeroData,
    fetchAndFormatHeroData
};