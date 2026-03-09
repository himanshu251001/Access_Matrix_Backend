import { newEnforcer } from 'casbin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let enforcer = null;

export async function getEnforcer() {
    if (!enforcer) {
        const modelPath = path.join(__dirname, 'rbac_model.conf');
        const policyPath = path.join(__dirname, 'rbac_policy.csv');
        enforcer = await newEnforcer(modelPath, policyPath);
    }
    return enforcer;
}
