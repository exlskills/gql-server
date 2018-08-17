import config from '../config';
import Axios from 'axios';

export const wsenvApiClient = (() => {
  console.log(`In getApiClient`);
  return Axios.create();
})();

export const getWsenvGradingClient = async () => {
  console.log(`In getWsenvGradingClient`);
  try {
    const wsenvConnection = await wsenvApiClient.get(
      config.wsenv_signalling_url
    );
    console.log(`wsenv con ` + wsenvConnection.data.grading_endpoint);
    const wsenvGradingClient = Axios.create({
      baseURL: wsenvConnection.data.grading_endpoint
    });
    return wsenvConnection.data.grading_endpoint;
  } catch (err) {
    return Promise.reject(new Error(err));
  }
};

export const callWsenvGrading = async (endpointUrl, jsonBody) => {
  console.log(`In callWsenvGrading`);
  try {
    console.log(`load ` + JSON.stringify(jsonBody));
    const gradingResponse = await Axios.post(endpointUrl, jsonBody);
    console.log(`resp ` + JSON.stringify(gradingResponse.data));
    return gradingResponse;
  } catch (err) {
    console.log(err.response);
    return Promise.reject(new Error(err));
  }
};
