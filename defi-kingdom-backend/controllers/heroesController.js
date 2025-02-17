const Response = require("../classes/Response");
const HEROES_CONSTANTS_STATUS = require("../constants/heroesConstants");
const HeroesService = require("../services/HeroesService");
const TOKEN_CONSTANTS = require("../constants/tokenConstants");
const db = require("../config/db.config");
const axios = require('axios');
const { ethers } = require("ethers");
const QUEST_CORE_CONTRACT_ADDRESS = "0x530fff22987E137e7C8D2aDcC4c15eb45b4FA752"; // Mainnet QuestCoreV3 contract address
const { fetchAndFormatHeroData } = require('../services/heroUtils');
const { fetchUserByEmail } = require('../services/getUserData');
const { fetchUserByWalletAddress } = require('../services/getUserData');

const UserActivityLogger = require('../classes/userActivity');
const userActivityLogger = new UserActivityLogger(db);

const QUEST_ABI = [
    "function getHeroQuest(uint256 heroId) view returns (tuple(uint256 id, uint256 questInstanceId, uint8 level, uint256[] heroes, address player, uint256 startBlock, uint256 startAtTime, uint256 completeAtTime, uint8 attempts, uint8 status, uint8 questType))",
    "function startQuest(uint256[] _heroIds, uint256 _questInstanceId, uint8 _attempts, uint8 _level, uint8 _type)",
    "function completeQuest(uint256 _heroId)",
];

const getOwnerHeroesByAddress = async (req, res) => {
    try {
        const ownerAddress = req.query.address;
        if (!ownerAddress) {
            return res.status(400).send(Response.sendResponse(false, [], HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 400));
        }

        const data = await HeroesService.getHeroesByOwner(ownerAddress);
        if (!data.heroes || data.heroes.length === 0) {
            return res.status(404).send(Response.sendResponse(false, [], HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 404));
        }

        const heroPromises = data.heroes.map(hero => fetchAndFormatHeroData(hero));
        const heroesWithFilteredData = (await Promise.all(heroPromises)).filter(Boolean);

        return res.status(200).send(Response.sendResponse(true, heroesWithFilteredData, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));
    } catch (error) {
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
};

async function getHeroesNetworkById(hero_id) {
    try {
        const id = hero_id;
        if (!id) {
            return res.status(400).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 400));
        }

        const data = await HeroesService.getHeroesById(id);
        if (!data.heroes || data.heroes.length === 0) {
            return res.status(404).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 404));
        }

        const hero = data.heroes[0];

        const formattedHero = await fetchAndFormatHeroData(hero);
        return formattedHero
    } catch (error) {
        // console.log("Error fetching hero data:", error);
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
};


const getSelectedHeroId = async () => {
    const heroApiUrl = "https://api.defikingdoms.com/heroes";

    const filterParams = {
        flatten: true,
        limit: 4,
        params: [
            { field: "saleprice", operator: ">=", value: "1000000000000000000" },
            { field: "network", operator: "=", value: "dfk" },
            { field: "hasvalidcraftinggenes", operator: "=", value: true },
            { field: "hastaintedgenes", operator: "=", value: false }
        ],
        offset: 0,
        order: {
            orderBy: "saleprice",
            orderDir: "asc"
        }
    };

    try {
        const heroResponse = await axios.post(heroApiUrl, { ...filterParams }, {
            headers: { "Content-Type": "application/json" },
        });
        const heroIds = heroResponse.data.map(hero => hero[0]);
        const selectedHeroId = heroIds[1];

        return selectedHeroId;
    } catch (error) {
        console.error("Error fetching hero data:", error);
        return null;
    }
};

const heroesStamina = async (req, res) => {
    try {
        const user = await fetchUserByEmail(req.user.email);

        const CONTRACT_ADDRESS = "0x530fff22987E137e7C8D2aDcC4c15eb45b4FA752";

        const ABI = [
            "function getCurrentStamina(uint256 _heroId) view returns (uint256)",
        ];

        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);

        let privateKey = user.wallet_private_key;

        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        const hero_id = req.query.id;
        const stamina = await contract.getCurrentStamina(hero_id);

        const staminaValue = Number(stamina);

        return res.status(200).send(Response.sendResponse(true, staminaValue, HEROES_CONSTANTS_STATUS.HEROES_FETCHED, 200));
    }
    catch (error) {
        console.log(error);
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
}

