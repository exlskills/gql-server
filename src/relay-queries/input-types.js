import {
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLList,
  GraphQLString
} from 'graphql';

export const OrderByDirectionType = new GraphQLEnumType({
  name: 'OrderByDirection',
  values: {
    DESC: { value: -1 },
    ASC: { value: 1 }
  }
});

export const CudActionType = new GraphQLEnumType({
  name: 'CudAction',
  values: {
    CREATE: { value: 'C' },
    UPDATE: { value: 'U' },
    DELETE: { value: 'D' }
  }
});

export const OrderByType = new GraphQLList(
  new GraphQLInputObjectType({
    name: 'OrderBy',
    fields: {
      field: { type: GraphQLString },
      direction: {
        type: OrderByDirectionType,
        defaultValue: OrderByDirectionType.DESC
      }
    }
  })
);

export const FilterValuesType = new GraphQLInputObjectType({
  name: 'FilterValues',
  fields: {
    filterValuesString: { type: GraphQLString }
  }
});

export const QueryResolverArgsType = new GraphQLList(
  new GraphQLInputObjectType({
    name: 'QueryResolverArgs',
    fields: {
      param: { type: GraphQLString },
      value: { type: GraphQLString }
    }
  })
);

export const FieldCudType = new GraphQLList(
  new GraphQLInputObjectType({
    name: 'FieldCud',
    fields: {
      field: { type: GraphQLString },
      valueToAssign: { type: GraphQLString },
      valueToFind: { type: GraphQLString },
      cudAction: { type: CudActionType }
    }
  })
);
