const core = require('@actions/core');
const { LokaliseApi } = require('@lokalise/node-api');

try {
    // get inputs which defined in action metadata file
    const projectId = core.getInput('projectId');
    console.log('projectId: ', projectId);
    const apiKey = core.getInput('apiKey');
    const actionType = core.getInput('actionType');
    console.log('actionType: ', actionType);
    const actionPayload = core.getInput('actionPayload');
    console.log('actionPayload: ', actionPayload);

    // init API instance
    const lokaliseApi = new LokaliseApi({ apiKey: apiKey });

    const create = async (branchName) =>
        await lokaliseApi.branches.create({ name: branchName }, { project_id: projectId });

    const merge = async ({ branchIdToMerge, targetBranchId }) =>
        await lokaliseApi.branches.merge(
            branchIdToMerge,
            { project_id: projectId },
            { target_branch_id: targetBranchId }
        );

    const findByName = async (branchName) => {
        const branchList = await lokaliseApi.branches.list({ project_id: projectId });
        const foundBranch = branchList.find((element) => element.name === branchName);
        console.log(JSON.stringify(foundBranch));
        return foundBranch;
    };

    (async () => {
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
                const { branchNameToCreate, branchNameToBackport } = actionPayload;
                const branchToBackport = await findByName(branchNameToBackport);
                const branchToCreate = await create(branchNameToCreate);
                const createAndBackportResult = merge({
                    branchIdToMerge: branchToBackport.branch_id,
                    targetBranchId: branchToCreate.branch_id,
                });
                core.setOutput('createAndBackportResult', createAndBackportResult);
                break;
        }
    })();

    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`)
} catch (error) {
    core.setFailed(error.message);
}
