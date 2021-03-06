import { logger } from '../../utils/logger';
import * as fs from 'fs-extra';
import * as jsyaml from 'js-yaml';
import CourseDelivery from '../../db-models/course-delivery-model';
import momentTz from 'moment-timezone';
import { basicFind } from '../../db-handlers/basic-query-handler';

export async function loadData(fileContents, yamlFile) {
  logger.debug(`in loadData`);

  const timeInputStringFormat = 'YYYY-MM-DD HH:mm';
  try {
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
      logger.debug(`schedRun ` + JSON.stringify(schedRun));

      const timeZone = schedRun.scheduling_timezone;

      const momentDateTz = momentTz.tz(
        schedRun.run_start_date,
        timeInputStringFormat,
        timeZone
      );
      schedRun.run_start_date = momentDateTz.utc().format();
      logger.debug(`schedRun.sessions ` + JSON.stringify(schedRun.sessions));
      if (!schedRun.sessions) {
        throw new Error(
          'Must provide scheduled run sessions. Missing for ' +
            JSON.stringify(schedRun)
        );
      }
      for (let schedSession of schedRun.sessions) {
        const sessMomentDateTz = momentTz.tz(
          schedSession.session_start_date,
          timeInputStringFormat,
          timeZone
        );
        schedSession.session_start_date = sessMomentDateTz.utc().format();
      }
    }

    await CourseDelivery.deleteOne({
      course_id: courseDeliveryObj.course_id,
      locale: courseDeliveryObj.locale,
      schedule_owner: courseDeliveryObj.schedule_owner
    });
    logger.info(`record deleted`);

    await CourseDelivery.create(courseDeliveryObj);

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

    if (yamlFile) {
      await fs.writeFile(yamlFile, yaml_out);
    }
    return yaml_out;
  } catch (err) {
    logger.error('error ' + err);
    return Promise.reject(err);
  }
}

const prepareForYaml = (obj, timeInputStringFormat) => {
  logger.debug(`in prepareForYaml`);
  logger.debug(`  prepareForYaml input ` + JSON.stringify(obj));
  logger.debug(
    `  prepareForYaml timeInputStringFormat ` + timeInputStringFormat
  );

  delete obj._id;
  if (obj.instructors && obj.instructors.length < 1) {
    delete obj.instructors;
  }

  for (let delivery_structure of obj.delivery_structures) {
    logger.debug(` delivery_structure ` + JSON.stringify(delivery_structure));
    if (
      delivery_structure.instructors &&
      delivery_structure.instructors.length < 1
    ) {
      delete delivery_structure.instructors;
    }

    delete delivery_structure.created_at;
    delete delivery_structure.updated_at;
    if (delivery_structure.list_price) {
      delete delivery_structure.list_price.created_at;
      delete delivery_structure.list_price.updated_at;
    }

    for (let session of delivery_structure.sessions) {
      logger.debug(`    session ` + JSON.stringify(session));
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
      // logger.debug(` timeZone ` + timeZone);

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
  logger.debug(`  prepareForYaml result ` + JSON.stringify(obj))
  return obj;
};
