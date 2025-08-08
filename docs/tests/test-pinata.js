const axios = require('axios');

const PINATA_API_KEY = '23b2775fd2b791070aa2';
const PINATA_SECRET_API_KEY = '15d3b3dd69de50713ae749afcdb961459be9290a2d0ebf7815deea4d5fa0ba69';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlYmQ4OTYxNy0wNmQ4LTQ1ZDMtYTgwMS04YWRkMDk0OTM4ZDEiLCJlbWFpbCI6Imtldmlua3VvQGhvdG1haWwuY29tLmFyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIzYjI3NzVmZDJiNzkxMDcwYWEyIiwic2NvcGVkS2V5U2VjcmV0IjoiMTVkM2IzZGQ2OWRlNTA3MTNhZTc0OWFmY2RiOTYxNDU5YmU5MjkwYTJkMGViZjc4MTVkZWVhNGQ1ZmEwYmE2OSIsImV4cCI6MTc4NTg2NjY1MH0.4HFKflkM4GigAatqpJGG_opu67l-WYJNk4Wy-0fIrbY';

const PINATA_BASE_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://jade-payable-nightingale-723.mypinata.cloud';

async function testPinataConnection() {
  console.log('🔍 Testing Pinata connection...');
  
  try {
    const response = await axios.get(
      `${PINATA_BASE_URL}/data/testAuthentication`,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Pinata connection successful!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Pinata connection failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

async function testJSONUpload() {
  console.log('\n🔍 Testing JSON upload to Pinata...');
  
  const testData = {
    message: 'Test JSON upload to Pinata',
    timestamp: new Date().toISOString(),
    type: 'test',
    data: {
      platform: 'Nucleo - Denuncias Anónimas',
      version: '1.0'
    }
  };
  
  try {
    const response = await axios.post(
      `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
      testData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ JSON upload successful!');
    console.log('CID:', response.data.IpfsHash);
    console.log('Gateway URL:', `${PINATA_GATEWAY}/ipfs/${response.data.IpfsHash}`);
    
    // Test accessing the content
    await testContentAccess(response.data.IpfsHash);
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('❌ JSON upload failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

async function testContentAccess(cid) {
  console.log(`\n🔍 Testing content access for CID: ${cid}`);
  
  const gateways = [
    `${PINATA_GATEWAY}/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`
  ];
  
  for (const gateway of gateways) {
    try {
      console.log(`Trying: ${gateway}`);
      const response = await axios.get(gateway, { timeout: 10000 });
      console.log('✅ Content accessible!');
      console.log('Content:', JSON.stringify(response.data, null, 2));
      return true;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('❌ Content not accessible from any gateway');
  return false;
}

async function main() {
  console.log('🚀 Starting Pinata tests...\n');
  
  // Test 1: Connection
  const connectionOk = await testPinataConnection();
  
  if (connectionOk) {
    // Test 2: JSON Upload
    const cid = await testJSONUpload();
    
    if (cid) {
      console.log('\n✅ All tests passed!');
      console.log(`Your content is available at: ${PINATA_GATEWAY}/ipfs/${cid}`);
    } else {
      console.log('\n⚠️ Connection OK but upload failed');
    }
  } else {
    console.log('\n❌ Connection failed - check your credentials');
  }
}

main().catch(console.error);