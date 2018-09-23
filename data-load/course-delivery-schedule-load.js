// npx babel-node data-load/course-delivery-schedule-load.js

import mongoose from 'mongoose';
import config from '../src/config';
import { logger } from '../src/utils/logger';
import * as fs from 'fs-extra';
import path from 'path';
import * as jsyaml from 'js-yaml';
import CourseDelivery from '../src/db-models/course-delivery-model';
import momentTz from 'moment-timezone';
import { basicFind } from '../src/db-handlers/basic-query-handler';

startRun();

async function loadData() {
  const timeInputStringFormat = 'YYYY-MM-DD HH:mm';
  let promises = [];
  try {
    const yamlFile = path.join(__dirname, 'course-delivery.yaml');
    const fileContents = await fs.readFile(yamlFile);
    const courseDeliveryObj = jsyaml.safeLoad(fileContents);
    // logger.debug(`parsed ` + JSON.stringify(courseDeliveryObj));

    if (
      !(
        courseDeliveryObj.course_id &&
        courseDeliveryObj.locale &&
        courseDeliveryObj.schedule_owner
      )
    ) {
      throw new Error('Must provide course_id, locale and schedule_owner');
    }

    for (let schedRun of courseDeliveryObj.delivery_structures[0]
      .scheduled_runs) {
      // logger.debug(`schedRun ` + JSON.stringify(schedRun));

      const timeZone = schedRun.scheduling_timezone;

      const momentDateTz = momentTz.tz(
        schedRun.run_start_date,
        timeInputStringFormat,
        timeZone
      );
      schedRun.run_start_date = momentDateTz.utc().format();
      for (let schedSession of schedRun.sessions) {
        const sessMomentDateTz = momentTz.tz(
          schedSession.session_start_date,
          timeInputStringFormat,
          timeZone
        );
        schedSession.session_start_date = sessMomentDateTz.utc().format();
      }
    }

    promises.push(CourseDelivery.create(courseDeliveryObj));

    await CourseDelivery.deleteOne({
      course_id: courseDeliveryObj.course_id,
      locale: courseDeliveryObj.locale,
      schedule_owner: courseDeliveryObj.schedule_owner
    });

    logger.info(`record deleted`);

    await Promise.all(promises);

    logger.info(`record inserted`);

    let courseDeliveryRecord = await basicFind(
      CourseDelivery,
      { isOne: true },
      {
        course_id: courseDeliveryObj.course_id,
        locale: courseDeliveryObj.locale,
        schedule_owner: courseDeliveryObj.schedule_owner
      },
      null,
      null
    );
    //logger.debug(` courseDeliveryRecord ` + courseDeliveryRecord);

    if (!courseDeliveryRecord || courseDeliveryRecord.length < 1) {
      throw new Error('Load failed');
    }

    const yaml_out = jsyaml.safeDump(
      prepareForYaml(
        courseDeliveryRecord.toObject({ versionKey: false }),
        timeInputStringFormat
      ) /*,
      {
        skipInvalid: true
      } */
    );
    logger.debug(` jaml_out ` + yaml_out);

    await fs.writeFile(yamlFile, yaml_out);
  } catch (err) {
    logger.error('error ' + err);
    return Promise.reject();
  }
}

const prepareForYaml = (obj, timeInputStringFormat) => {
  delete obj._id;
  if (obj.instructors && obj.instructors.length < 1) {
    delete obj.instructors;
  }

  for (let delivery_structure of obj.delivery_structures) {
    if (
      delivery_structure.instructors &&
      delivery_structure.instructors.length < 1
    ) {
      delete delivery_structure.instructors;
    }

    delete delivery_structure.created_at;
    delete delivery_structure.updated_at;
    delete delivery_structure.list_price.created_at;
    delete delivery_structure.list_price.updated_at;

    for (let session of delivery_structure.sessions) {
      if (session.instructors && session.instructors.length < 1) {
        delete session.instructors;
      }
      if (session.delivery_methods && session.delivery_methods.length < 1) {
        delete session.delivery_methods;
      }
      delete session.created_at;
      delete session.updated_at;
    }
    for (let scheduled_run of delivery_structure.scheduled_runs) {
      if (scheduled_run.instructors && scheduled_run.instructors.length < 1) {
        delete scheduled_run.instructors;
      }
      delete scheduled_run.created_at;
      delete scheduled_run.updated_at;
      if (scheduled_run.offered_at_price) {
        delete scheduled_run.offered_at_price.created_at;
        delete scheduled_run.offered_at_price.updated_at;
      }

      const timeZone = scheduled_run.scheduling_timezone;

      const utcTime = momentTz.tz(
        scheduled_run.run_start_date,
        'YYYY-MM-DD[T]HH:mm[:00.000Z]',
        'UTC'
      );
      scheduled_run.run_start_date = utcTime
        .clone()
        .tz(timeZone)
        .format(timeInputStringFormat);

      for (let run_session of scheduled_run.sessions) {
        if (run_session.instructors && run_session.instructors.length < 1) {
          delete run_session.instructors;
        }
        delete run_session.created_at;
        delete run_session.updated_at;

        const sessionUtcTime = momentTz.tz(
          run_session.session_start_date,
          'YYYY-MM-DD[T]HH:mm[:00.000Z]',
          'UTC'
        );
        run_session.session_start_date = sessionUtcTime
          .clone()
          .tz(timeZone)
          .format(timeInputStringFormat);
      }
    }
  }
  return obj;
};

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
  logger.info('In closeConnection.');
  mongoose.connection.close(() => {
    logger.info('Done, mongoose connection disconnected.');
  });
};
