import config from '../content/publishing.json' with {type:'json'};
export function shouldPublish(event, branch, manual, automatic) {
  return branch==='refs/heads/main' && ((event==='push' && automatic===true) || (event==='workflow_dispatch' && manual==='true'));
}
console.log(`publish=${shouldPublish(process.env.EVENT,process.env.BRANCH,process.env.MANUAL_PUBLISH,config.autoPublish)}`);
