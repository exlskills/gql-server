import { logger } from '../utils/logger';
import ListDef from '../db-models/list-def-model';
import { basicFind } from '../db-handlers/basic-query-handler';
import { courseDeliveryCache, listDefCache } from './cache-objects';

export async function loadListDefCache(init_load, recordID) {
  logger.debug(`In loadListDefCache`);

  let objSize = 0;

  const selectVal = { created_at: 0 };
  let runParams = null;
  let queryVal = null;
  if (init_load) {
    runParams = { isAll: true };
  } else if (recordID) {
    runParams = { isById: true };
    queryVal = recordID;
  } else {
    queryVal = { updated_at: { $ge: listDefCache.updated_at } };
  }

  const extractedAt = new Date();

  let dbObj = await basicFind(
    ListDef,
    runParams,
    queryVal,
    { type: 1 },
    selectVal
  );

  if (recordID && dbObj) {
    dbObj = [dbObj];
  }

  if (dbObj && dbObj.length > 0) {
    listDefCache.updated_at = extractedAt;
    logger.debug(`list-def records ` + JSON.stringify(dbObj));
    logger.debug(`   listDefCache updated_at ` + listDefCache.updated_at);
  } else {
    logger.debug(`No list-def records extracted`);
  }

  for (let dbRec of dbObj) {
    logger.debug(
      `Loading data for type and value ` + dbRec.type + ` ` + dbRec.value
    );
    logger.debug(`list-def rec ` + JSON.stringify(dbRec));
    if (!listDefCache[dbRec.type]) {
      listDefCache[dbRec.type] = {};
    }
    listDefCache[dbRec.type][dbRec.value] = {
      ...dbRec.toObject()
    };
    delete listDefCache[dbRec.type][dbRec.value].type;
    delete listDefCache[dbRec.type][dbRec.value].value;
  }
  logger.debug(`   loadListDefCache RESULT ` + JSON.stringify(listDefCache));
  //logger.debug(`   loadListDefCache RESULT Size ` + objSize);
}
