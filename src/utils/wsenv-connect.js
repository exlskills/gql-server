import config from '../config';
import Axios from 'axios';
import { logger } from '../utils/logger';
import { removeStringFromText } from '../utils/string-utils';

const wsenvApiClient = (() => {
  logger.debug(`In getApiClient`);
  return Axios.create();
})();

export const getWsenvGradingClient = async () => {
  logger.debug(`In getWsenvGradingClient`);
  try {
    const wsenvConnection = await wsenvApiClient.get(
      config.wsenv_signalling_url
    );
    logger.debug(`wsenv con ` + wsenvConnection.data.grading_endpoint);
    const wsenvGradingClient = Axios.create({
      baseURL: wsenvConnection.data.grading_endpoint
    });
    return wsenvConnection.data.grading_endpoint;
  } catch (err) {
    return Promise.reject(new Error(err));
  }
};

export const callWsenvGrading = async (endpointUrl, jsonBody) => {
  logger.debug(`In callWsenvGrading`);
  try {
    logger.debug(`load ` + JSON.stringify(jsonBody));
    const gradingResponse = await Axios.post(endpointUrl, jsonBody);
    logger.debug(`resp ` + JSON.stringify(gradingResponse.data));
    return gradingResponse.data;
  } catch (err) {
    logger.debug(err.response);
    return Promise.reject(new Error(err));
  }
};

export const editGradingResponse = msg => {
  logger.debug(`in editGradingResponse `);
  // logger.debug(`msg ` + JSON.stringify(msg));
  let response = '';
  if (msg.junit) {
    response = removeStringFromText(
      `WARNING: Your kernel does not support swap limit capabilities or the cgroup is not mounted. Memory limited without swap.`,
      JSON.stringify(msg.junit.output)
    );
  }
  // logger.debug(`resp ` + response);
  return response;
};
