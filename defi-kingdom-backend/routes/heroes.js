const express = require("express");
const router = express.Router();
const heroesController = require("../controllers/heroesController");
const JoiMiddleWare = require("../middlewares/joi/joiMiddleware");
const heroesValidationSchema = require("../validations/heroesValidation");
const userAuth = require("../middlewares/jsonwebtoken/joiAuthMiddleware");

router.get("/owner-heroes", 
    JoiMiddleWare(heroesValidationSchema.getOwnerHeroesByAddressSchema, "query"),
    heroesController.getOwnerHeroesByAddress
);

router.get("/heroes-stamina", 
    userAuth,
    JoiMiddleWare(heroesValidationSchema.getHeroesNetworkByIdSchema, "query"),
    heroesController.heroesStamina
);

router.post("/heroes-completed-quest", 
    userAuth,
    heroesController.heroesCompleteQuest
);

router.post("/sell-hero", 
    userAuth,
    JoiMiddleWare(heroesValidationSchema.sellheroesQuestSchema,"body"),
    heroesController.sellheroesQuest
);

module.exports = router; 
