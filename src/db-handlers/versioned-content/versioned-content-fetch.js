import { basicFind } from '../../db-handlers/basic-query-handler';
import VersionedContent from '../../db-models/versioned-content-model.js';
import * as projectionWriter from '../../utils/projection-writer';
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

export const fetchVersionedContentById = (
  content_id,
  version,
  viewerLocale
) => {
  logger.debug(` in fetchVersionedContentById`);
  let array = [];
  let elem;

  elem = { $match: { _id: content_id } };
  array.push(elem);

  elem = {
    $project: {
      latest_version: 1,
      contents: {
        $filter: {
          input: '$contents',
          cond: {
            $eq: [
              '$$this.version',
              {
                $cond: [{ $gt: [version, 0] }, version, '$latest_version']
              }
            ]
          }
        }
      }
    }
  };
  array.push(elem);

  elem = { $unwind: '$contents' };
  array.push(elem);

  elem = {
    $project: {
      'content.intlString': projectionWriter.writeIntlStringFilter(
        'contents.content',
        viewerLocale
      ),
      created_at: '$contents.content.created_at',
      updated_at: '$contents.content.updated_at',
      version: '$contents.version'
    }
  };
  array.push(elem);

  elem = {
    $project: {
      content: projectionWriter.writeIntlStringEval('content', viewerLocale),
      created_at: 1,
      updated_at: 1,
      version: 1
    }
  };
  array.push(elem);

  return VersionedContent.aggregate(array).exec();
};
