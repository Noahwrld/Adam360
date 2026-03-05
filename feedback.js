const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzEmt5_zfo76jglM6nd7ZfnB5_mlCMt2JAh3SVJD9usj_Ti9DenF-jr2UxjHlymUryobQ/exec';

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // ── SAVE feedback (POST) ──
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const params = new URLSearchParams({
        action:  'post',
        name:    body.name    || '',
        message: body.message || '',
        rating:  body.rating  || 5,
      });

      const res = await fetch(`${SCRIPT_URL}?${params}`);
      const text = await res.text();

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ── LOAD feedback (GET) ──
    if (event.httpMethod === 'GET') {
      const res  = await fetch(`${SCRIPT_URL}?action=get`);
      const text = await res.text();

      // Parse the response (may be JSONP or JSON)
      let data;
      try {
        data = JSON.parse(text);
      } catch(e) {
        // Strip JSONP wrapper if present
        const match = text.match(/\((\{.*\})\)/s);
        data = match ? JSON.parse(match[1]) : { success: false };
      }

      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
