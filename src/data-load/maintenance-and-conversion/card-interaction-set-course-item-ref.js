// npx babel-node src/data-load/maintenance-and-conversion/card-interaction-set-course-item-ref.js

import { logger } from '../../utils/logger';
import config from '../../config';
import mongoose from 'mongoose';
import CardInteraction from '../../db-models/card-interaction-model';
import * as CourseFetch from '../../db-handlers/course/course-fetch';
import moment from 'moment';

async function processData() {
  const batchSize = 10;

  let recsToUpdateCount = 0;
  let recsUpdatedCount = 0;
  let recIdsWithIssues = [];
  let recIdsDeleted = [];
  let moreCardsToProcess = true;
  let maxObjID = null;
  //maxObjID = new mongoose.Types.ObjectId('5bd607df92e2e400184c0a06');
  try {
    while (moreCardsToProcess) {
      let findObj = {
        'card_ref.EmbeddedDocRef.embedded_doc_refs': { $exists: true },
        created_at: {
          $lt: moment()
            .utc()
            .startOf('day')
            .toDate()
        },
        updated_at: {
          $lt: moment()
            .utc()
            .startOf('day')
            .toDate()
        }
      };
      if (maxObjID) {
        findObj._id = { $gt: maxObjID };
      }

      const recsToUpdate = await CardInteraction.find(findObj, {
        _id: 1,
        card_id: 1,
        card_ref: 1,
        course_item_ref: 1
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

        let skipRecord = false;

        let card_id = checkStringTail(recToUpdate.card_id);
        if (!card_id) {
          continue;
        }
        const course_item_ref = {};

        recToUpdate.card_ref.EmbeddedDocRef.embedded_doc_refs.forEach(ref => {
          let strVal = checkStringTail(ref.doc_id);
          if (!strVal) {
            skipRecord = true;
          }

          switch (ref.level) {
            case 'course':
              course_item_ref.course_id = strVal;
              break;
            case 'unit':
              course_item_ref.unit_id = strVal;
              break;
            case 'section':
              course_item_ref.section_id = strVal;
              break;
          }
        });
        logger.debug(` course_item_ref ` + JSON.stringify(course_item_ref));
        if (skipRecord) {
          recIdsWithIssues.push(recToUpdate._id);
          continue;
        }

        /*
        let courseRec = await CourseFetch.fetchById(course_item_ref.course_id, {
          units: 1
        });
        if (
          !courseRec ||
          !courseRec.units ||
          courseRec.units.Units.length < 1
        ) {
          logger.error(
            ` ----------> Course is not in the DB anymore ` +
              course_item_ref.course_id +
              ` Deleting Card Interaction `
          );
          recIdsDeleted.push(recToUpdate._id);
          continue;
        }

        logger.debug(` unitId ` + course_item_ref.unit_id);
        let unitRec = courseRec.units.Units.find(
          e => e._id === course_item_ref.unit_id
        );
        if (
          !unitRec ||
          !unitRec.sections ||
          unitRec.sections.Sections.length < 1
        ) {
          recIdsDeleted.push(recToUpdate._id);
          logger.error(
            ` ----------> Unit is not in the DB anymore ` +
              course_item_ref.unit_id +
              ` Deleting Card Interaction `
          );
          continue;
        }

        logger.debug(` sectionId ` + course_item_ref.section_id);
        let sectionRec = unitRec.sections.Sections.find(
          e => e._id === course_item_ref.section_id
        );
        if (
          !sectionRec ||
          !sectionRec.cards ||
          sectionRec.cards.Cards.length < 1
        ) {
          logger.error(
            ` ----------> Section is not in the DB anymore ` +
              course_item_ref.section_id +
              ` Deleting Card Interaction `
          );
          recIdsDeleted.push(recToUpdate._id);
          continue;
        }

        logger.debug(` cardId ` + card_id);
        let cardRec = sectionRec.cards.Cards.find(e => e._id === card_id);
        if (!cardRec || !cardRec._id) {
          logger.error(
            ` ----------> Card is not in the DB anymore ` +
              card_id +
              ` Deleting Card Interaction `
          );
          recIdsDeleted.push(recToUpdate._id);
          continue;
        }
        */

        if (
          recToUpdate.card_id === card_id &&
          recToUpdate.course_item_ref &&
          recToUpdate.course_item_ref.course_id === course_item_ref.course_id &&
          recToUpdate.course_item_ref.unit_id === course_item_ref.unit_id &&
          recToUpdate.course_item_ref.section_id === course_item_ref.section_id
        ) {
          logger.debug(`no update needed`);
        } else {
          await bulk.find({ _id: recToUpdate._id }).updateOne({
            $set: {
              updated_at: new Date(),
              card_id: card_id,
              course_item_ref: course_item_ref
            }
          });
          recsUpdatedCount++;
          runbulk = true;
        }
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
    }
  } catch (err) {
    logger.error('error ' + err);
    //return Promise.reject(err);
  }
  logger.info(`Count Total Records ` + recsToUpdateCount);
  logger.info(`  Count Records Updated ` + recsUpdatedCount);
  for (let ids of recIdsWithIssues) {
    logger.info(`id with issue ` + ids._id);
  }
  for (let ids of recIdsDeleted) {
    logger.info(`id deleted ` + ids._id);
  }
}

function checkStringTail(str) {
  let retVal = str;
  if (str.charCodeAt(str.length - 1) === 65533) {
    if (str.charCodeAt(str.length - 2) === 49) {
      retVal = str.substr(0, str.length - 2);
    } else if (str.charCodeAt(str.length - 2) === 29) {
      retVal = str.substr(0, str.length - 5);
    } else {
      logger.error(`Unknown string ` + str);
      for (var i = 0; i < str.length; ++i) {
        var code = str.charCodeAt(i);
        logger.debug(i + ` ` + code + ` ` + str.substr(i, 1));
      }
      return null;
    }
  }
  return retVal;
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
