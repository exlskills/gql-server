import { basicFind } from '../../db-handlers/basic-query-handler';
import VersionedContent from '../../db-models/versioned-content-model.js';
import { logger } from '../../utils/logger';

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(` in Versioned Content fetchById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(
      VersionedContent,
      { isById: true },
      obj_id,
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};
