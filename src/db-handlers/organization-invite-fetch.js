import { basicFind } from '../db-handlers/basic-query-handler';
import OrganizationInvite from '../db-models/organization-invite-model.js';
import { logger } from '../utils/logger';

export const findById = async (obj_id, viewer, info) => {
  logger.debug(`in Org Invite findById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(OrganizationInvite, { isById: true }, obj_id);
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};
