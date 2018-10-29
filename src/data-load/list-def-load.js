// npx babel-node src/data-load/list-def-load.js

import mongoose from 'mongoose';
import * as fs from 'fs-extra';
import path from 'path';
import * as yaml from 'js-yaml';
import ListDef from '../db-models/list-def-model';
import config from '../config/index';
import { logger } from '../utils/logger';

async function loadData() {
  try {
    logger.debug(`path __dirname ` + __dirname);
    const fileToRead = path.join(__dirname, './sample-data/list_def.yaml');
    const fileContents = await fs.readFile(fileToRead);
    const parsed = yaml.safeLoad(fileContents);
    logger.info(`parsed ` + JSON.stringify(parsed));

    // This assumes that the data passed in are only full updates and inserts

    let totalDocs = 0;
    let successDocs = 0;
    for (let doc of parsed) {
      logger.debug(`doc ` + JSON.stringify(doc));
      totalDocs++;

      if (!(doc.type && doc.value)) {
        logger.error(`-------------> invalid doc`);
        continue;
      }
      const rec_id = await ListDef.findOne({ type: doc.type, value: doc.value })
        .select('_id')
        .exec();

      if (rec_id && rec_id.id) {
        /*
        if (rec_id.id.length === 24) {
          logger.error(
            `-------------> The existing doc is not valid per schema. Delete manually and retry. Doc ID ` +
              rec_id.id
          );
          continue;
        }
        */
        logger.debug(`document exists, deleting `);
        await ListDef.deleteOne({ _id: rec_id._id });
      }

      try {
        await ListDef.create(doc);
        logger.debug(`document inserted`);
        successDocs++;
      } catch (err) {
        logger.error('==============> insert failed ' + err);
      }
    }

    logger.info(`Documents in input YAML: ` + totalDocs);
    logger.info(`Successfully processed : ` + successDocs);
    if (totalDocs !== successDocs) {
      logger.info('FAILED. Fix errors and retry');
    } else {
      logger.info('Completed Ok');
    }
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
