import { GraphQLList } from 'graphql';
import { resolveLang } from '../../../relay-resolvers/lang-resolver';
import { LangType } from '../../../relay-models/lang-type';

export default {
  type: new GraphQLList(LangType),
  resolve: (_, args, viewer) => resolveLang()
};
