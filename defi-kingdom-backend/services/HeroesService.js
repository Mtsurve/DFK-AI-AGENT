const GraphQLService = require("./graphQLService.js");

class HeroesService {
    async getHeroesByOwner(ownerAddress) {
        const query = `
            query GetHeroesByOwner($owner: String!) {
                heroes(where: { owner: $owner }) {
                    ${this.getHeroFields()}
                }
            }
        `;
        return await GraphQLService.request(query, { owner: ownerAddress });
    }

    async getHeroesById(id) {
        const query = `
            query GetHeroesNetworkById($id: ID!) {
                heroes(where: { id: $id }) {
                    ${this.getHeroFields()}
                    owner {
                        name
                    }
                }
            }
        `;
        return await GraphQLService.request(query, { id });
    }

    async getHeroesByRarity(rarity) {
        const query = `
            query GetHeroesByRarity($rarity: Int!) {  
                heroes(where: { rarity: $rarity }) {
                    id
                    mainClass
                    rarity
                }
            }
        `;
        return await GraphQLService.request(query, { rarity: parseInt(rarity, 10) });
    }

    async getHeroesByStatus(owner, pjStatus) {
        const query = `
            query GetHeroesByStatus($owner: String!, $pjStatus: String!) {
                heroes(where: { owner: $owner, pjStatus: $pjStatus }) {
                    id
                    mainClass
                    rarity
                }
            }
        `;
        return await GraphQLService.request(query, { owner, pjStatus });
    }

    getHeroFields() {
        return `
            id mainClassStr subClassStr rarity stamina staminaFullAt summons maxSummons xp level generation element background gender 
            firstName lastName hp mp strength dexterity agility vitality endurance intelligence wisdom luck 
            mining gardening foraging fishing 
            strengthGrowthP dexterityGrowthP agilityGrowthP vitalityGrowthP enduranceGrowthP 
            intelligenceGrowthP wisdomGrowthP luckGrowthP 
            strengthGrowthS dexterityGrowthS agilityGrowthS vitalityGrowthS enduranceGrowthS 
            intelligenceGrowthS wisdomGrowthS luckGrowthS currentQuest saleAuction { id }
        `;
    }
}

module.exports = new HeroesService();
