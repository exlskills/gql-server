import { logger } from './logger';

// Based on https://github.com/miktam/sizeof

function sizeOfObject(object) {
  //logger.debug(`In sizeOfObject ` + JSON.stringify(object));
  if (!object) {
    return 0;
  }

  var bytes = 0;
  for (let key of Object.keys(object)) {
    //logger.debug(`Object key ` + key);

    if (!Object.hasOwnProperty.call(object, key)) {
      continue;
    }
    bytes += sizeof(key);
    try {
      bytes += sizeof(object[key]);
    } catch (ex) {
      logger.error(`In sizeof key ` + key);
      logger.error(`In sizeof obj ` + JSON.stringify(object));
      logger.error(`In sizeof ` + ex);
      if (ex instanceof RangeError) {
        // circular reference detected, final result might be incorrect
        // let's be nice and not throw an exception
        bytes = 0;
      }
    }
  }
  return bytes;
}

function sizeOfArray(object) {
  if (object == null) {
    return 0;
  }

  var bytes = 0;
  for (let elem of object) {
    try {
      bytes += sizeof(elem);
    } catch (ex) {
      logger.error(`In sizeof elem ` + elem);
      logger.error(`In sizeof ` + ex);
    }
  }
  return bytes;
}

export const sizeof = object => {
  if (process.env.NODE_ENV === 'production') {
    return 0;
  }

  //logger.debug(`object ` + JSON.stringify(object));
  const objectType = Object.prototype.toString.call(object);
  //logger.debug(`objectType ` + objectType);
  switch (objectType) {
    case '[object Array]':
      return sizeOfArray(object);
    case '[object String]':
      return object.length * 2;
    case '[object Boolean]':
      return 4;
    case '[object Number]':
      return 8;
    case '[object Date]':
      return 8;
    case '[object Object]':
      //logger.debug(`object Object ` + object);
      return sizeOfObject(object);
    default:
      logger.debug(`default objectType ` + objectType);
      return 0;
  }
};
