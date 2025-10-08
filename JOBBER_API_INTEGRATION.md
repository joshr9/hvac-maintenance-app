# Jobber API Integration Plan

## Overview
Jobber uses a **GraphQL API** with **OAuth 2.0** authentication to access job data.

## Authentication Setup

### 1. Create Developer Account
- Go to [Jobber Developer Center](https://developer.getjobber.com/)
- Create a developer account
- Create a new app to receive credentials

### 2. OAuth 2.0 Credentials
You'll receive:
- **Client ID** (public) - for identification
- **Client Secret** (confidential) - for authentication
- **Redirect URI** - where Jobber redirects after authorization

### 3. OAuth Flow (Authorization Code Grant)
```
1. User clicks "Connect to Jobber"
2. Redirect to Jobber authorization URL:
   https://api.getjobber.com/api/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code

3. User approves access
4. Jobber redirects back with authorization code
5. Exchange code for access token:
   POST https://api.getjobber.com/api/oauth/token
   {
     "client_id": "YOUR_CLIENT_ID",
     "client_secret": "YOUR_CLIENT_SECRET",
     "code": "AUTHORIZATION_CODE",
     "grant_type": "authorization_code",
     "redirect_uri": "YOUR_REDIRECT_URI"
   }

6. Store access_token and refresh_token securely
```

## GraphQL API

### Endpoint
```
POST https://api.getjobber.com/api/graphql
Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json
  X-JOBBER-GRAPHQL-VERSION: 2024-11-01
```

### Example Queries

#### Get Jobs
```graphql
query GetJobs {
  jobs(first: 50) {
    nodes {
      id
      title
      jobNumber
      description
      status
      scheduledStart
      scheduledEnd
      client {
        id
        name
        firstName
        lastName
        companyName
        email
        phone
      }
      property {
        id
        address {
          street1
          street2
          city
          province
          postalCode
        }
      }
      lineItems {
        id
        name
        description
        quantity
        unitCost
        total
      }
      visits {
        id
        scheduledStart
        scheduledEnd
        assignedTo {
          id
          name
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

#### Get Single Job
```graphql
query GetJob($jobId: ID!) {
  job(id: $jobId) {
    id
    title
    jobNumber
    description
    status
    scheduledStart
    scheduledEnd
    total
    invoiced
    client {
      name
      email
      phone
    }
    property {
      address {
        street1
        city
        province
        postalCode
      }
    }
  }
}
```

## Implementation Steps

### Backend Implementation

1. **Environment Variables** (.env.production)
```
JOBBER_CLIENT_ID=your_client_id
JOBBER_CLIENT_SECRET=your_client_secret
JOBBER_REDIRECT_URI=https://app.deancallanpm.com/api/jobber/callback
```

2. **OAuth Routes** (backend/routes/jobber.js)
- GET /api/jobber/auth - Start OAuth flow
- GET /api/jobber/callback - Handle OAuth callback
- GET /api/jobber/jobs - Fetch jobs from Jobber
- GET /api/jobber/jobs/:id - Fetch single job

3. **Store Tokens**
- Store access_token and refresh_token in database
- Associate with user account
- Implement token refresh logic

4. **GraphQL Client**
- Use axios or fetch to make GraphQL requests
- Handle pagination (Jobber uses cursor-based pagination)
- Cache results to reduce API calls

### Frontend Implementation

1. **Connect to Jobber Button**
```jsx
<button onClick={() => window.location.href = '/api/jobber/auth'}>
  Connect to Jobber
</button>
```

2. **Jobs Page**
- Display jobs from Jobber
- Show job details (title, client, property, status)
- Allow filtering by status, date, client
- Sync with local database

3. **Sync Strategy**
- Initial sync: Pull all jobs
- Webhook updates: Real-time updates (if Jobber supports)
- Periodic sync: Every 15-30 minutes
- Manual refresh button

## Rate Limits
- Check Jobber documentation for current rate limits
- Implement exponential backoff for rate limit errors
- Cache frequently accessed data

## Testing Account
- Use developer testing signup link from Jobber
- 90-day trial period (extendable)
- Contact api-support@getjobber.com for help

## Next Steps
1. Create Jobber Developer account
2. Get OAuth credentials
3. Implement backend OAuth flow
4. Test with Jobber's GraphiQL explorer
5. Build frontend integration
6. Test with Dean Callan's Jobber account
