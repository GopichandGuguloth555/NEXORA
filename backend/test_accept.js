const axios = require('axios');

async function run() {
  const api = axios.create({ baseURL: 'http://localhost:5000/api' });

  // 1. Register Bob
  const bobEmail = `bob${Date.now()}@example.com`;
  await api.post('/auth/register', { name: 'Bob', email: bobEmail, password: 'password123' });
  const bobLogin = await api.post('/auth/login', { email: bobEmail, password: 'password123' });
  const bobToken = bobLogin.data.data.token;

  // 2. Register Alice
  const aliceEmail = `alice${Date.now()}@example.com`;
  await api.post('/auth/register', { name: 'Alice', email: aliceEmail, password: 'password123' });
  const aliceLogin = await api.post('/auth/login', { email: aliceEmail, password: 'password123' });
  const aliceToken = aliceLogin.data.data.token;

  // 3. Bob creates workspace
  const workspaceRes = await api.post('/workspaces', { name: 'Bob Workspace' }, { headers: { Authorization: `Bearer ${bobToken}` } });
  const workspaceId = workspaceRes.data.data.id;
  console.log("Workspace ID:", workspaceId);

  // 4. Bob invites Alice
  const inviteRes = await api.post(`/workspaces/${workspaceId}/members`, { email: aliceEmail }, { headers: { Authorization: `Bearer ${bobToken}` } });
  const invitationId = inviteRes.data.data.id;
  console.log("Invitation ID:", invitationId);

  // 5. Alice accepts
  try {
    const acceptRes = await api.post(`/workspaces/invitations/${invitationId}/accept`, {}, { headers: { Authorization: `Bearer ${aliceToken}` } });
    console.log("Accept Success:", acceptRes.data);
  } catch (err) {
    console.error("Accept Error:", err.response ? err.response.data : err.message);
  }

  // 6. Check pending for Bob
  const pendingRes = await api.get(`/workspaces/${workspaceId}/invitations`, { headers: { Authorization: `Bearer ${bobToken}` } });
  console.log("Pending Invitations:", pendingRes.data.data);
}

run().catch(console.error);
