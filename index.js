const core = require('@actions/core');
const { LokaliseApi } = require('@lokalise/node-api');

// get inputs which defined in action metadata file
const projectId = core.getInput('projectId');
const apiKey = core.getInput('apiKey');
const actionType = core.getInput('actionType');
const actionPayload = core.getInput('actionPayload');

console.log('projectId: ', projectId);
console.log('actionType: ', actionType);
console.log('actionPayload: ', actionPayload);

const main = async () => {
  // init API instance
  const lokaliseApi = new LokaliseApi({ apiKey: apiKey });

  const create = async (branchName) => {
    return await lokaliseApi.branches.create({ name: branchName }, { project_id: projectId });
  };

  const findByName = async (branchName) => {
    const branchList = await lokaliseApi.branches.list({ project_id: projectId });
    const foundBranch = branchList.find((element) => element.name === branchName);
    console.log(JSON.stringify(foundBranch));
    return foundBranch;
  };

  const merge = async ({
    branchNameToMerge,
    targeBranchName,
    throwBranchNotExistError = false,
  }) => {
    const headBranch = await findByName(branchNameToMerge);
    const baseBranch = await findByName(targeBranchName);

    if (throwBranchNotExistError) {
      if (!headBranch) {
        throw new Error(`Merge failed: The head branch ${branchNameToMerge} is not exist.`);
      }

      if (!baseBranch) {
        throw new Error(`Merge failed: The base branch ${targeBranchName} is not exist.`);
      }
    }

    return await lokaliseApi.branches.merge(
      headBranch.branch_id,
      { project_id: projectId },
      { target_branch_id: baseBranch.branch_id }
    );
  };

  const createAndBackport = async ({ branchNameToCreate, branchNameToBackport, throwBranchNotExistError }) => {
    await create(branchNameToCreate);

    return await merge({
      branchNameToMerge: branchNameToBackport,
      targeBranchName: branchNameToCreate,
      throwBranchNotExistError,
    });
  };

  switch (actionType) {
    case 'findByName':
      const foundBranch = await findByName(actionPayload);
      core.setOutput('findByNameResult', foundBranch);
      break;

    case 'create':
      const createdResult = await create(actionPayload);
      core.setOutput('createResult', createdResult);
      break;

    case 'merge':
      const mergedResult = await merge(actionPayload);
      core.setOutput('mergeResult', mergedResult);
      break;

    case 'createAndBackport':
      const createAndBackportResult = await createAndBackport(actionPayload);
      core.setOutput('createAndBackportResult', createAndBackportResult);
      break;
  }

  // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`The event payload: ${payload}`)
};

try {
  main();
} catch (error) {
  core.setFailed(error.message);
}
