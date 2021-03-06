#!/usr/bin/env node

/* eslint-disable no-console */

import './promisify'

import path from 'path'
import { readFileSync } from 'fs'
import { Command } from 'commander'
import { parse as parseConnectionString } from 'pg-connection-string'
import createGraphqlSchema from './createGraphqlSchema.js'
import createServer from './createServer.js'
import { extendSchema, parse, printSchema, graphql, execute, GraphQLSchema, GraphQLString, GraphQLObjectType } from 'graphql'
import pg from 'pg'

const manifest = JSON.parse(readFileSync(path.resolve(__dirname, '../package.json')))

const main = async () => {
  const program = new Command('postgraphql')

  /* eslint-disable max-len */
  program
    .version(manifest.version)
    .usage('[options] <url>')
    .option('-s, --schema <identifier>', 'the PostgreSQL schema to serve a GraphQL server of. defaults to public')
    .option('-n, --hostname <name>', 'a URL hostname the server will listen to. defaults to localhost')
    .option('-p, --port <integer>', 'a URL port the server will listen to. defaults to 3000', parseInt)
    .option('-d, --development', 'enables a development mode which enables GraphiQL, nicer errors, and JSON pretty printing')
    .option('-r, --route <path>', 'the route to mount the GraphQL server on. defaults to /')
    .option('-e, --secret <string>', 'the secret to be used to encrypt tokens. token authentication disabled if this is not set')
    .option('-m, --max-pool-size <integer>', 'the maximum number of connections to keep in the connection pool. defaults to 10')
    .parse(process.argv)
    /* eslint-enable max-len */

  var {args: [connection], schema: schemaName = 'public', hostname = 'localhost', port = 3000, development = false, route = '/graphql/', secret, maxPoolSize = 10, } = program

  connection = process.env.DATABASE_URL || connection;
  port = process.env.PORT || port;

  if (!connection)
    throw new Error('Must define a PostgreSQL connection string to connect to.')

  // Parse out the connection string into an object and attach a
  // `poolSize` option.
  const pgConfig = {
    ...parseConnectionString(connection),
    poolSize: maxPoolSize,
  }

  // Create the GraphQL schema.
  const graphqlSchema = await createGraphqlSchema(pgConfig, schemaName);

  // Create the GraphQL HTTP server.
  const server = createServer({
    graphqlSchema,
    pgConfig,
    route,
    secret,
    development,
  })

  server.listen(port, hostname, () => {
    console.log(`GraphQL server listening at http://${hostname}:${port}${route} 🚀`)
  })
}

main().catch(error => console.error(error.stack))
