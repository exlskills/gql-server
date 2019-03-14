import { logger } from '../utils/logger';
import ListDef from '../db-models/list-def-model';
import { basicFind } from '../db-handlers/basic-query-handler';
import { listDefCache } from './cache-objects';
import { getStringByLocale } from '../utils/intl-string-utils';
import { sizeof } from '../utils/calc-field-size';

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
    queryVal = { updated_at: { $gte: listDefCache.updated_at } };
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

    for (let dbRec of dbObj) {
      dbRec = dbRec.toObject();
      logger.debug(
        `Loading data for type and value ` + dbRec.type + ` ` + dbRec.value
      );
      // logger.debug(`list-def rec ` + JSON.stringify(dbRec));
      if (!listDefCache[dbRec.type]) {
        listDefCache[dbRec.type] = {};
      }
      listDefCache[dbRec.type][dbRec.value] = {
        ...dbRec
      };
      delete listDefCache[dbRec.type][dbRec.value].type;
      delete listDefCache[dbRec.type][dbRec.value].value;
    }
    logger.debug(`   loadListDefCache RESULT ` + JSON.stringify(listDefCache));
    //logger.debug(`   loadListDefCache RESULT Size ` + objSize);
  } else {
    logger.debug(`No list-def records extracted`);
  }
}

export function getIntlStringFieldsOfObject(obj, intlStringFields, locales) {
  const result = { data: {}, size: 0 };
  if (obj) {
    for (let locale of locales) {
      result.data[locale] = {};
      result.size += sizeof(locale);
      for (let localeField of intlStringFields) {
        if (obj[localeField]) {
          const intlText = getStringByLocale(obj[localeField], locale).text;
          result.size += sizeof(localeField);
          result.data[locale][localeField] = intlText;
          result.size += sizeof(intlText);
        }
      }
    }
    return result;
  }
}
