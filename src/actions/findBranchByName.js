import lokaliseApi from '../lokaliseApi';
import formatBranchName from '../utils/formatBranchName';

const findBranchByName = async (branchName) => {
  try {
    const formattedBranchName = formatBranchName(branchName);
    const branchList = await lokaliseApi.branches.list({ project_id: projectId });
    const foundBranch = branchList.find((element) => element.name === formattedBranchName);
    return foundBranch;
  } catch (error) {
    throw error;
  }
};

export default findBranchByName;