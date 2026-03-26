require('dotenv').config();
const axios = require('axios');

const PB_URL = process.env.PB_URL || 'http://localhost:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'maruticodelab@gmail.com';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || '8F3YVT4Xg8Yh5sW';

async function authenticateAdmin() {
  const payload = {
    identity: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
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
          path,
          headersList: [
            { Authorization: `Bearer ${token}` },
            { Authorization: `Admin ${token}` }
          ]
        };
      }
    } catch (err) {
      if (err.response?.status === 404) continue;
    }
  }

  return null;
}

async function getCollectionWithAuthFallback(collectionName, headersList) {
  for (const headers of headersList) {
    try {
      const response = await axios.get(`${PB_URL}/api/collections/${collectionName}`, { headers });
      return { response, headers };
    } catch (err) {
      if (err.response?.status === 404) {
        return { response: null, headers };
      }
    }
  }

  return { response: null, headers: headersList[0] };
}

async function setCollectionRules() {
  console.log('🔧 Setting collection rules for public access...\n');

  try {
    console.log('1. Authenticating as admin...');
    const auth = await authenticateAdmin();
    if (!auth) {
      console.error('❌ Authentication failed on known endpoints.');
      process.exit(1);
    }
    console.log(`   ✅ Authenticated successfully via ${auth.path}\n`);

    const collections = ['rides', 'rideRequests', 'messages'];

    for (const collectionName of collections) {
      console.log(`2. Setting rules for "${collectionName}" collection...`);
      try {
        const checked = await getCollectionWithAuthFallback(collectionName, auth.headersList);
        if (!checked.response) {
          console.log(`   ⚠️  Collection "${collectionName}" not found. Please create it first.`);
          console.log('');
          continue;
        }

        const updateData = {
          listRule: '',
          viewRule: '',
          createRule: '',
          updateRule: '',
          deleteRule: ''
        };

        await axios.patch(`${PB_URL}/api/collections/${collectionName}`, updateData, {
          headers: checked.headers
        });
        console.log(`   ✅ Rules set to empty for "${collectionName}"`);
      } catch (err) {
        console.log(`   ❌ Error setting rules for "${collectionName}":`, err.response?.data?.message || err.message);
      }
      console.log('');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ Collection rules updated successfully!');
    console.log('═══════════════════════════════════════\n');
    console.log('📋 Admin UI: http://127.0.0.1:8090/_/');
    console.log('📧 Email: ', ADMIN_EMAIL);
    console.log('🔑 Password: [hidden]');
    console.log('\n💬 You can now test the app. Messages will be stored in PocketBase.');
    console.log('   Test API:');
    console.log('   GET http://127.0.0.1:8090/api/collections/messages/records\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setCollectionRules();
