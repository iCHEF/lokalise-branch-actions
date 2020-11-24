const core = require('@actions/core');
const { LokaliseApi } = require('@lokalise/node-api');

// get inputs which defined in action metadata file
const projectId = core.getInput('projectId');
const apiKey = core.getInput('apiKey');
const actionType = core.getInput('actionType');
const actionPayload = JSON.parse(core.getInput('actionPayload'));

console.log('projectId: ', projectId);
console.log('actionType: ', actionType);
console.log('actionPayload: ', actionPayload);

const formatBranchName = (name) => name.replace(/\./g, '_');

const main = async () => {
  // init API instance
  const lokaliseApi = new LokaliseApi({ apiKey: apiKey });

  const create = async (branchName) => {
    const formattedBranchName = formatBranchName(branchName);
    return await lokaliseApi.branches.create(
      { name: formattedBranchName },
      { project_id: projectId }
    );
  };

  const findByName = async (branchName) => {
    const formattedBranchName = formatBranchName(branchName);
    const branchList = await lokaliseApi.branches.list({ project_id: projectId });
    const foundBranch = branchList.find((element) => element.name === formattedBranchName);
    return foundBranch;
  };

  const merge = async ({
    branchNameToMerge,
    targeBranchName,
    throwBranchNotExistError = false,
  }) => {
    let headBranch, baseBranch;
    try {
      headBranch = await findByName(formatBranchName(branchNameToMerge));
      console.log('headBranch: ', headBranch);
      baseBranch = await findByName(formatBranchName(targeBranchName));
      console.log('baseBranch: ', baseBranch);

      if (!headBranch || !baseBranch) {
        if (!headBranch) {
          const errorMessage = `Merge failed: The head branch ${branchNameToMerge} is not exist.`;

          console.log(errorMessage);
          if (throwBranchNotExistError) {
            throw new Error(errorMessage);
          }
        }

        if (!baseBranch) {
          const errorMessage = `Merge failed: The head branch ${branchNameToMerge} is not exist.`;

          console.log(errorMessage);
          if (throwBranchNotExistError) {
            throw new Error(errorMessage);
          }
        }

        return null;
      }
      console.log('before merge');
      const result = await lokaliseApi.branches.merge(
        headBranch.branch_id,
        { project_id: projectId },
        { target_branch_id: baseBranch.branch_id }
      );
      console.log('result: ', result);

      return result;
    } catch (error) {
      console.log('Merge error: ', error);
      const pullRequestUrl = `https://app.lokalise.com/merge/${projectId}/${headBranch.branch_id}/${baseBranch.branch_id}`;
      console.log('Pull request url: ', pullRequestUrl);
      core.setOutput(
        'error',
        JSON.stringify({
          error,
          data: {
            pullRequestUrl,
          },
        })
      );
      core.setFailed(error.message);
    }
  };

  const createAndBackport = async ({
    branchNameToCreate,
    branchNameToBackport,
    throwBranchNotExistError,
  }) => {
    await create(branchNameToCreate);

    return await merge({
      branchNameToMerge: branchNameToBackport,
      targeBranchName: branchNameToCreate,
      throwBranchNotExistError,
    });
  };

  let result;

  switch (actionType) {
    case 'findByName':
      const foundBranchResult = await findByName(actionPayload);
      result = foundBranchResult;
      break;

    case 'create':
      const createdResult = await create(actionPayload);
      result = createdResult;
      break;

    case 'merge':
      const mergedResult = await merge(actionPayload);
      result = mergedResult;
      break;

    case 'createAndBackport':
      const createAndBackportResult = await createAndBackport(actionPayload);
      result = createAndBackportResult;
      break;
  }

  console.log('result: ', result);
  core.setOutput('result', JSON.stringify(result));
  // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2)
  // console.log(`The event payload: ${payload}`)
};

try {
  main();
} catch (error) {
  console.log('error: ', error.message);
  core.setFailed(error.message);
}
