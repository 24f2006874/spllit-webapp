require('dotenv').config();
const axios = require('axios');

const PB_URL = process.env.PB_URL || 'http://localhost:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'maruticodelab@gmail.com';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || '8F3YVT4Xg8Yh5sW';
const MESSAGE_FIELDS = [
  { name: 'request_id', type: 'text', required: true },
  { name: 'sender_id', type: 'text', required: true },
  { name: 'sender_name', type: 'text', required: true },
  { name: 'sender_email', type: 'text', required: false },
  { name: 'message', type: 'text', required: true },
  { name: 'timestamp', type: 'text', required: true }
];

async function tryCreateAdmin() {
  const payload = {
    email: PB_ADMIN_EMAIL,
    password: PB_ADMIN_PASSWORD,
    passwordConfirm: PB_ADMIN_PASSWORD
  };

  const createPaths = [
    '/api/collections/_superusers/records',
    '/api/superusers',
    '/api/admins'
  ];

  for (const path of createPaths) {
    try {
      await axios.post(`${PB_URL}${path}`, payload);
      return { success: true, message: `Created admin via ${path}` };
    } catch (err) {
      const status = err.response?.status;
      if (status === 400 || status === 409) {
        return { success: true, message: `Admin already exists (${path})` };
      }
      if (status === 404) {
        continue;
      }
    }
  }

  return { success: false, message: 'No compatible admin creation endpoint found' };
}

async function tryAuthAdmin() {
  const payload = {
    identity: PB_ADMIN_EMAIL,
    password: PB_ADMIN_PASSWORD
  };

  const authPaths = [
    '/api/collections/_superusers/auth-with-password',
    '/api/superusers/auth-with-password',
    '/api/admins/auth-with-password'
  ];

  for (const path of authPaths) {
    try {
      const response = await axios.post(`${PB_URL}${path}`, payload);
      const token = response.data?.token;
      if (token) {
        return {
          token,
          authPath: path,
          headers: [{ Authorization: `Bearer ${token}` }, { Authorization: `Admin ${token}` }]
        };
      }
    } catch (err) {
      if (err.response?.status === 404) continue;
    }
  }

  return null;
}

async function getCollectionWithFallbackAuth(collectionName, authHeadersList) {
  for (const headers of authHeadersList) {
    try {
      const response = await axios.get(`${PB_URL}/api/collections/${collectionName}`, { headers });
      return { response, headers };
    } catch (err) {
      if (err.response?.status === 404) {
        return { response: null, headers };
      }
    }
  }

  return { response: null, headers: authHeadersList[0] };
}

function hasAllMessageFields(collectionData) {
  const existingFields = new Set((collectionData?.fields || []).map((field) => field.name));
  return MESSAGE_FIELDS.every((field) => existingFields.has(field.name));
}

async function setupPocketBase() {
  console.log('🚀 Setting up PocketBase for SPLLIT Chat...\n');
  console.log('📌 PocketBase Version: 0.23+\n');

  try {
    console.log('1. Checking PocketBase health...');
    try {
      const health = await axios.get(`${PB_URL}/api/health`);
      console.log('   ✅ PocketBase is running');
      console.log('   Version:', health.data?.version || '0.23+');
      console.log('');
    } catch {
      console.log('   ❌ PocketBase is not running!');
      console.log('   Please start PocketBase first:');
      console.log('   cd pocketbase_* && ./pocketbase.exe serve --http=127.0.0.1:8090\n');
      process.exit(1);
    }

    console.log('2. Creating superuser/admin account (if needed)...');
    const createAdminResult = await tryCreateAdmin();
    if (createAdminResult.success) {
      console.log(`   ✅ ${createAdminResult.message}\n`);
    } else {
      console.log(`   ⚠️ ${createAdminResult.message}`);
      console.log('   (This may be OK if your admin already exists with different credentials)\n');
    }

    console.log('3. Authenticating as admin...');
    const authResult = await tryAuthAdmin();
    if (!authResult) {
      console.log('   ⚠️ Authentication failed on all known endpoints.');
      console.log('   Open PocketBase UI and verify admin credentials, then rerun setup.\n');
    } else {
      console.log(`   ✅ Authenticated via ${authResult.authPath}\n`);

      console.log('4. Checking if messages collection exists...');
      const check = await getCollectionWithFallbackAuth('messages', authResult.headers);
      if (check.response) {
        if (hasAllMessageFields(check.response.data)) {
          console.log('   ✅ Messages collection already exists\n');
        } else {
          console.log('   ⚠️ Messages collection exists but schema is incomplete. Repairing...');
          try {
            await axios.patch(`${PB_URL}/api/collections/messages`, {
              fields: MESSAGE_FIELDS,
              listRule: '',
              viewRule: '',
              createRule: '',
              updateRule: '',
              deleteRule: ''
            }, { headers: check.headers });
            console.log('   ✅ Messages collection repaired successfully!\n');
          } catch (err) {
            console.log('   ⚠️ Could not repair collection:', err.response?.data?.message || err.message, '\n');
          }
        }
      } else {
        console.log('   📝 Collection does not exist, creating...');

        try {
          await axios.post(`${PB_URL}/api/collections`, {
            name: 'messages',
            type: 'base',
            fields: MESSAGE_FIELDS,
            listRule: '',
            viewRule: '',
            createRule: '',
            updateRule: '',
            deleteRule: ''
          }, { headers: check.headers });

          console.log('   ✅ Messages collection created successfully!\n');
        } catch (err) {
          console.log('   ⚠️ Could not create collection:', err.response?.data?.message || err.message, '\n');
        }
      }

      try {
        const legacyCheck = await getCollectionWithFallbackAuth('massages', authResult.headers);
        if (legacyCheck.response) {
          console.log('   ⚠️ Found legacy "massages" collection (typo).');
          console.log('   Keep it for old data, but use "messages" for all new records.\n');
        }
      } catch {
        // Ignore legacy collection check failures.
      }
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ PocketBase Setup Complete!');
    console.log('═══════════════════════════════════════\n');
    console.log('📋 Admin UI: http://127.0.0.1:8090/_/');
    console.log(`📧 Email: ${PB_ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${PB_ADMIN_PASSWORD}`);
    console.log('\n💬 API Endpoint: http://127.0.0.1:8090/api/collections/messages/records\n');
    console.log('🔗 To test:');
    console.log('   GET http://127.0.0.1:8090/api/collections/messages/records\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupPocketBase();
