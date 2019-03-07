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
import { logger } from './utils/logger';
import User from './db-models/user-model';
import routes from './routes';
import { initCacheLoad } from './data-cache/cache-manager';

logger.info('Server starting ...');

const GRAPHQL_PORT = parseInt(config.http_port);

let graphQLServer;

mongoose.Promise = global.Promise;

async function startGraphQLServer(callback) {
  //logger.debug('mongo URI ' + config.mongo.uri);
  logger.debug('mongo DB ' + config.mongo.db);

  mongoose.set('useCreateIndex', true);

  const mongoDbProps = {
    useNewUrlParser: true,
    autoReconnect: true
  };

  if (config.db_debug_log) {
    mongoose.set('debug', true);
  }

  try {
    await mongoose.connect(
      config.mongo.uri + '/' + config.mongo.db,
      mongoDbProps
    );
    logger.info('Mongoose connected ok ');
    logger.debug(
      'Mongo DB ' + User.db.host + ':' + User.db.port + '/' + User.db.name
    );
    // logger.debug(mongoose.connection.readyState);
  } catch (err) {
    logger.error('Mongoose connection error:', err.stack);
    process.exit(1);
  }

  // This function has an infinite loop - no wait here
  initCacheLoad();

  const graphQLApp = express();

  graphQLApp.use(
    cors({
      origin: config.cors_origin,
      credentials: true
    })
  );

  graphQLApp.use('/healthcheck', require('express-healthcheck')());

  graphQLApp.use(cookieParser());

  graphQLApp.use(
    bodyParser.urlencoded({
      extended: true
    })
  );

  graphQLApp.use(bodyParser.json());

  const graphQLHTTPOpts = {
    graphiql: true,
    pretty: true,
    schema: Schema
  };

  if (process.env.NODE_ENV !== 'production') {
    graphQLHTTPOpts.formatError = error => ({
      message: error.message,
      locations: error.locations,
      stack: error.stack
    });
  }

  graphQLApp.use(
    '/graph',
    middleware.getViewer,
    middleware.loginRequired,
    graphQLHTTP((request, response, graphQLParams) => ({
      ...graphQLHTTPOpts,
      context: request.gqlviewer
    }))
  );

  graphQLApp.use('/course-delivery-schedule', routes);

  graphQLServer = graphQLApp.listen(GRAPHQL_PORT, () => {
    logger.info(
      `GraphQL server is now running on http://localhost:${GRAPHQL_PORT}`
    );
    if (callback) {
      callback();
    }
  });
}

function startServers(callback) {
  // Shut down the server
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
  logger.debug(`\`${path}\` changed. Restarting.`);
  startServers(() =>
    logger.debug('Restart your browser to use the updated schema.')
  );
});

startServers();
