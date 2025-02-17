const Response = require("../classes/Response");
const WALLET_CONSTANTS_STATUS = require("../constants/walletConstants");

const getProfileByWalletAddress = async (req, res) => {
    try {
      const { GraphQLClient, gql } = await import('graphql-request');
  
      const endpoint = 'https://api.defikingdoms.com/graphql'; // Replace with the actual endpoint
      const client = new GraphQLClient(endpoint);
  
      const query = gql`
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
  
      const walletAddress = req.query.address;
  
      if (!walletAddress) {
        return res.status(400).send(Response.sendResponse(false, null, WALLET_CONSTANTS_STATUS.WALLET_ADDRESS_REQUIRED, 400));
      }
  
      const variables = { id: walletAddress };
      const data = await client.request(query, variables);
  
      if (!data.profile) {
        return res.status(404).send(Response.sendResponse(false, null, WALLET_CONSTANTS_STATUS.WALLET_PROFILE_NOT_FOUND, 404));
      }
   
      return res.status(200).send(Response.sendResponse(true, data.profile, WALLET_CONSTANTS_STATUS.WALLET_PROFILE_FETCHED, 200));

    } catch (error) {
        return res.status(500).send(Response.sendResponse(false, null, WALLET_CONSTANTS_STATUS.ERROR_OCCURED, 500));
    }
};

const getProfileByName = async (req, res) => {  
    try {
        const { GraphQLClient, gql } = await import('graphql-request');

        const endpoint = 'https://api.defikingdoms.com/graphql'; // Replace with the actual endpoint
        const client = new GraphQLClient(endpoint);

        const query = gql`
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

        const name = req.query.name;

        if (!name) {
            return res.status(400).send(
                Response.sendResponse(false, null, WALLET_CONSTANTS_STATUS.WALLET_ADDRESS_REQUIRED, 400)
            );
        }

        const variables = { name };
        const data = await client.request(query, variables);

        if (!data.profiles || data.profiles.length === 0) {
            return res.status(404).send(
                Response.sendResponse(false, null, WALLET_CONSTANTS_STATUS.WALLET_PROFILE_NOT_FOUND, 404)
            );
        }

        return res.status(200).send(
            Response.sendResponse(true, data.profiles, WALLET_CONSTANTS_STATUS.WALLET_PROFILE_FETCHED, 200)
        );
    } catch (error) {
        console.error('Error fetching profile by name:', error);
        return res.status(500).send(
            Response.sendResponse(false, null, WALLET_CONSTANTS_STATUS.ERROR_OCCURED, 500)
        );
    }
};

  
module.exports = { getProfileByWalletAddress, getProfileByName };
  


