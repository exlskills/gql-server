export default function aggregateBuilder(sortVal, skipVal, limitVal) {
  let returnArray = [];

  if (limitVal >= 0 && sortVal) {
    returnArray.push({ $sort: sortVal });
    if (skipVal > 0) {
      returnArray.push({ $skip: skipVal });
    }
    returnArray.push({ $limit: limitVal });
  } else if (limitVal == -1 && sortVal) {
    returnArray.push({ $sort: sortVal });
    if (skipVal > 0) {
      returnArray.push({ $skip: skipVal });
    }
  } else if (limitVal >= 0 && !sortVal) {
    if (skipVal > 0) {
      returnArray.push({ $skip: skipVal });
    }
    returnArray.push({ $limit: limitVal });
  } else if (limitVal == -1 && !sortVal) {
    if (skipVal > 0) {
      returnArray.push({ $skip: skipVal });
    }
  } else {
    logger.error('invalid limitVal in aggregateBuilder:', limitVal);
  }

  return returnArray;
}
