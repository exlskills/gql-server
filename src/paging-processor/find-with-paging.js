import { cursorToDocument } from './connection-from-datasource';
import {
  getValueByPathToKey,
  gqlOrderByToMdbSort,
  reverseSortByObject
} from '../utils/paging-utils';
import aggregateBuilder from './aggregate-array-builder';
import { logger } from '../utils/logger';

/*
  anchor     - record count from the beginning (0) or end (1) of the dataset
  afterInfo  - "after" cursor object
  beforeInfo - "before" cursor object 
  upperLim   - index of the max record to use in the dataset
  lowerLim   - index of the min record to use in the dataset
  takeFirst  - number of "first" records the client requested 
  takeLast   - number of "last" records the client requested 
  offset     - index of the 1st element of the output array in the dataset
  movement   - false if the optimistic query returned expected result 

  assumption: if we have after and before cursor, the anchor is the same

*/

export async function findWithPaging(execDetails, args, viewerLocale) {
  logger.debug(`in (.....) findWithPaging`);
  let sortVal;
  let skipVal;
  let limitVal;
  let array;
  let hasPreviousPage = false;
  let hasNextPage = false;
  let anchor = 0;
  let afterInfo;
  let beforeInfo;
  let upperLim;
  let lowerLim;
  let takeFirst;
  let takeLast;
  let offset;
  let movement = false;

  if (args.after) {
    afterInfo = cursorToDocument(args.after);
  }
  if (args.before) {
    beforeInfo = cursorToDocument(args.before);
  }

  if (afterInfo && beforeInfo && afterInfo.anchor !== beforeInfo.anchor) {
    // TODO input problem
  } else if (
    (afterInfo && afterInfo.anchor === 1) ||
    (beforeInfo && beforeInfo.anchor === 1)
  ) {
    anchor = 1;
  } else if (args.last && !afterInfo && !beforeInfo) {
    anchor = 1;
  }

  if (anchor === 0) {
    sortVal = gqlOrderByToMdbSort(args.orderBy);
    takeFirst = args.first;
    takeLast = args.last;
    if (afterInfo) {
      upperLim = afterInfo;
    }
    if (beforeInfo) {
      lowerLim = beforeInfo;
    }
  } else if (anchor === 1) {
    sortVal = reverseSortByObject(gqlOrderByToMdbSort(args.orderBy));
    takeFirst = args.last;
    takeLast = args.first;
    if (beforeInfo) {
      upperLim = beforeInfo;
    }
    if (afterInfo) {
      lowerLim = afterInfo;
    }
  }

  skipVal = 0;
  if (upperLim) {
    skipVal = upperLim.index;
  }
  if (!upperLim && lowerLim && takeLast) {
    skipVal = Math.max(lowerLim.index - takeLast - 1, 0);
  }
  offset = skipVal;

  if (lowerLim) {
    limitVal = lowerLim.index + 1 - skipVal;
  } else if (takeFirst && upperLim) {
    limitVal = takeFirst + 2;
  } else if (!lowerLim && !upperLim) {
    limitVal = (takeFirst || takeLast) + 1;
  } else {
    limitVal = -1;
  }

  array = await findOptimisticArray(
    execDetails,
    args,
    viewerLocale,
    sortVal,
    skipVal,
    limitVal
  );

  let upperKey;
  let lowerKey;
  if (upperLim) {
    if (array[0]) {
      upperKey = getValueByPathToKey(array[0], execDetails.businessKey);
      if (upperKey === upperLim.businessKey) {
        array.shift();
        hasPreviousPage = true;
        offset = offset + 1;
      } else {
        movement = true;
      }
    } else {
      movement = true;
    }
  }
  if (lowerLim) {
    if (array[array.length - 1]) {
      lowerKey = getValueByPathToKey(
        array[array.length - 1],
        execDetails.businessKey
      );
      if (lowerKey === lowerLim.businessKey) {
        array.pop();
        hasNextPage = true;
      } else {
        movement = true;
      }
    } else {
      movement = true;
    }
  }

  if (takeFirst && array.length > takeFirst) {
    array.splice(takeFirst, array.length - takeFirst);
    hasNextPage = true;
  }
  if (takeLast && array.length > takeLast) {
    offset = offset + array.length - takeLast;
    array.splice(0, array.length - takeLast);
    hasPreviousPage = true;
  }
  if (movement) {
    array = await findOptimisticArray(
      execDetails,
      args,
      viewerLocale,
      sortVal,
      0,
      -1
    );
    offset = 0;

    if (upperLim) {
      let upperIndex = findCursorIndex(execDetails, array, upperLim);
      if (upperIndex !== -1) {
        offset = offset + upperIndex + 1;
        hasPreviousPage = true;
        array.splice(0, upperIndex + 1);
      }
    }
    if (lowerLim) {
      let lowerIndex = findCursorIndex(execDetails, array, lowerLim);
      if (lowerIndex !== -1) {
        array.splice(lowerIndex, array.length - lowerIndex);
        hasNextPage = true;
      }
    }
    if (takeFirst && array.length > takeFirst) {
      array.splice(takeFirst, array.length - takeFirst);
      hasNextPage = true;
    }
    if (takeLast && array.length > takeLast) {
      offset = offset + array.length - takeLast;
      array.splice(0, array.length - takeLast);
      hasPreviousPage = true;
    }
  }
  if (anchor === 1) {
    array.reverse();
    let temp = hasNextPage;
    hasNextPage = hasPreviousPage;
    hasPreviousPage = temp;
  }
  return { array, hasPreviousPage, hasNextPage, offset, anchor };
}

export async function findOptimisticArray(
  execDetails,
  args,
  viewerLocale,
  sortVal,
  skipVal,
  limitVal
) {
  logger.debug(`in (.....) findOptimisticArray`);
  let aggregateArray = aggregateBuilder(sortVal, skipVal, limitVal);
  try {
    return await execDetails.queryFunction(
      args.filterValues,
      aggregateArray,
      viewerLocale,
      execDetails.fetchParameters
    );
  } catch (error) {
    logger.error(`catch in findOptimisticArray ` + error);
    return Promise.reject(error);
  }
}

export function findCursorIndex(execDetails, array, cursorInfo) {
  let cursorIndex = -1;
  for (var i = 0; i < array.length; i++) {
    let businessKey = getValueByPathToKey(array[i], execDetails.businessKey);
    if (businessKey === cursorInfo.businessKey) {
      cursorIndex = i;
      break;
    }
  }
  return cursorIndex;
}
