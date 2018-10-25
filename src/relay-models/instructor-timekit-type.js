import { TimekitInterval } from './timekit-interval-type';
import { GraphQLList, GraphQLObjectType } from 'graphql';

export const InstructorTimekit = new GraphQLObjectType({
  name: 'InstructorTimekit',
  description: '',
  fields: () => ({
    intervals: {
      type: new GraphQLList(TimekitInterval)
    }
  })
});
