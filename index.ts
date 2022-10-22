require("dotenv").config();

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import type { GatewayInterface } from "@apollo/server-gateway-interface";
import { ApolloGateway } from "@apollo/gateway";
import { addMocksToSchema } from "@graphql-tools/mock";
import { mocks } from "./mocks";

const realGateway = new ApolloGateway();

const gateway: GatewayInterface = {
  async load(options) {
    await realGateway.load(options);
    return {
      schema: null,
      executor: null,
    };
  },
  stop() {
    return realGateway.stop();
  },
  onSchemaLoadOrUpdate(callback) {
    return realGateway.onSchemaLoadOrUpdate((schemaContext) => {
      callback({
        ...schemaContext,
        apiSchema: addMocksToSchema({
          schema: schemaContext.apiSchema,
          mocks: mocks,
        }),
      });
    });
  },
};

async function startApolloServer() {
  const server = new ApolloServer({ gateway: gateway });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀 Apollo Server 4 with managed federation`);
  console.log(`🚀 Apollo Gateway now ready at ${url}`);
}

startApolloServer();
