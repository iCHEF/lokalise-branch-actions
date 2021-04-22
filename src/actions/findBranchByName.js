const core = require('@actions/core');
import lokaliseApi from "../lokaliseApi";
import formatBranchName from "../utils/formatBranchName";
const projectId = core.getInput("projectId");

const BRANCH_LISTING_MAX_LIMIT = 5000;

const findBranchByName = async (branchName) => {
  try {
    const formattedBranchName = formatBranchName(branchName);
    const branchList = await lokaliseApi.branches.list({
      project_id: projectId,
      limit: BRANCH_LISTING_MAX_LIMIT,
    });
    const foundBranch = branchList.find(
      (element) => element.name === formattedBranchName
    );
    return foundBranch;
  } catch (error) {
    throw error;
  }
};

export default findBranchByName;
