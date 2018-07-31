import { GraphQLList } from 'graphql';
import { resolveLang } from '../../../relay-resolvers/lang-resolvers';
import { LangType } from '../../../relay-models/lang';

export default {
  type: new GraphQLList(LangType),
  resolve: (_, args, viewer) => resolveLang()
};
