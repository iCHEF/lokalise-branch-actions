import core from '@actions/core';
import { LokaliseApi } from '@lokalise/node-api';

const apiKey = core.getInput('apiKey');
const lokaliseApi = new LokaliseApi({ apiKey: apiKey });

export default lokaliseApi;