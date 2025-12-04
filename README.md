# BEU Result Backend

A Node.js + Express backend to scrape and fetch results from the BEU Bihar website.

## Features
- **Auto-Scraper**: Fetches all available result links from `https://beu-bih.ac.in/result-one`.
- **Result Fetching**: Uses Puppeteer to automate result retrieval for a specific student.
- **Caching**: Caches result links for 10 minutes to reduce load on the university website.
- **API**: Provides JSON endpoints for frontend integration.

## API Endpoints

### 1. Get Result Links
**GET** `/api/result-links`

Returns a list of all result links and the latest link for each semester.

**Response:**
```json
{
  "links": [
    { "semester": "3", "year": "2024", "url": "...", "examName": "..." }
  ],
  "latestBySemester": {
    "3": { "semester": "3", "year": "2024", "url": "...", "examName": "..." }
  }
}
```

### 2. Fetch Student Result
**POST** `/api/fetch-result`

Fetches the result for a specific student.

**Body:**
```json
{
  "semester": "3",
  "regNo": "23101110001"
}
```
*Note: You can also provide `url` directly if known.*

**Response:**
```json
{
  "studentInfo": {
    "Name": "Rahul Kumar",
    "College": "...",
    "Roll No": "..."
  },
  "sgpa": "8.72",
  "marks": [
    { "subject": "Maths", "code": "BT301", "grade": "A" }
  ]
}
```

## Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`.

## Deployment

### Render / Railway
This project uses Puppeteer, which requires a Chromium instance.

**Option 1: Docker (Recommended)**
A `Dockerfile` is included. Simply deploy this repository and select "Docker" as the build type.

**Option 2: Buildpacks (Railway)**
If not using Docker, add the following buildpacks:
1. `https://github.com/puppeteer/puppeteer-buildpack` (or similar system dependency pack)
2. Node.js

### Environment Variables
- `PORT`: (Optional) Port to run the server on (default: 3000).

## Tech Stack
- **Express**: Web server
- **Axios + Cheerio**: HTML parsing for links
- **Puppeteer**: Headless browser for result fetching
- **Node-Cache**: Caching
- **Winston**: Logging
