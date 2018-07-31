import { GraphQLList } from 'graphql';
import { resolveFilterTopic } from '../../../relay-resolvers/list-def-resolvers';
import { ListDefType } from '../../../relay-models/list-def';

export default {
  type: new GraphQLList(ListDefType),
  resolve: resolveFilterTopic
};
