async function loadGraphQL() {
    const { GraphQLClient, gql } = await import('graphql-request');
    return { GraphQLClient, gql };
}

class GraphQLService {
    constructor() {
        this.endpoint = 'https://api.defikingdoms.com/graphql';
        this.clientPromise = loadGraphQL().then(({ GraphQLClient }) => new GraphQLClient(this.endpoint));
    }

    async request(query, variables) {
        try {
            const client = await this.clientPromise;
            return await client.request(query, variables);
        } catch (error) {
            console.error("GraphQL Request Error:", error);
            throw new Error("GraphQL request failed");
        }
    }
}

module.exports = new GraphQLService();
