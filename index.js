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

    const create = (branchName) =>
        lokaliseApi.branches.create({ name: branchName }, { project_id: projectId });

    const merge = ({ branchIdToMerge, targetBranchId }) =>
        lokaliseApi.branches.merge(
            branchIdToMerge,
            { project_id: projectId },
            { target_branch_id: targetBranchId }
        );

    const findByName = async (branchName) => {
        const branchList = await lokaliseApi.branches.list({ project_id: projectId });
        console.log(JSON.stringify(branchList));
        return branchList.find((element) => element.name === branchName);
    };

    switch (actionType) {
        case 'findByName':
            core.setOutput('findByNameResult', findByName(actionPayload));
            break;

        case 'create':
            core.setOutput('createResult', create(actionPayload));
            break;

        case 'merge':
            core.setOutput('mergeResult', merge(actionPayload));
            break;

        case 'createAndBackport':
            const { branchNameToCreate, branchNameToBackport } = actionPayload;
            const branchToBackport = getByName(branchNameToBackport);
            const branchToCreate = create(branchNameToCreate);
            core.setOutput(
                'createAndBackportResult',
                merge({
                    branchIdToMerge: branchToBackport.id,
                    targetBranchId: branchToCreate.id,
                })
            );
            break;
    }

    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`)
} catch (error) {
    core.setFailed(error.message);
}
