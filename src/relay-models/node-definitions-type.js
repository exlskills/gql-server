import { fromGlobalId, nodeDefinitions } from 'graphql-relay';

import * as Course from '../db-handlers/course/course-fetch.js';
import * as Organization from '../db-handlers/organization-fetch.js';
import * as Path from '../db-handlers/path-fetch.js';
import * as Question from '../db-handlers/question/question-fetch.js';
import * as VersionedContent from '../db-handlers/versioned-content/versioned-content-fetch.js';

/**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve an object to its GraphQL type.
 */
export const {
  nodeInterface: NodeInterface,
  nodeField: NodeField
} = nodeDefinitions(
  globalId => {
    var { type, id } = fromGlobalId(globalId);
    let modelType = null;
    switch (type) {
      case 'Course':
        modelType = Course;
        break;
      case 'Organization':
        modelType = Organization;
        break;
      case 'Path':
        modelType = Path;
        break;
      case 'Question':
        modelType = Question;
        break;
      case 'VersionedContent':
        modelType = VersionedContent;
        break;
      default:
        return null;
    }
    // TODO add the other objects once we have a way to manage permissions for getting these...
    return modelType.fetchById(id);
  },
  obj => {}
);
