import core from "@actions/core";
import lokaliseApi from "../lokaliseApi";
import formatBranchName from "../utils/formatBranchName";
const projectId = core.getInput("projectId");

const createBranch = async (branchName) => {
  const formattedBranchName = formatBranchName(branchName);
  return await lokaliseApi.branches.create(
    { name: formattedBranchName },
    { project_id: projectId }
  );
};

export default createBranch;
