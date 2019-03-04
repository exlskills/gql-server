import { logger } from './logger';

// Based on https://github.com/miktam/sizeof

function sizeOfObject(object) {
  if (object == null) {
    return 0;
  }

  var bytes = 0;
  for (var key in object) {
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
  //logger.debug(`object ` + JSON.stringify(object));
  var objectType = typeof object;
  //logger.debug(`objectType ` + objectType);
  const isArr = Object.prototype.toString.call(object) == '[object Array]';
  if (isArr) {
    return sizeOfArray(object);
  }
  switch (objectType) {
    case 'string':
      return object.length * 2;
    case 'boolean':
      return 4;
    case 'number':
      return 8;
    case 'object':
      //logger.debug(`object ` + JSON.stringify(object));
      return sizeOfObject(object);
    default:
      return 0;
  }
};
