import createBranch from "./createBranch";
import mergeBranch from "./mergeBranch";

const createBranchAndBackport = async ({
  branchNameToCreate,
  branchNameToBackport,
  throwBranchNotExistError,
}) => {
  try {
    const createdResult = await createBranch(branchNameToCreate);
    console.log("create: ", createdResult);

    return await mergeBranch({
      branchNameToMerge: branchNameToBackport,
      targeBranchName: branchNameToCreate,
      throwBranchNotExistError,
    });
  } catch (error) {
    throw error;
  }
};

export default createBranchAndBackport;
