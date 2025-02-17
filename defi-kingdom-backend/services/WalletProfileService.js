const GraphQLService = require("./graphQLService.js");

class WalletProfileService {
    async getProfileByWalletAddress(walletAddress) {
        const query = `
            query GetProfile($id: ID!) {
                profile(id: $id) {
                    id
                    name
                    nftId
                    collectionId
                    picUri
                }
            }
        `;
        return await GraphQLService.request(query, { id: walletAddress });
    }

    async getProfileByName(name) {
        const query = `
            query GetProfilesByName($name: String!) {
                profiles(where: { name: $name }) {
                    id
                    name
                    nftId
                    collectionId
                    picUri
                }
            }
        `;
        return await GraphQLService.request(query, { name });
    }
}

module.exports = new WalletProfileService();
