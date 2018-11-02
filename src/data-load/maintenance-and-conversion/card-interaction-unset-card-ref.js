// npx babel-node src/data-load/maintenance-and-conversion/card-interaction-unset-card-ref.js

import { logger } from '../../utils/logger';
import config from '../../config';
import mongoose from 'mongoose';
import CardInteraction from '../../db-models/card-interaction-model';

async function processData() {
  const batchSize = 1000;

  let recsToUpdateCount = 0;
  let recsUpdatedCount = 0;
  let moreCardsToProcess = true;
  let maxObjID = null;
  try {
    while (moreCardsToProcess) {
      let findObj = {
        card_ref: { $exists: true },
        course_item_ref: { $exists: true }
      };
      if (maxObjID) {
        findObj._id = { $gt: maxObjID };
      }

      const recsToUpdate = await CardInteraction.find(findObj, {
        _id: 1
      })
        .sort({ _id: 1 })
        .limit(batchSize);
      logger.info(` records found ` + recsToUpdate.length);

      if (!recsToUpdate || recsToUpdate.length < 1) {
        moreCardsToProcess = false;
        break;
      }

      let bulk = CardInteraction.collection.initializeUnorderedBulkOp();
      let runbulk = false;

      for (let recToUpdate of recsToUpdate) {
        logger.debug(` record_id ` + recToUpdate._id);
        maxObjID = recToUpdate._id;

        recsToUpdateCount++;

        await bulk.find({ _id: recToUpdate._id }).updateOne({
          $set: {
            updated_at: new Date()
          },
          $unset: { card_ref: '' }
        });
        recsUpdatedCount++;
        runbulk = true;
      }

      if (runbulk) {
        let bulkResult;
        try {
          bulkResult = await bulk.execute();
        } catch (err) {
          logger.error(`bulk error ` + err);
        }
        logger.info(`Bulk result ` + JSON.stringify(bulkResult));
      } else {
        logger.info(`Bulk skipped `);
      }
      logger.info(`max ID ` + maxObjID);

      // TESTING
      //break;

    }
  } catch (err) {
    logger.error('error ' + err);
  }
  logger.info(`Count Total Records ` + recsToUpdateCount);
  logger.info(`  Count Records Updated ` + recsUpdatedCount);
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
      const res = await processData();
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
