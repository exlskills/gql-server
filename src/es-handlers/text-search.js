import elasticsearch from 'elasticsearch';
import { logger } from '../utils/logger';
import config from '../config';
import { toGlobalId } from 'graphql-relay';

export const fetchTextMatchingCourseItems = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchTextMatchingCourseItems`);

  if (!config.elasticsearch.url) {
    return Promise.reject('Search is not available');
  }

  try {
    const client = new elasticsearch.Client({
      host: config.elasticsearch.url,
      log: config.elasticsearch.log_level,
      apiVersion: config.elasticsearch.api_version
    });
    if (!client) {
      return Promise.reject('Search is not available');
    }

    const searchObj = {};
    searchObj.index =
      config.elasticsearch.course_base_index + '_' + viewerLocale;

    const searchObjBody = {};
    const searchObjBodyQueryBool = {};

    const searchObjBodyQueryBoolShouldMultimatch = {
      query: fetchParameters.searchText,
      fields: [
        'title^30',
        'title.exact',
        'headline',
        'text_content',
        'code_content'
      ],
      type: 'most_fields',
      operator: 'or'
    };

    searchObjBodyQueryBool.should = {
      multi_match: searchObjBodyQueryBoolShouldMultimatch
    };

    if (
      fetchParameters.course_id ||
      fetchParameters.unit_id ||
      fetchParameters.section_id
    ) {
      let searchObjBodyQueryBoolFilterArray = [];
      if (fetchParameters.course_id) {
        searchObjBodyQueryBoolFilterArray.push({
          term: {
            course_id: fetchParameters.course_id
          }
        });
      }
      if (fetchParameters.unit_id) {
        searchObjBodyQueryBoolFilterArray.push({
          term: {
            unit_id: fetchParameters.unit_id
          }
        });
      }
      if (fetchParameters.section_id) {
        searchObjBodyQueryBoolFilterArray.push({
          term: {
            section_id: fetchParameters.section_id
          }
        });
      }
      searchObjBodyQueryBool.filter = searchObjBodyQueryBoolFilterArray;
    }

    searchObjBody.query = { bool: searchObjBodyQueryBool };
    searchObjBody.highlight = {
      fields: {
        title: {},
        headline: {},
        text_content: {},
        code_content: {}
      }
    };

    searchObj.body = searchObjBody;

    const skip = aggregateArray.find(item => !!item.$skip);
    if (skip) {
      searchObj.from = skip;
    }
    const limit = aggregateArray.find(item => !!item.$limit);
    if (limit) {
      searchObj.size = limit;
    }

    logger.debug(` searchObj ` + JSON.stringify(searchObj));

    let response = null;
    try {
      response = await client.search(searchObj);
    } catch (err) {
      return Promise.reject(`In Elasticsearch query call ` + err);
    }
    logger.debug(` response ` + JSON.stringify(response));

    if (!response || !response.hits || !response.hits.hits) {
      return [];
    }

    let result = [];
    for (let hit of response.hits.hits) {
      const resultElem = {
        _id: hit._id,
        score: hit._score,
        itemType: hit._source.doc_type,
        title: hit._source.title,
        headline: hit._source.headline
      };
      if (hit._source.course_id) {
        resultElem.course_id = toGlobalId('Course', hit._source.course_id);
      }
      if (hit._source.unit_id) {
        resultElem.unit_id = toGlobalId('CourseUnit', hit._source.unit_id);
      }
      if (hit._source.section_id) {
        resultElem.section_id = toGlobalId(
          'UnitSection',
          hit._source.section_id
        );
      }
      if (hit._source.card_id) {
        resultElem.card_id = toGlobalId('SectionCard', hit._source.card_id);
      }

      if (hit.highlight) {
        const highlightObj = {
          inTitle: [],
          inHeadline: [],
          inText: [],
          inCode: []
        };
        if (hit.highlight.title) {
          for (let highlightLine of hit.highlight.title) {
            highlightObj.inTitle.push(highlightLine);
          }
        }
        if (hit.highlight.headline) {
          for (let highlightLine of hit.highlight.headline) {
            highlightObj.inHeadline.push(highlightLine);
          }
        }
        if (hit.highlight.text_content) {
          for (let highlightLine of hit.highlight.text_content) {
            highlightObj.inText.push(highlightLine);
          }
        }
        if (hit.highlight.code_content) {
          for (let highlightLine of hit.highlight.code_content) {
            highlightObj.inCode.push(highlightLine);
          }
        }
        resultElem.highlights = highlightObj;
      }

      result.push(resultElem);
    }

    logger.debug(` result ` + JSON.stringify(result));

    return result;
  } catch (err) {
    logger.error(`In fetchTextMatchingCourseItems ` + err);
    return Promise.reject('Search failed');
  }
};
