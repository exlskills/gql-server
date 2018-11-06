import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  globalIdField
} from 'graphql-relay';

import { NodeInterface } from './node-definitions-type';
import { InstructorTimekit } from './instructor-timekit-type';
import { DigitalDiplomaPlan } from './digital-diploma-plan-type';

export const DigitalDiplomaType = new GraphQLObjectType({
  name: 'DigitalDiploma',
  description: 'EXLskills Digital Diploma Program',
  fields: () => ({
    id: globalIdField('DigitalDiploma', obj => obj._id),
    title: {
      type: new GraphQLNonNull(GraphQLString)
    },
    headline: {
      type: new GraphQLNonNull(GraphQLString)
    },
    description: {
      type: new GraphQLNonNull(GraphQLString)
    },
    organization_ids: {
      type: new GraphQLList(GraphQLID)
    },
    primary_locale: {
      type: GraphQLString
    },
    logo_url: {
      type: new GraphQLNonNull(GraphQLString)
    },
    cover_url: {
      type: new GraphQLNonNull(GraphQLString)
    },
    is_published: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    topics: {
      type: new GraphQLList(GraphQLString)
    },
    info_md: {
      type: new GraphQLNonNull(GraphQLString)
    },
    skill_level: {
      type: GraphQLInt
    },
    est_minutes: {
      type: GraphQLInt
    },
    is_project: {
      type: GraphQLBoolean
    },
    primary_topic: {
      type: GraphQLString
    },
    instructor_timekit: {
      type: InstructorTimekit
    },
    plans: {
      type: new GraphQLList(DigitalDiplomaPlan)
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: DigitalDiplomaConnection
} = connectionDefinitions({
  name: 'DigitalDiploma',
  nodeType: DigitalDiplomaType
});
