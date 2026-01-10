# POALPH API Endpoints Documentation

## Base URL
`http://localhost:3000/api`

---

## 📊 Collections & Series Overview

### Get All Collections (Mixed)
**GET** `/events?limit=50`

Returns both single events and series collections mixed together.

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `type` (optional): Filter by type
  - `single` - Only single event collections
  - `series` - Only series collections

**Response:**
```json
[
  {
    "contractId": "abc123...",
    "eventName": "My Event",
    "caller": "1A2B3C...",
    "isPublic": true,
    "disabled": false,
    "isSeries": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Get Only Series Collections
**GET** `/series?limit=50`

Returns only series collections (containers that hold multiple events).

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
[
  {
    "contractId": "series123...",
    "eventName": "Alephium Meetups 2024",
    "caller": "1A2B3C...",
    "isPublic": true,
    "disabled": false,
    "isSeries": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Get Series Collection Details
**GET** `/series/:collectionId`

Get detailed information about a specific series collection, including all events within it.

**Response:**
```json
{
  "contractId": "series123...",
  "eventName": "Alephium Meetups 2024",
  "caller": "1A2B3C...",
  "isPublic": true,
  "disabled": false,
  "isSeries": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "eventsCount": 5,
  "events": [
    {
      "contractId": "event1...",
      "collectionContractId": "series123...",
      "eventName": "Meetup #1 - London",
      "organizer": "1A2B3C...",
      "isPublic": true,
      "createdAt": "2024-01-15T00:00:00.000Z"
    },
    {
      "contractId": "event2...",
      "collectionContractId": "series123...",
      "eventName": "Meetup #2 - Paris",
      "organizer": "1A2B3C...",
      "isPublic": true,
      "createdAt": "2024-02-15T00:00:00.000Z"
    }
  ]
}
```

---

### Get Events Within a Series
**GET** `/series/:collectionId/events?limit=20`

Get all individual events within a specific series collection.

**Response:**
```json
[
  {
    "contractId": "event1...",
    "collectionContractId": "series123...",
    "eventName": "Meetup #1 - London",
    "organizer": "1A2B3C...",
    "isPublic": true,
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
]
```

---

## 👥 Presences (Attendees)

### Get All Presences for a Specific Event in Series
**GET** `/poap-serie/:seriesId/event/:eventId?limit=10&offset=0`

Get all presences (POAPs minted) for a specific event within a series.

**Example:** `/poap-serie/series123/event/0?limit=50`

**Response:**
```json
{
  "presences": [
    {
      "contractId": "poap1...",
      "collectionContractId": "series123...",
      "eventId": 0,
      "nftIndex": 1,
      "caller": "address1...",
      "isPublic": true,
      "hasParticipated": false,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Get Addresses That Attended a Specific Event
**GET** `/poap-serie/:seriesId/event/:eventId/addresses?limit=1000&offset=0`

Get list of addresses that attended a specific event (lighter response, just addresses).

**Response:**
```json
{
  "addresses": [
    {
      "address": "1A2B3C...",
      "nftIndex": 1,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "address": "4D5E6F...",
      "nftIndex": 2,
      "createdAt": "2024-01-15T10:05:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 1000,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### Get All Presences Across All Events in a Series
**GET** `/poap-serie/minted/:seriesId?limit=100`

Get all presences for ALL events within a series collection.

**Response:**
```json
[
  {
    "contractId": "poap1...",
    "collectionContractId": "series123...",
    "eventId": 0,
    "nftIndex": 1,
    "caller": "address1...",
    "isPublic": true,
    "hasParticipated": false,
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "contractId": "poap2...",
    "collectionContractId": "series123...",
    "eventId": 1,
    "nftIndex": 1,
    "caller": "address2...",
    "isPublic": true,
    "hasParticipated": true,
    "createdAt": "2024-02-15T10:00:00.000Z"
  }
]
```

---

### Get All Addresses Who Have Presences in a Series
**GET** `/poap-serie/minted-list/:seriesId?limit=1000&offset=0`

Get unique addresses that have any presence in the series (across all events).

**Response:**
```json
{
  "addresses": [
    "1A2B3C...",
    "4D5E6F...",
    "7G8H9I..."
  ],
  "pagination": {
    "total": 320,
    "limit": 1000,
    "offset": 0,
    "hasMore": false
  }
}
```

---

## 📈 Statistics & Analytics

### Get Presence Statistics for All Events in a Series
**GET** `/poap-serie/:seriesId/stats/events`

Get statistics for each event within a series (how many presences, unique attendees).

**Response:**
```json
{
  "seriesId": "series123...",
  "totalEvents": 5,
  "events": [
    {
      "eventId": 0,
      "totalPresences": 150,
      "uniqueAttendees": 145
    },
    {
      "eventId": 1,
      "totalPresences": 200,
      "uniqueAttendees": 180
    },
    {
      "eventId": 2,
      "totalPresences": 175,
      "uniqueAttendees": 160
    }
  ]
}
```

---

### Get Participation Statistics for a Specific Event
**GET** `/poap-serie/:seriesId/event/:eventId/participation-stats`

Get validation/participation statistics for a specific event.

**Response:**
```json
{
  "seriesId": "series123...",
  "eventId": 0,
  "totalPresences": 150,
  "participatedCount": 120,
  "notParticipatedCount": 30,
  "participationRate": 80.0
}
```

---

### Get Validated Presences for a Specific Event
**GET** `/poap-serie/:seriesId/event/:eventId/participated?limit=10&offset=0`

Get only presences that have been validated/marked as participated.

**Response:**
```json
{
  "presences": [
    {
      "contractId": "poap1...",
      "collectionContractId": "series123...",
      "eventId": 0,
      "nftIndex": 1,
      "caller": "address1...",
      "isPublic": true,
      "hasParticipated": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 120,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Get Overall Statistics
**GET** `/stats/total`

Get overall platform statistics.

**Response:**
```json
{
  "totalCollections": 150,
  "totalSeriesCollections": 45,
  "totalSingleCollections": 105,
  "totalSeriesEvents": 230,
  "totalPoaps": 5000,
  "totalPoapSeries": 8500
}
```

---

## 🔍 User-Specific Queries

### Check if User Attended a Specific Event
**GET** `/poap-serie/:seriesId/event/:eventId/address/:address`

Check if a specific address attended a specific event.

**Response:**
```json
{
  "hasPresence": true,
  "count": 2,
  "presences": [
    {
      "contractId": "poap1...",
      "collectionContractId": "series123...",
      "eventId": 0,
      "nftIndex": 1,
      "caller": "address1...",
      "isPublic": true,
      "hasParticipated": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### Get All Events a User Attended in a Series
**GET** `/poap-serie/:seriesId/attendee/:address`

Get summary of which events within a series a user attended.

**Response:**
```json
{
  "seriesId": "series123...",
  "address": "1A2B3C...",
  "eventsAttended": 3,
  "events": [
    {
      "eventId": 0,
      "presenceCount": 2,
      "firstAttendance": "2024-01-15T10:00:00.000Z",
      "lastAttendance": "2024-01-15T10:05:00.000Z"
    },
    {
      "eventId": 1,
      "presenceCount": 1,
      "firstAttendance": "2024-02-15T10:00:00.000Z",
      "lastAttendance": "2024-02-15T10:00:00.000Z"
    }
  ]
}
```

---

### Get Detailed User Presences in a Series
**GET** `/poap-serie/:seriesId/address/:address/detailed`

Get all presences a user has across all events in a series, grouped by event.

**Response:**
```json
{
  "seriesId": "series123...",
  "address": "1A2B3C...",
  "totalPresences": 5,
  "eventsAttended": 3,
  "presencesByEvent": {
    "0": [
      {
        "contractId": "poap1...",
        "nftIndex": 1,
        "isPublic": true,
        "hasParticipated": true,
        "createdAt": "2024-01-15T10:00:00.000Z"
      },
      {
        "contractId": "poap2...",
        "nftIndex": 2,
        "isPublic": true,
        "hasParticipated": false,
        "createdAt": "2024-01-15T10:05:00.000Z"
      }
    ],
    "1": [
      {
        "contractId": "poap3...",
        "nftIndex": 1,
        "isPublic": true,
        "hasParticipated": true,
        "createdAt": "2024-02-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Get All User's POAPs for Series Events
**GET** `/poap-serie/:address?unique=true`

Get all series POAPs owned by a user across all series.

**Query Parameters:**
- `unique` (optional): If `true`, returns one per collection

**Response:**
```json
[
  {
    "contractId": "poap1...",
    "collectionContractId": "series123...",
    "eventId": 0,
    "nftIndex": 1,
    "caller": "1A2B3C...",
    "isPublic": true,
    "hasParticipated": false,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

---

## 🏢 Organizer Queries

### Get Series Collections by Organizer
**GET** `/series/organizer/:address?limit=20`

Get all series collections created by a specific organizer.

**Response:**
```json
[
  {
    "contractId": "series123...",
    "eventName": "Alephium Meetups 2024",
    "caller": "1A2B3C...",
    "isPublic": true,
    "disabled": false,
    "isSeries": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Get Series Events Added by Organizer
**GET** `/series/events/organizer/:address?limit=20`

Get all individual series events (events within series collections) added by a specific organizer.

**Response:**
```json
[
  {
    "contractId": "event1...",
    "collectionContractId": "series123...",
    "eventName": "Meetup #1 - London",
    "organizer": "1A2B3C...",
    "isPublic": true,
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  {
    "contractId": "event2...",
    "collectionContractId": "series123...",
    "eventName": "Meetup #2 - Paris",
    "organizer": "1A2B3C...",
    "isPublic": true,
    "createdAt": "2024-02-15T00:00:00.000Z",
    "updatedAt": "2024-02-15T00:00:00.000Z"
  }
]
```

---

### Get All Collections by Creator
**GET** `/events/:address?limit=20`

Get all collections (both single and series) created by an address.

**Response:**
```json
[
  {
    "contractId": "abc123...",
    "eventName": "My Event",
    "caller": "1A2B3C...",
    "isPublic": true,
    "disabled": false,
    "isSeries": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## 🎯 Single Event Endpoints (For Non-Series Events)

### Get Presences for Single Event
**GET** `/events/minted/:collectionid?limit=10`

Get all presences for a single (non-series) event.

### Get Addresses for Single Event
**GET** `/events/minted-list/:collectionid?limit=1000&offset=0`

Get list of addresses that minted for a single event.

### Get Participated Presences for Single Event
**GET** `/events/:collectionId/participated?limit=10&offset=0`

Get validated presences for a single event.

### Get Participation Stats for Single Event
**GET** `/events/:collectionId/participation-stats`

Get participation statistics for a single event.

---

## 📱 Frontend Implementation Examples

### Example 1: Display All Series Collections
```typescript
// Fetch series collections
const response = await fetch('http://localhost:3000/api/series?limit=50');
const seriesCollections = await response.json();

// Display each series
seriesCollections.forEach(series => {
  console.log(`Series: ${series.eventName}`);
  console.log(`Created by: ${series.caller}`);
});
```

---

### Example 2: Display Events in a Series with Presence Counts
```typescript
const seriesId = 'series123...';

// Get series details with events
const response = await fetch(`http://localhost:3000/api/series/${seriesId}`);
const series = await response.json();

// Get statistics for each event
const statsResponse = await fetch(`http://localhost:3000/api/poap-serie/${seriesId}/stats/events`);
const stats = await statsResponse.json();

// Combine and display
series.events.forEach((event, index) => {
  const eventStats = stats.events.find(s => s.eventId === index);
  console.log(`Event: ${event.eventName}`);
  console.log(`Presences: ${eventStats?.totalPresences || 0}`);
  console.log(`Unique attendees: ${eventStats?.uniqueAttendees || 0}`);
});
```

---

### Example 3: Display All Presences for a Specific Event
```typescript
const seriesId = 'series123...';
const eventId = 0;

// Fetch presences with pagination
let allPresences = [];
let offset = 0;
const limit = 100;
let hasMore = true;

while (hasMore) {
  const response = await fetch(
    `http://localhost:3000/api/poap-serie/${seriesId}/event/${eventId}?limit=${limit}&offset=${offset}`
  );
  const data = await response.json();

  allPresences = [...allPresences, ...data.presences];
  hasMore = data.pagination.hasMore;
  offset += limit;
}

console.log(`Total presences: ${allPresences.length}`);
```

---

### Example 4: Check if User Attended an Event
```typescript
const seriesId = 'series123...';
const eventId = 0;
const userAddress = '1A2B3C...';

const response = await fetch(
  `http://localhost:3000/api/poap-serie/${seriesId}/event/${eventId}/address/${userAddress}`
);
const data = await response.json();

if (data.hasPresence) {
  console.log(`User attended this event ${data.count} time(s)`);
} else {
  console.log('User did not attend this event');
}
```

---

### Example 5: Display User's Progress in a Series
```typescript
const seriesId = 'series123...';
const userAddress = '1A2B3C...';

// Get user's attendance
const response = await fetch(
  `http://localhost:3000/api/poap-serie/${seriesId}/attendee/${userAddress}`
);
const attendance = await response.json();

// Get total events in series
const seriesResponse = await fetch(`http://localhost:3000/api/series/${seriesId}`);
const series = await seriesResponse.json();

console.log(`User attended ${attendance.eventsAttended} out of ${series.eventsCount} events`);
console.log(`Completion: ${(attendance.eventsAttended / series.eventsCount * 100).toFixed(1)}%`);
```

---

## 🎨 UI Implementation Suggestions

### Explorer Views

#### 1. **Series List View**
- Endpoint: `GET /series?limit=50`
- Display: Grid of series collections
- Show: Series name, creator, number of events, total presences

#### 2. **Series Detail View**
- Endpoint: `GET /series/:collectionId`
- Display: Series info + list of events within it
- Show: Each event with name, date, presence count

#### 3. **Event Detail View (within Series)**
- Endpoint: `GET /poap-serie/:seriesId/event/:eventId`
- Display: All presences for that specific event
- Show: List of addresses, NFT indices, participation status

#### 4. **User Profile View**
- Endpoints:
  - `GET /poap-serie/:address` (all series POAPs)
  - For each series: `GET /poap-serie/:seriesId/attendee/:address`
- Display: User's participation across all series
- Show: Series attended, events per series, completion percentage

---

## 🔑 Key Concepts

### Multiple Presences
- A user CAN have multiple presences (POAPs) for the same event
- Each presence has a unique `contractId` and `nftIndex`
- Use `count` field to show how many times someone attended

### Participation Status
- `hasParticipated`: Boolean indicating if presence was validated
- Difference between "minted a POAP" vs "actually attended"
- Use `/participated` endpoints to filter only validated presences

### Event IDs
- Events within a series are numbered starting from 0
- `eventId` is the index of the event within the series collection
- Each event can have many presences

---

## Need More Endpoints?

Let me know if you need additional endpoints for:
- Filtering (by date, by participation status, etc.)
- Sorting (by date, by count, etc.)
- Aggregations (totals, averages, etc.)
- Search functionality
