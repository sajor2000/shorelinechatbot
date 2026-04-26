# Shoreline Dental Chat API

Base URL: `https://<your-vercel-domain>/api`

## POST /api/chat

Streaming chat endpoint. Sends a conversation to the AI assistant and returns a streamed response (Server-Sent Events).

### Request

```json
{
  "messages": [
    { "role": "user", "content": "What are your hours?" },
    { "role": "assistant", "content": "We're open Tuesday through Friday starting at 7 a.m...." },
    { "role": "user", "content": "Are you open Saturday?" }
  ]
}
```

- `messages` — array of `{ role, content }` objects. `role` must be `"user"` or `"assistant"`. `content` must be a string. Send the full conversation history (the API is stateless).
- Max 20 most recent messages are processed (older ones are trimmed).
- Each message content is truncated to 4,000 characters.
- Messages with invalid roles or non-string content are silently dropped.

### Response

Content-Type: `text/event-stream`

Each SSE event contains a JSON payload with a `text` field (a token fragment):

```
data: {"text":"We're"}
data: {"text":" open"}
data: {"text":" every"}
data: {"text":" other"}
data: {"text":" Saturday"}
data: [DONE]
```

Concatenate all `text` values to build the full response. The stream ends with `data: [DONE]`.

If the stream is interrupted mid-response, the server sends an error event before closing:

```
data: {"error":"Stream interrupted"}
data: [DONE]
```

Check each event for an `error` field to detect partial failures.

### Error Responses

| Status | Body | Meaning |
|--------|------|---------|
| 400 | `{"error":"Invalid JSON"}` | Request body is not valid JSON |
| 400 | `{"error":"messages array required"}` | Missing or empty messages array |
| 400 | `{"error":"No valid messages"}` | All messages had invalid roles or non-string content |
| 429 | `{"error":"Too many requests. Please try again in a minute."}` | Rate limit exceeded (20 req/60s per IP) |
| 500 | `{"error":"Server misconfigured"}` | Server environment not configured |
| 502 | `{"error":"Upstream API unavailable"}` | AI model provider is unreachable |

### Rate Limiting

20 requests per 60-second sliding window per IP address. Exceeding the limit returns a 429 response.

### CORS

The API allows requests from:
- `https://www.shorelinedentalchicago.com`
- `https://shorelinedentalchicago.com`
- `http://localhost:3000` _(development only — not available on the production deployment)_

### Lead Capture

The assistant automatically collects patient contact information when a patient wants to be reached. When a patient shares their name, email, or phone and asks to be contacted, the assistant saves the lead and sends an email notification to the practice. No action is needed from the integration side — this happens transparently within the chat.

### Minimal JavaScript Integration Example

```javascript
async function sendMessage(messages) {
  const res = await fetch('https://<your-vercel-domain>/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const err = await res.json(); msg = err.error || msg; } catch {}
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6);
        if (payload === '[DONE]') break outer;
        try {
          const data = JSON.parse(payload);
          if (data.error) throw new Error(data.error);
          if (data.text) {
            fullText += data.text;
            // Update your UI here with fullText
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue; // partial chunk
          throw e;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
}
```

---

## GET /api/leads

Returns captured patient leads. Protected by API key.

### Request

```
GET /api/leads?limit=50
Authorization: Bearer YOUR_LEADS_API_KEY
```

| Header / Param | Required | Description |
|----------------|----------|-------------|
| `Authorization` | Yes | `Bearer <key>` — must match the `LEADS_API_KEY` environment variable |
| `limit` | No | Number of leads to return (default 50, max 200) |

### Response

```json
{
  "leads": [
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "(312) 555-1234",
      "reason": "Interested in teeth whitening consultation",
      "capturedAt": "4/26/2026, 3:45:00 PM"
    },
    {
      "reason": "Asked about insurance coverage",
      "capturedAt": "4/26/2026, 2:10:00 PM"
    }
  ],
  "count": 2
}
```

**Note:** `name`, `email`, and `phone` are optional — they may be absent from a lead object if the patient did not provide them.

### Error Responses

| Status | Body | Meaning |
|--------|------|---------|
| 401 | `{"error":"Unauthorized"}` | Missing or invalid API key |
| 500 | `{"error":"Failed to retrieve leads"}` | Lead storage is unreachable |
