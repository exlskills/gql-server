import ListDef from '../db-models/list-def-model';

export const createListDef = async (type, value, content, locale) =>
  await ListDef.create({
    type: type,
    value: value,
    latest_version: 1,
    contents: [
      {
        version: 1,
        content: {
          intlString: [
            {
              locale: locale,
              is_default: true,
              content: content
            }
          ]
        }
      }
    ]
    // ,
    // desc: {
    //   intlString: [
    //     {
    //       locale: 'en',
    //       is_default: true,
    //       content: 'received a message'
    //     }
    //   ]
    // }
  });
