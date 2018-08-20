var PREFIX = 'mongo:';
var POSTFIX1 = '|';
var POSTFIX2 = '|';

import { findWithPaging } from './find-with-paging';
import { getValueByPathToKey } from '../utils/paging-utils';
import { logger } from '../utils/logger';

export function connectionFromDataSource(
  execDetails,
  obj,
  args,
  context,
  info
) {
  logger.debug(`in connectionFromDataSource`);
  return waitForPromisedArray(execDetails, args, context.locale).then(
    result => result
  );
}

async function waitForPromisedArray(execDetails, args, viewerLocale) {
  logger.debug(`in waitForPromisedArray`);
  const dataWithFrame = await findWithPaging(execDetails, args, viewerLocale);
  return connectionFromArrayWithFrame(dataWithFrame, execDetails.businessKey);
}

export function connectionFromArrayWithFrame(dataWithFrame, pathToKey) {
  if (dataWithFrame.array) {
    let amountOfAddedNodes = 0;
    if (dataWithFrame.anchor == 0) {
      dataWithFrame.array.forEach(node => {
        node.anchor = dataWithFrame.anchor;
        node.index = dataWithFrame.offset + amountOfAddedNodes;
        amountOfAddedNodes++;
      });
    } else {
      dataWithFrame.array.forEach(node => {
        node.anchor = dataWithFrame.anchor;
        node.index =
          dataWithFrame.offset +
          dataWithFrame.array.length -
          amountOfAddedNodes -
          1;
        amountOfAddedNodes++;
      });
    }

    var edges = dataWithFrame.array.map(node => nodeToEdge(node, pathToKey));

    return edgesToConnection(edges, {
      hasPreviousPage: dataWithFrame.hasPreviousPage,
      hasNextPage: dataWithFrame.hasNextPage
    });
  }

  // This is if dataWithFrame itself is invalid
  return attachEmptyFrame();
}

var edgesToConnection = function edgesToConnection(edges, _ref) {
  var hasPreviousPage = _ref.hasPreviousPage;
  var hasNextPage = _ref.hasNextPage;

  var startEdge = edges[0];
  var lastEdge = edges[edges.length - 1];

  var startCursor = startEdge == null ? null : startEdge.cursor;
  var endCursor = lastEdge == null ? null : lastEdge.cursor;

  return {
    edges: edges,
    pageInfo: {
      startCursor: startCursor,
      endCursor: endCursor,
      hasPreviousPage: hasPreviousPage,
      hasNextPage: hasNextPage
    }
  };
};

var nodeToEdge = function nodeToEdge(node, pathToKey) {
  return {
    cursor: documentToCursor(node, pathToKey),
    node: node
  };
};

function documentToCursor(doc, pathToKey) {
  //added anchor and index to the doc
  const busKey = getValueByPathToKey(doc, pathToKey);

  const cursor = (0, base64)(
    PREFIX + busKey + POSTFIX1 + doc.anchor + POSTFIX2 + doc.index
  );
  return cursor;
}

export const cursorToDocument = cursor => {
  var unbased = (0, unbase64)(cursor);
  var indexOfPostfix1 = unbased.indexOf(POSTFIX1);

  var businessKey = unbased.slice(PREFIX.length, indexOfPostfix1);

  var temp = unbased.slice(indexOfPostfix1 + POSTFIX1.length, unbased.length);
  var indexOfPostfix2 = temp.indexOf(POSTFIX2);
  var tempAnchor = temp.slice(0, indexOfPostfix2);
  var tempIndex = temp.slice(indexOfPostfix2 + POSTFIX2.length, unbased.length);

  var anchor = Number(tempAnchor);
  var index = Number(tempIndex);

  return { businessKey, anchor, index };
};

function base64(i) {
  return new Buffer(i, 'ascii').toString('base64');
}

function unbase64(i) {
  return new Buffer(i, 'base64').toString('ascii');
}

function startsWith(str, prefix) {
  return str.lastIndexOf(prefix, 0) === 0;
}

export const attachEmptyFrame = (array = []) => ({
  edges: array,
  pageInfo: {
    startCursor: null,
    endCursor: null,
    hasPreviousPage: false,
    hasNextPage: false
  }
});
