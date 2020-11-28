const core = require('@actions/core');
const { LokaliseApi } = require('@lokalise/node-api');

const apiKey = core.getInput('apiKey');
const lokaliseApi = new LokaliseApi({ apiKey: apiKey });

export default lokaliseApi;