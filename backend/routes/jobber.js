const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CLIENT_ID     = process.env.JOBBER_CLIENT_ID;
const CLIENT_SECRET = process.env.JOBBER_CLIENT_SECRET;
const REDIRECT_URI  = process.env.JOBBER_REDIRECT_URI ||
  'https://hvac-maintenance-app-production.up.railway.app/api/jobber/callback';
const FRONTEND_URL  = process.env.FRONTEND_URL || 'https://app.deancallanpm.com';

const JOBBER_AUTH_URL  = 'https://api.getjobber.com/api/oauth/authorize';
const JOBBER_TOKEN_URL = 'https://api.getjobber.com/api/oauth/token';
const JOBBER_GQL_URL   = 'https://api.getjobber.com/api/graphql';
const JOBBER_API_VER   = '2024-09-26';

// ── Token helpers ────────────────────────────────────────────────────────────

async function getStoredToken() {
  return prisma.jobberToken.findFirst({ orderBy: { id: 'desc' } });
}

async function saveToken({ accessToken, refreshToken, expiresIn }) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  const existing = await getStoredToken();
  if (existing) {
    return prisma.jobberToken.update({
      where: { id: existing.id },
      data: { accessToken, refreshToken, expiresAt },
    });
  }
  return prisma.jobberToken.create({
    data: { accessToken, refreshToken, expiresAt },
  });
}

async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
  });
  const res = await fetch(JOBBER_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  return res.json();
}

// Returns a valid access token, refreshing if needed
async function getValidAccessToken() {
  const token = await getStoredToken();
  if (!token) throw new Error('Jobber not connected');

  const bufferMs = 5 * 60 * 1000; // refresh 5 min before expiry
  if (token.expiresAt.getTime() - bufferMs > Date.now()) {
    return token.accessToken;
  }

  // Refresh
  const refreshed = await refreshAccessToken(token.refreshToken);
  const saved = await saveToken({
    accessToken:  refreshed.access_token,
    refreshToken: refreshed.refresh_token || token.refreshToken,
    expiresIn:    refreshed.expires_in || 3600,
  });
  return saved.accessToken;
}

// ── GraphQL helper ───────────────────────────────────────────────────────────

async function jobberGql(query, variables = {}) {
  const accessToken = await getValidAccessToken();
  const res = await fetch(JOBBER_GQL_URL, {
    method:  'POST',
    headers: {
      'Content-Type':            'application/json',
      'Authorization':           `Bearer ${accessToken}`,
      'X-JOBBER-GRAPHQL-VERSION': JOBBER_API_VER,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  console.log('Jobber GQL raw response:', JSON.stringify(json).slice(0, 500));
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// ── Routes ───────────────────────────────────────────────────────────────────

// Step 1: Redirect browser to Jobber OAuth consent screen
router.get('/auth', (req, res) => {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
  });
  res.redirect(`${JOBBER_AUTH_URL}?${params.toString()}`);
});

// Step 2: Jobber redirects here with ?code=
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;
  console.log('Jobber callback received:', { code: !!code, error });

  if (error || !code) {
    console.error('Jobber OAuth denied:', error);
    return res.redirect(`${FRONTEND_URL}?jobber=error&reason=${error || 'no_code'}`);
  }

  try {
    const params = new URLSearchParams({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    });

    console.log('Exchanging code for token, redirect_uri:', REDIRECT_URI);

    const tokenRes = await fetch(JOBBER_TOKEN_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept':        'application/json',
      },
      body: params.toString(),
    });

    const rawText = await tokenRes.text();
    console.log('Jobber token response status:', tokenRes.status);
    console.log('Jobber token response body:', rawText);

    let tokenData;
    try { tokenData = JSON.parse(rawText); }
    catch { throw new Error(`Non-JSON response: ${rawText}`); }

    if (!tokenData.access_token) {
      throw new Error(`No access_token. Response: ${JSON.stringify(tokenData)}`);
    }

    await saveToken({
      accessToken:  tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn:    tokenData.expires_in || 3600,
    });

    console.log('Jobber token saved successfully');
    res.redirect(`${FRONTEND_URL}?jobber=connected`);
  } catch (err) {
    console.error('Jobber callback error:', err.message);
    res.redirect(`${FRONTEND_URL}?jobber=error`);
  }
});

// Debug: check env vars are loaded (no secrets exposed)
router.get('/debug', (req, res) => {
  res.json({
    clientIdSet:     !!CLIENT_ID,
    clientSecretSet: !!CLIENT_SECRET,
    redirectUri:     REDIRECT_URI,
    frontendUrl:     FRONTEND_URL,
  });
});

// Check connection status
router.get('/status', async (req, res) => {
  try {
    const token = await getStoredToken();
    if (!token) return res.json({ connected: false });
    res.json({ connected: true, expiresAt: token.expiresAt });
  } catch (err) {
    res.json({ connected: false });
  }
});

// Disconnect (delete stored token)
router.delete('/disconnect', async (req, res) => {
  try {
    await prisma.jobberToken.deleteMany();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search open Jobber jobs (optionally filter by client name or property address)
router.get('/jobs', async (req, res) => {
  const { q } = req.query;
  try {
    const data = await jobberGql(`
      query SearchJobs {
        jobs(first: 50) {
          nodes {
            id
            jobNumber
            title
            client {
              id
              name
            }
            property {
              address {
                street
                city
                province
                postalCode
              }
            }
          }
        }
      }
    `);

    console.log('Jobber jobs raw data:', JSON.stringify(data));
    let jobs = data?.jobs?.nodes || [];

    // Client-side filter by search query
    if (q) {
      const search = q.toLowerCase();
      jobs = jobs.filter(j =>
        j.title?.toLowerCase().includes(search) ||
        j.client?.name?.toLowerCase().includes(search) ||
        j.property?.address?.street?.toLowerCase().includes(search) ||
        j.jobNumber?.toLowerCase().includes(search)
      );
    }

    res.json(jobs);
  } catch (err) {
    console.error('Jobber jobs error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Post a note to a Jobber job
router.post('/note', async (req, res) => {
  const { jobId, content } = req.body;
  if (!jobId || !content) {
    return res.status(400).json({ error: 'jobId and content are required' });
  }

  try {
    const data = await jobberGql(`
      mutation CreateNote($jobId: EncodedId!, $content: String!) {
        noteCreate(input: {
          body: $content
          noteable: { id: $jobId, type: Job }
        }) {
          note {
            id
            body
          }
          userErrors {
            message
            path
          }
        }
      }
    `, { jobId, content });

    const userErrors = data.noteCreate?.userErrors || [];
    if (userErrors.length > 0) {
      return res.status(400).json({ error: userErrors[0].message });
    }

    res.json({ success: true, note: data.noteCreate?.note });
  } catch (err) {
    console.error('Jobber note error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
