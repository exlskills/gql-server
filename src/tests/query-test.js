// npx babel-node src/tests/query-test.js

import mongoose from 'mongoose';
import config from '../config';
import { logger } from '../utils/logger';
import { basicFind } from '../db-handlers/basic-query-handler';
import User from '../db-models/user-model';

async function runTest() {
  try {
    let selectVal = null;
    let record = await basicFind(
      User,
      {
        isById: true
      },
      '123',
      null,
      selectVal
    );
    logger.debug('record ' + record);
    logger.debug('record JSON ' + JSON.stringify(record));
    record = await basicFind(User, null, { _id: '123' }, null, selectVal);
    logger.debug('record ' + record);
    logger.debug('record JSON ' + JSON.stringify(record));
  } catch (err) {
    logger.error('error ' + err);
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
      const res = await runTest();
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
    console.log('Done, mongoose connection disconnected.');
  });
};
