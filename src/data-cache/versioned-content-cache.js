import { logger } from '../utils/logger';
import { basicFind } from '../db-handlers/basic-query-handler';
import VersionedContent from '../db-models/versioned-content-model';
import { cardContentCache } from './cache-objects';
import { getIntlStringFieldsOfObject } from './misc-cache';
import { sizeof } from '../utils/calc-field-size';

export async function loadCardContentCache(card_id, content_id, locales) {
  if (!content_id) {
    delete cardContentCache[card_id];
    return 0;
  }

  logger.debug(`In loadCardContentCache`);

  let objSize = 0;

  let contentDbObj;
  try {
    contentDbObj = await basicFind(
      VersionedContent,
      { isById: true },
      content_id,
      null,
      null
    );
  } catch (errInternalAlreadyReported) {
    return;
  }

  if (!contentDbObj) {
    logger.error(`Versioned Content listed in the card is not found in the DB`);
    delete cardContentCache[card_id];
    return 0;
  }

  contentDbObj = contentDbObj.toObject();

  const contentObj = {
    id: content_id,
    latest_version: contentDbObj.latest_version
  };
  objSize += sizeof(contentObj);

  for (let content of contentDbObj.contents) {
    const intlStringFieldsObj = getIntlStringFieldsOfObject(
      content,
      ['content'],
      locales
    );
    objSize += intlStringFieldsObj.size;
    if (content.version === contentDbObj.latest_version) {
      contentObj.locale_data = intlStringFieldsObj.data;
    } else {
      contentObj[content.version] = { locale_data: intlStringFieldsObj.data };
    }
  }

  //logger.debug(` content Obj ` + JSON.stringify(contentObj));

  cardContentCache[card_id] = contentObj;

  return objSize;
}
