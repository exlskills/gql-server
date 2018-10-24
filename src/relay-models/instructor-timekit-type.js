import { GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { TimekitInterval } from './timekit-interval-type';

export const InstructorTimekit = new GraphQLObjectType({
  name: 'InstructorTimekit',
  description: '',
  fields: () => ({
    intervals: {
      type: new GraphQLNonNull(TimekitInterval)
    }
  })
});
