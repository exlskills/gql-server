// npx babel-node data-load/course-delivery-schedule/src/load-launcher.js

import mongoose from 'mongoose';
import config from '../../../src/config/index';
import { logger } from '../../../src/utils/logger';
import * as fs from 'fs-extra';
import path from 'path';
import CourseDelivery from '../../../src/db-models/course-delivery-model';
import { loadData } from './course-delivery-schedule-load';

startRun();

async function startRun() {
  logger.debug(`in startRun`);
  try {
    logger.info('Connecting to ' + config.mongo.uri + '/' + config.mongo.db);
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
    logger.debug(
      'Mongo DB ' +
        CourseDelivery.db.host +
        ':' +
        CourseDelivery.db.port +
        '/' +
        CourseDelivery.db.name
    );

    try {
      const yamlFile = path.join(__dirname, 'course-delivery.yaml');
      const fileContents = await fs.readFile(yamlFile);
      const res = await loadData(fileContents, yamlFile);
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
  logger.info('In closeConnection.');
  mongoose.connection.close(() => {
    logger.info('Done, mongoose connection disconnected.');
  });
};
