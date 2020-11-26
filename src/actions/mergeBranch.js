const core = require('@actions/core');
import lokaliseApi from '../lokaliseApi';
import findBranchByName from './findBranchByName';

const projectId = core.getInput('projectId');

const mergeBranch = async ({
  branchNameToMerge,
  targeBranchName,
  throwBranchNotExistError = false,
}) => {
  let headBranch, baseBranch;

  try {
    headBranch = await findBranchByName(branchNameToMerge);
    baseBranch = await findBranchByName(targeBranchName);

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
    return await lokaliseApi.branches.merge(
      headBranch.branch_id,
      { project_id: projectId },
      { target_branch_id: baseBranch.branch_id }
    );
  } catch (error) {
    const pullRequestUrl = `https://app.lokalise.com/merge/${projectId}/${headBranch.branch_id}/${baseBranch.branch_id}`;

    console.log('Merge error: ', error);
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

    throw error;
  }
};

export default mergeBranch;
