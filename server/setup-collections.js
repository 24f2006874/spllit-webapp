require('dotenv').config();
const axios = require('axios');

const PB_URL = process.env.PB_URL || 'http://localhost:8090';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'maruticodelab@gmail.com';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || '8F3YVT4Xg8Yh5sW';

const collections = [
  {
    name: 'rides',
    fields: [
      { name: 'pickup', type: 'text', required: true },
      { name: 'dropoff', type: 'text', required: true },
      { name: 'dateTime', type: 'text', required: true },
      { name: 'seats', type: 'number', required: true },
      { name: 'notes', type: 'text' },
      { name: 'status', type: 'text', required: true },
      { name: 'createdBy', type: 'text', required: true },
      { name: 'createdByEmail', type: 'text' },
      { name: 'driverName', type: 'text', required: true },
      { name: 'createdAt', type: 'text', required: true },
    ]
  },
  {
    name: 'rideRequests',
    fields: [
      { name: 'rideId', type: 'text', required: true },
      { name: 'driverId', type: 'text', required: true },
      { name: 'driverName', type: 'text', required: true },
      { name: 'sharerEmail', type: 'text' },
      { name: 'passengerId', type: 'text', required: true },
      { name: 'passengerName', type: 'text', required: true },
      { name: 'passengerEmail', type: 'text' },
      { name: 'pickup', type: 'text', required: true },
      { name: 'dropoff', type: 'text', required: true },
      { name: 'dateTime', type: 'text', required: true },
      { name: 'status', type: 'text', required: true },
      { name: 'createdAt', type: 'text', required: true },
    ]
  },
  {
    name: 'messages',
    fields: [
      { name: 'request_id', type: 'text', required: true },
      { name: 'sender_id', type: 'text', required: true },
      { name: 'sender_name', type: 'text', required: true },
      { name: 'sender_email', type: 'text' },
      { name: 'message', type: 'text', required: true },
      { name: 'timestamp', type: 'text', required: true },
    ]
  }
];

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

async function getCollectionWithAuthFallback(name, headersList) {
  for (const headers of headersList) {
    try {
      const response = await axios.get(`${PB_URL}/api/collections/${name}`, { headers });
      return { response, headers };
    } catch (err) {
      if (err.response?.status === 404) {
        return { response: null, headers };
      }
    }
  }

  return { response: null, headers: headersList[0] };
}

function hasAllFields(collectionData, fields) {
  const existingFields = new Set((collectionData?.fields || []).map((field) => field.name));
  return fields.every((field) => existingFields.has(field.name));
}

async function ensureCollection(collection, headersList) {
  const checked = await getCollectionWithAuthFallback(collection.name, headersList);

  if (!checked.response) {
    await axios.post(`${PB_URL}/api/collections`, {
      name: collection.name,
      type: 'base',
      fields: collection.fields,
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: ''
    }, { headers: checked.headers });
    return 'created';
  }

  if (!hasAllFields(checked.response.data, collection.fields)) {
    await axios.patch(`${PB_URL}/api/collections/${collection.name}`, {
      fields: collection.fields,
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: ''
    }, { headers: checked.headers });
    return 'repaired';
  }

  return 'exists';
}

async function setupCollections() {
  console.log('🚀 Setting up PocketBase Collections...\n');
  console.log('PocketBase URL:', PB_URL);
  console.log('');

  const auth = await authenticateAdmin();
  if (!auth) {
    console.log('❌ Failed to authenticate admin on known endpoints.');
    console.log('   Verify PocketBase admin credentials and try again.');
    process.exit(1);
  }
  console.log(`🔐 Authenticated via: ${auth.path}`);
  console.log('');

  for (const collection of collections) {
    console.log(`Ensuring "${collection.name}" collection...`);
    try {
      const status = await ensureCollection(collection, auth.headersList);
      if (status === 'created') {
        console.log(`   ✅ Created "${collection.name}"`);
      } else if (status === 'repaired') {
        console.log(`   ✅ Repaired "${collection.name}" schema`);
      } else {
        console.log(`   ℹ️  Collection "${collection.name}" already valid`);
      }
    } catch (err) {
      console.log(`   ❌ Error:`, err.response?.data?.message || err.message);
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════');
  console.log('✅ Setup Complete!');
  console.log('═══════════════════════════════════════\n');
  
  console.log('Collections created:');
  collections.forEach(c => console.log(`   - ${c.name}`));
  
  console.log('\n💡 Test API:');
  console.log(`   curl ${PB_URL}/api/collections/rides/records`);
}

setupCollections().catch(console.error);
