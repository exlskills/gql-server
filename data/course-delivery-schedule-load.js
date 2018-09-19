// npx babel-node data/course-delivery-schedule-load.js

import mongoose from 'mongoose';
import config from '../src/config';
import { logger } from '../src/utils/logger';
import * as fs from 'fs-extra';
import path from 'path';
import * as yaml from 'js-yaml';
import CourseDelivery from '../src/db-models/course-delivery-model';

startRun();

async function loadData() {
  try {
    const fileToRead = path.join(__dirname, 'course-delivery.yaml');
    const fileContents = await fs.readFile(fileToRead);
    const courseDeliveryObj = yaml.safeLoad(fileContents);
    logger.debug(`parsed ` + JSON.stringify(courseDeliveryObj));

    let promises = [];
    promises.push(CourseDelivery.create(courseDeliveryObj));
    await Promise.all(promises);
    logger.info(`record inserted`);

  } catch (err) {
    logger.error('error ' + err);
    return Promise.reject(err);
  }
}

async function startRun() {
  try {
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

    const res = await loadData();

    logger.info('done');
    closeConnection();
  } catch (err) {
    logger.error('Process error: ', err);
  }
}

const closeConnection = () => {
  logger.info('In closeConnection.');
  mongoose.connection.close(() => {
    logger.info('Done, mongoose connection disconnected.');
  });
};
