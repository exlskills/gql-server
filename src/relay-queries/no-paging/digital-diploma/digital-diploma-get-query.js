import { GraphQLString } from 'graphql';
import { DigitalDiplomaType } from '../../../relay-models/digital-diploma-type';
import { resolveDigitalDiplomaById } from '../../../relay-resolvers/digital-diploma-resolver';

export default {
  type: DigitalDiplomaType,
  args: {
    digital_diploma_id: {
      type: GraphQLString
    }
  },
  resolve: (obj, args, viewer, info) =>
    resolveDigitalDiplomaById(obj, args, viewer, info)
};
