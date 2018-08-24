import { basicFind } from '../../db-handlers/basic-query-handler';
import User from '../../db-models/user-model';
import * as projectionWriter from '../../utils/projection-writer';
import Activity from '../../db-models/activity-model';
import Organization from '../../db-models/organization-model';
import mongoose from 'mongoose';
import { logger } from '../../utils/logger';

const ObjectId = mongoose.Types.ObjectId;

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(`in User fetchById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(
      User,
      {
        isById: true
      },
      obj_id,
      false,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

export const fetchUserOrgsList = async (obj_id, viewer, info) => {
  logger.debug(`in fetchUserOrgsList`);
  let record;
  let arrayRet = [];
  let arrayIds = [];
  try {
    record = await basicFind(
      User,
      {
        isById: true
      },
      obj_id,
      null,
      {
        organization_roles: 1
      }
    );
    let arrayOrgs = record.organization_roles;
    for (let org of arrayOrgs) {
      arrayIds.push(org.organization_id);
    }
    let elem;
    let array = [];
    elem = {
      $match: {
        _id: {
          $in: arrayIds
        }
      }
    };
    array.push(elem);
    elem = {
      $project: {
        _id: 1,
        'name.intlString': projectionWriter.writeIntlStringFilter(
          'name',
          viewer.locale
        )
      }
    };
    array.push(elem);
    elem = {
      $project: {
        _id: 1,
        organization_name: projectionWriter.writeIntlStringEval(
          'name',
          viewer.locale
        )
      }
    };
    array.push(elem);
    let arrayOrganization = await Organization.aggregate(array).exec();
    for (let org of arrayOrganization) {
      arrayRet.push(org.organization_name);
    }
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return {
    _id: 'temp',
    roles: arrayRet,
    roles_id: arrayIds
  };
};

export const fetchUserProfileById = async (obj_id, viewer, info) => {
  logger.debug(`in fetchUserProfileById`);
  // NOTE: do not include sensitive info into the fields selection below
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(
      User,
      {
        isById: true
      },
      obj_id,
      null,
      {
        _id: 1,
        full_name: 1,
        username: 1,
        primary_email: 1,
        secondary_emails: 1,
        biography: 1,
        headline: 1,
        is_demo: 1,
        has_completed_first_tutorial: 1,
        locales: 1,
        primary_locale: 1,
        avatar_url: 1,
        is_verified: 1,
        course_roles: 1,
        created_at: 1,
        updated_at: 1
      }
    );
  } catch (err) {
    return Promise.reject('Find failed', err);
  }
  return record;
};

export const fetchUserActivities = async (
  userId,
  startDate,
  endDate,
  viewer,
  info
) => {
  logger.debug(`in fetchUserActivities`);
  let record;

  const array = [
    {
      $match: {
        user_id: userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date'
          }
        },
        count: {
          $sum: 1
        }
      }
    },
    {
      $project: {
        date: '$_id',
        count: 1
      }
    }
  ];

  try {
    return await Activity.aggregate(array).exec();
  } catch (err) {
    return Promise.reject('Find failed', err);
  }
};

export const suggestedUser = async (text, stringOrganization, viewer, info) => {
  logger.debug(`in suggestedUser`);
  let records;
  let array = [];
  let elem = {};
  let arrayOrganization = stringOrganization.split('|');

  if (arrayOrganization.length > 0 && stringOrganization !== '') {
    arrayOrganization = arrayOrganization.splice(
      arrayOrganization.length - 2,
      1
    );
    let arrayProcess = [];
    for (let org of arrayOrganization) {
      arrayProcess.push(ObjectId(org));
    }
    elem = {
      $match: {
        'full_name.intlString': {
          $elemMatch: {
            content: {
              $regex: '' + text + '',
              $options: 'i'
            },
            locale: {
              $eq: viewer.locale
            }
          }
        },
        'organization_roles.organization_id': {
          $in: arrayProcess
        }
      }
    };
    array.push(elem);
  }
  elem = {
    $match: {
      'full_name.intlString': {
        $elemMatch: {
          content: {
            $regex: '' + text + '',
            $options: 'i'
          },
          locale: {
            $eq: viewer.locale
          }
        }
      }
    }
  };
  array.push(elem);
  elem = {
    $project: {
      _id: 1,
      'full_name.intlString': projectionWriter.writeIntlStringFilter(
        'full_name',
        viewer.locale
      ),
      primary_email: 1
    }
  };
  array.push(elem);
  elem = {
    $project: {
      _id: 1,
      full_name: projectionWriter.writeIntlStringEval(
        'full_name',
        viewer.locale
      ),
      primary_email: 1
    }
  };
  array.push(elem);
  try {
    records = await User.aggregate(array).exec();
    return records;
  } catch (err) {
    return Promise.reject('Find failed', err);
  }
};