async function getHeroeStamina(heroId) {
    const CONTRACT_ADDRESS = "0x530fff22987E137e7C8D2aDcC4c15eb45b4FA752";
    const ABI = [
        "function getCurrentStamina(uint256 _heroId) view returns (uint256)",
    ];

    const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const stamina = await contract.getCurrentStamina(heroId);
    return stamina;
}

const buyHeroes = async (req, res) => {
    try {
        const hero_id = await getSelectedHeroId();

        const user = await fetchUserByEmail(req.user.email);

        // Contract details
        const CONTRACT_ADDRESS = "0xc390fAA4C7f66E4D62E59C231D5beD32Ff77BEf0";
        const ABI = [
            "function bid(uint256 amount, uint256 price) public",
            "function getCurrentPrice(uint256 _tokenId) view returns (uint256)",
        ];

        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
        const wallet = new ethers.Wallet(user.wallet_private_key, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        // Get the current required bid price
        const currentPrice = await contract.getCurrentPrice(hero_id);
        const crystalAmountBN = currentPrice//ethers.toBigInt(amount);

        // Send transaction
        const tx = await contract.bid(hero_id, crystalAmountBN);

        // Wait for confirmation
        await tx.wait();

        const heroData = await getHeroesNetworkById(hero_id);
        // console.log("heroData",heroData);

        await userActivityLogger.logActivity(req, user.id, `Hero Bought`, tx.hash);

        return res.status(200).send(Response.sendResponse(true, heroData, HEROES_CONSTANTS_STATUS.HEROES_BOUGHT, 200));

    } catch (error) {
        console.log(error);
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
}

const performBuyHero = async (req) => {
    try {
        const hero_id = await getSelectedHeroId();
        const user = await fetchUserByEmail(req.user.email);

        const CONTRACT_ADDRESS = "0xc390fAA4C7f66E4D62E59C231D5beD32Ff77BEf0";
        const ABI = [
            "function bid(uint256 amount, uint256 price) public",
            "function getCurrentPrice(uint256 _tokenId) view returns (uint256)",
        ];

        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
        const wallet = new ethers.Wallet(user.wallet_private_key, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        const currentPrice = await contract.getCurrentPrice(hero_id);
        const crystalAmountBN = currentPrice//ethers.toBigInt(amount);

        const tx = await contract.bid(hero_id, crystalAmountBN);

        await tx.wait();

        const heroData = await getHeroesNetworkById(hero_id);

        await userActivityLogger.logActivity(req, user.id, `Hero Bought`, tx.hash);
        return {
            success: true,
            data: heroData,
            transaction_hash: tx.hash
        };

    } catch (error) {
        throw new Error(`Hero purchase failed: ${error.message}`);
    }
}

const heroesStartQuest = async (req, res) => {
    try {
        const user = await fetchUserByEmail(req.user.email);

        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
        const wallet = new ethers.Wallet(user.wallet_private_key, provider);
        const contract = new ethers.Contract(QUEST_CORE_CONTRACT_ADDRESS, QUEST_ABI, wallet);

        const data = await HeroesService.getHeroesByOwner(user.wallet_address);

        if (!data.heroes || data.heroes.length === 0) {
            return res.status(404).send(Response.sendResponse(false, [], HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 404));
        }

        let hero_id = 0;

        for (let i = 0; i < data.heroes.length; i++) {
            hero_id = data.heroes[i].id
    
            let heroes_quest = await contract.getHeroQuest(hero_id);
            let questStatus = Number(heroes_quest[9]);

            const QuestStatus = {
                NONE: 0,
                STARTED: 1,
                COMPLETED: 2,
                CANCELED: 3,
                EXPEDITION: 4
            };

            let hero_status = await fetchAndFormatHeroData(data.heroes[i])
            
            if (!(questStatus === QuestStatus.STARTED || questStatus === QuestStatus.EXPEDITION)
                && hero_status.on_sale === false) {
                break;
            }

        }

        if (!hero_id) {
            return res.status(404).send(Response.sendResponse(false, [], HEROES_CONSTANTS_STATUS.HEROES_NOT_FOUND, 404));
        }

        let stamina = await getHeroeStamina(hero_id);

        if (stamina < 7) {
            return res.status(400).send(Response.sendResponse(false, null, "Hero stamina is not enough", 400));
        }

        let heroIds = Array.isArray(hero_id) ? hero_id : [hero_id];

        const attempts = 1;
        const level = 0;
        const questTypeId = 0;
        const questInstanceId = 1;

        const tx = await contract.startQuest(heroIds, questInstanceId, attempts, level, questTypeId)
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        let heroes_quest_new = await contract.getHeroQuest(hero_id);
        const questData = {
            hero_id: hero_id,
            quest_start_time: heroes_quest_new[6].toString(),
            quest_end_time: heroes_quest_new[7].toString(),
            quest_status: heroes_quest_new[1].toString(),
            hero_level: heroes_quest_new[1].toString(),
            hero_experience: heroes_quest_new[2].toString(),
            wallet_address: heroes_quest_new[4],
            start_time: heroes_quest_new[6].toString(),
            end_time: heroes_quest_new[7].toString(),
            quest_instance_id: heroes_quest_new[8].toString(),
            hero_address: heroes_quest_new[5]
        };
        // update hero telegram
        await db.hero_quests.create(questData);

        await userActivityLogger.logActivity(req, user.id, `Quest Started`, tx.hash);

        if (user.telegram_chatid) {
            await axios.post(process.env.TELEGRAM_API_URL, {
                chat_id: user.telegram_chatid,
                text: "Hero is been started on Quest please login and check your Defi kingdom portal for more info",
            });
        }

        return res.status(200).send(Response.sendResponse(true, receipt, "Quest started successfully", 200));
    } catch (error) {
        // console.error("Error starting quest:", error);
        return res.status(500).send(Response.sendResponse(false, null, HEROES_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
};

async function performStartQuest(req) {
    try {
        const user = await fetchUserByEmail(req.user.email);

        if (!user) {
            throw new Error("User not found");
        }

        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
        const wallet = new ethers.Wallet(user.wallet_private_key, provider);
        const contract = new ethers.Contract(QUEST_CORE_CONTRACT_ADDRESS, QUEST_ABI, wallet);

        const data = await HeroesService.getHeroesByOwner(user.wallet_address);
        if (!data.heroes || data.heroes.length === 0) {
            throw new Error("No heroes found");
        }

        let hero_id = 0;

        for (let i = 0; i < data.heroes.length; i++) {
            hero_id = data.heroes[i].id;
            let heroes_quest = await contract.getHeroQuest(hero_id);
            let questStatus = Number(heroes_quest[9]);
            const QuestStatus = {
                NONE: 0,
                STARTED: 1,
                COMPLETED: 2,
                CANCELED: 3,
                EXPEDITION: 4
            };

            let hero_status = await fetchAndFormatHeroData(data.heroes[i]);

            if (!(questStatus === QuestStatus.STARTED || questStatus === QuestStatus.EXPEDITION)
                && hero_status.on_sale === false) {
                break;
            }
        }

        if (!hero_id) {
            throw new Error("No available hero found");
        }

        let stamina = await getHeroeStamina(hero_id);

        if (stamina < 7) {
            throw new Error("Hero stamina is not enough");
        }

        let heroIds = Array.isArray(hero_id) ? hero_id : [hero_id];
        const attempts = 1;
        const level = 0;
        const questTypeId = 0;
        const questInstanceId = 1;

        const tx = await contract.startQuest(heroIds, questInstanceId, attempts, level, questTypeId);
        const receipt = await tx.wait();

        let heroes_quest_new = await contract.getHeroQuest(hero_id);

        const questData = {
            hero_id: hero_id,
            quest_start_time: heroes_quest_new[6].toString(),
            quest_end_time: heroes_quest_new[7].toString(),
            quest_status: heroes_quest_new[1].toString(),
            hero_level: heroes_quest_new[1].toString(),
            hero_experience: heroes_quest_new[2].toString(),
            wallet_address: heroes_quest_new[4],
            start_time: heroes_quest_new[6].toString(),
            end_time: heroes_quest_new[7].toString(),
            quest_instance_id: heroes_quest_new[8].toString(),
            hero_address: heroes_quest_new[5]
        };

        await db.hero_quests.create(questData);

        await userActivityLogger.logActivity(req, user.id, `Quest Started`, tx.hash);

        return {
            success: true,
            data: receipt,
            transaction_hash: tx.hash
        };
    } catch (error) {
        throw new Error(`Quest start failed: ${error.message}`);
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runQuestCheck = async () => {
    try {
        const quest = await db.hero_quests.findOne({
            where: {
                quest_status: 1,
            },
        });

        if (quest) {
            const currentTimestamp = Math.floor(Date.now() / 1000);
            if (currentTimestamp >= quest.end_time) {
                console.log(`Quest for hero ${quest.hero_id} has ended. Completing quest...`);
                await heroesCompleteQuest(quest.hero_id, quest.wallet_address);
            }
        } else {
            console.log('No quest found or quest is not started yet.');
        }
    } catch (error) {
        console.error('Error in quest check:', error);
    }
};

const startCronJob = async () => {
    while (true) {
        await runQuestCheck();
        console.log('Waiting for 20 seconds before next check...');
        await sleep(5000);
    }
};

// startCronJob();


const heroesCompleteQuest = async (hero_id, wallet_address) => {
    try {
        const user = await fetchUserByWalletAddress(wallet_address);
        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
        const wallet = new ethers.Wallet(user.wallet_private_key, provider);
        const contract = new ethers.Contract(QUEST_CORE_CONTRACT_ADDRESS, QUEST_ABI, wallet);

        console.log(`Completing Quest for hero: ${hero_id}`);
        const tx = await contract.completeQuest(hero_id);
        const receipt = await tx.wait();
        console.log("Quest completed in block:", receipt.blockNumber);
        await db.hero_quests.update({ quest_status: 3 }, { where: { hero_id: hero_id } });

        await axios.post(process.env.TELEGRAM_API_URL, {
            chat_id: user.telegram_chatid,
            text: "Hero Quest is been Completed, Please login to Defi Kingdom portal for more Info",
        });
        return true

    } catch (error) {
        console.error("Error completing quest:", error);
        return false;
    }
};

const sellheroesQuest = async (req, res) => {
    try {
        const { hero_id, startingPrice, endingPrice, duration } = req.body;

        if (!hero_id || !startingPrice || !endingPrice || !duration) {
            return res.status(500).send(Response.sendResponse(false, null, "Missing required parameters", 400));
        }

        const user = await fetchUserByEmail(req.user.email);

        const CONTRACT_ADDRESS = "0xc390fAA4C7f66E4D62E59C231D5beD32Ff77BEf0";
        const ABI = [
            "function createAuction(uint256 _tokenId, uint128 _startingPrice, uint128 _endingPrice, uint64 _duration, address _winner)"
        ];

        const provider = new ethers.JsonRpcProvider(TOKEN_CONSTANTS.DFK_RPC_URL);
        const wallet = new ethers.Wallet(user.wallet_private_key, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

        const startingPriceBN = ethers.parseUnits(startingPrice.toString(), 18);
        const endingPriceBN = ethers.parseUnits(endingPrice.toString(), 18);
        const durationBN = BigInt(duration);
        const tx = await contract.createAuction(hero_id, startingPriceBN, endingPriceBN, durationBN, ethers.ZeroAddress);

        console.log("Transaction sent:", tx);

        const receipt = await tx.wait();

        return res.status(200).send({ success: true, data: receipt, message: "Hero listed for auction successfully" });
    } catch (error) {
        console.error("Error in sellHero API:", error);
        return res.status(500).send({ success: false, message: "An error occurred while listing the hero for auction", error: error.message });
    }
};

module.exports = {
    getOwnerHeroesByAddress,
    heroesStamina,
    buyHeroes,
    heroesStartQuest,
    heroesCompleteQuest,
    sellheroesQuest,
    performBuyHero,
    performStartQuest
};
