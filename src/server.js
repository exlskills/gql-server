import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import chokidar from 'chokidar';
import cors from 'cors';
import express from 'express';
import graphQLHTTP from 'express-graphql';
import mongoose from 'mongoose';

import config from './config';
import { Schema } from './schema';
import * as middleware from './http-middleware';

console.log('Server starting ...');

const GRAPHQL_PORT = parseInt(config.http_port);

let graphQLServer;

mongoose.Promise = global.Promise;

function startGraphQLServer(callback) {
  let promiseDb = mongoose.connect(
    config.mongo.uri,
    {
      dbName: config.mongo.db,
      autoReconnect: true
    }
  );

  promiseDb
    .then(db => {
      console.log('Mongoose connected ok ');
    })
    .catch(err => {
      console.error('Mongoose connection error:', err.stack);
      process.exit(1);
    });

  const graphQLApp = express();

  graphQLApp.use(
    cors({
      origin: config.cors_origin,
      credentials: true
    })
  );

  graphQLApp.use(cookieParser());

  graphQLApp.use(
    bodyParser.urlencoded({
      extended: true
    })
  );
  graphQLApp.use(bodyParser.json());

  graphQLApp.use(middleware.getViewer);

  graphQLApp.use(
    '/graph',
    middleware.loginRequired,
    graphQLHTTP((request, response, graphQLParams) => ({
      graphiql: true,
      pretty: true,
      schema: Schema,
      context: request.gqlviewer
    }))
  );

  graphQLServer = graphQLApp.listen(GRAPHQL_PORT, () => {
    console.log(
      `GraphQL server is now running on http://localhost:${GRAPHQL_PORT}`
    );
    if (callback) {
      callback();
    }
  });
}

function startServers(callback) {
  // Shut down the servers
  if (graphQLServer) {
    graphQLServer.close();
  }

  let doneTasks = 0;

  function handleTaskDone() {
    doneTasks++;
    if (doneTasks === 1 && callback) {
      callback();
    }
  }
  startGraphQLServer(handleTaskDone);
}

const watcher = chokidar.watch('/{database,schema}.js');
watcher.on('change', path => {
  console.log(`\`${path}\` changed. Restarting.`);
  startServers(() =>
    console.log('Restart your browser to use the updated schema.')
  );
});

startServers();
