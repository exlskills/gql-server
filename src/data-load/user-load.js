// npx babel-node src/data-load/user-load.js

import mongoose from 'mongoose';
import * as fs from 'fs-extra';
import path from 'path';
import * as yaml from 'js-yaml';
import User from '../db-models/user-model';
import config from '../config/index';
import { logger } from '../utils/logger';

async function loadData() {
  try {
    logger.debug(`path __dirname ` + __dirname);
    const fileToRead = path.join(__dirname, './sample-data/user.yaml');
    const fileContents = await fs.readFile(fileToRead);
    const parsed = yaml.safeLoad(fileContents);
    logger.info(`parsed ` + JSON.stringify(parsed));

    let promises = [];
    for (let user of parsed) {
      logger.debug(`user ` + JSON.stringify(user));
      promises.push(User.create(user));
    }
    await Promise.all(promises);
    logger.info('Ok ');
  } catch (err) {
    logger.error('error ' + err);
    //return Promise.reject(err);
  }
}

startRun();

async function startRun() {
  try {
    logger.info('Connecting to ' + config.mongo.uri + '/' + config.mongo.db);
    mongoose.set('useCreateIndex', true);
    await mongoose.connect(
      config.mongo.uri + '/' + config.mongo.db,
      {
        useNewUrlParser: true
      }
    );

    if (config.db_debug_log) {
      mongoose.set('debug', true);
    }

    logger.info('Mongoose connected ok ');

    try {
      const res = await loadData();
      logger.info('done');
    } catch (err) {
      // Must be reported in loadData
    }

    closeConnection();
  } catch (err) {
    logger.error('Process error: ', err);
    process.exit(1);
  }
}

const closeConnection = () => {
  mongoose.connection.close(() => {
    logger.info('Done, mongoose connection disconnected.');
  });
};
