import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUBSCRIPTION_KEY = '74fb35b70cd1452cb50dd895760149c7'; // Primary Key provided by user
const BASE_URL = 'https://sandbox.momodeveloper.mtn.com';

async function setupMomo() {
    console.log("🚀 Starting MTN MoMo Sandbox Provisioning...");

    // 1. Generate a new UUID for the API User
    const apiUserUuid = uuidv4();
    console.log(`generated UUID: ${apiUserUuid}`);

    try {
        // 2. Create API User
        console.log("Creating API User...");
        await axios.post(
            `${BASE_URL}/v1_0/apiuser`,
            { providerCallbackHost: 'webhook.site' }, // Callback host is required but not strictly validated in sandbox creation
            {
                headers: {
                    'X-Reference-Id': apiUserUuid,
                    'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("✅ API User Created.");

        // 3. Create API Key
        console.log("Generating API Key...");
        const apiKeyResponse = await axios.post(
            `${BASE_URL}/v1_0/apiuser/${apiUserUuid}/apikey`,
            {},
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
                },
            }
        );

        const apiKey = apiKeyResponse.data.apiKey;
        console.log("✅ API Key Generated.");

        // 4. Output results
        const envContent = `
MOMO_API_URL=https://sandbox.momodeveloper.mtn.com
MOMO_SUBSCRIPTION_KEY=${SUBSCRIPTION_KEY}
MOMO_API_USER=${apiUserUuid}
MOMO_API_KEY=${apiKey}
MOMO_ENV=sandbox
MOMO_CALLBACK_URL=http://localhost:5000/api/payments/webhook/momo
`;

        console.log("\nCopy the following into your .env file:");
        console.log("----------------------------------------");
        console.log(envContent);
        console.log("----------------------------------------");

        // Optionally append to .env if it exists
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            fs.appendFileSync(envPath, `\n# MTN MoMo Credentials${envContent}`);
            console.log(`\n✅ Appended credentials to ${envPath}`);
        } else {
            fs.writeFileSync(envPath, envContent);
            console.log(`\n✅ Created .env file with credentials`);
        }

    } catch (error) {
        console.error("❌ Error provisioning MoMo User:", error.response?.data || error.message);
    }
}

setupMomo();
