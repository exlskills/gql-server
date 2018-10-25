// npx babel-node src/data-load/maintenance-and-conversion/card-interaction-set-course-item-ref.js

import { logger } from '../../utils/logger';
import config from '../../config';
import mongoose from 'mongoose';
import CardInteraction from '../../db-models/card-interaction-model';
import * as CourseFetch from '../../db-handlers/course/course-fetch';

async function processData() {
  let recsToUpdateCount = 0;
  let recsUpdatedCount = 0;
  let recIdsWithIssues = [];
  let recIdsDeleted = [];
  try {
    const recsToUpdate = await CardInteraction.find(
      { 'card_ref.EmbeddedDocRef.embedded_doc_refs': { $exists: true } },
      { _id: 1, card_id: 1, card_ref: 1 }
    );
    logger.debug(` records found ` + recsToUpdate.length);
    let cnt = 0;
    for (let recToUpdate of recsToUpdate) {
      logger.debug(` record_id ` + recToUpdate._id);

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

      let courseRec = await CourseFetch.fetchById(course_item_ref.course_id, {
        units: 1
      });
      if (!courseRec || !courseRec.units || courseRec.units.Units.length < 1) {
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

      await CardInteraction.updateOne(
        { _id: recToUpdate._id },
        {
          card_id: card_id,
          course_item_ref: course_item_ref
        }
      );
      recsUpdatedCount++;
    }
  } catch (err) {
    logger.error('error ' + err);
    //return Promise.reject(err);
  }
  logger.info(`Count Records to Update ` + recsToUpdateCount);
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
