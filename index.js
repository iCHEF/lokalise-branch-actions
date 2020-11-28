import core from '@actions/core';
import lokaliseApi from './src/lokaliseApi';
import {
  createBranch,
  findBranchByName,
  mergeBranch,
  createBranchAndBackport,
} from './src/actions';

// get inputs which defined in action metadata file
const projectId = core.getInput('projectId');
const apiKey = core.getInput('apiKey');
const actionType = core.getInput('actionType');
const actionPayload = JSON.parse(core.getInput('actionPayload'));

console.log('projectId: ', projectId);
console.log('actionType: ', actionType);
console.log('actionPayload: ', actionPayload);

const setProjectNameToOutputs = async () => {
  const project = await lokaliseApi.projects.get(projectId);
  console.log('project: ', project);
  core.setOutput('projectName', project.name);
};

const actionTypeHandler = async () => {
  try {
    let result;

    switch (actionType) {
      case 'findByName':
        const foundBranchResult = await findBranchByName(actionPayload.branchNameToFind);
        result = foundBranchResult;
        break;

      case 'create':
        const createdResult = await createBranch(actionPayload.branchNameToCreate);
        result = createdResult;
        break;

      case 'merge':
        const mergedResult = await mergeBranch(actionPayload);
        result = mergedResult;
        break;

      case 'createAndBackport':
        const createAndBackportResult = await createBranchAndBackport(actionPayload);
        result = createAndBackportResult;
        break;
    }

    console.log('result: ', result);
    core.setOutput('result', JSON.stringify(result));
  } catch (error) {
    console.log('error: ', error.message);
    core.setFailed(error.message);
  }
};

const main = async () => {
  await setProjectNameToOutputs();
  await actionTypeHandler();
};

main();
