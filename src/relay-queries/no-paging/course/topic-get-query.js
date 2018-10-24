import { GraphQLList } from 'graphql';
import { resolveFilterTopic } from '../../../relay-resolvers/list-def-resolver';
import { ListDefType } from '../../../relay-models/list-def-type';

export default {
  type: new GraphQLList(ListDefType),
  resolve: resolveFilterTopic
};
