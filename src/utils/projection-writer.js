export const writeIntlStringFilter = (elem, viewerLocale) => ({
  $filter: {
    input: '$' + elem + '.intlString',
    cond: {
      $or: [
        { $eq: ['$$this.locale', viewerLocale] },
        { $eq: ['$$this.is_default', true] }
      ]
    }
  }
});

export const writeIntlStringEval = (elem, viewerLocale) => ({
  $cond: [
    {
      $and: [
        { $isArray: '$' + elem + '.intlString' },
        { $gt: [{ $size: '$' + elem + '.intlString' }, 0] }
      ]
    },
    {
      $cond: [
        { $gt: [{ $size: '$' + elem + '.intlString' }, 1] },
        {
          $let: {
            vars: {
              message0: { $arrayElemAt: ['$' + elem + '.intlString', 0] },
              message1: { $arrayElemAt: ['$' + elem + '.intlString', 1] }
            },
            in: {
              $cond: [
                { $eq: ['$$message0.locale', viewerLocale] },
                '$$message0.content',
                '$$message1.content'
              ]
            }
          }
        },
        {
          $let: {
            vars: {
              message: { $arrayElemAt: ['$' + elem + '.intlString', 0] }
            },
            in: '$$message.content'
          }
        }
      ]
    },
    ''
  ]
});
