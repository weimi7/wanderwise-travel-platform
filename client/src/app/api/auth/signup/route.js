export async function POST(req) {
  try {
    const data = await req.json();
    // Validate required fields
    if (!data.email || !data.password || !data.role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Call backend signup API
    const apiResponse = await fetch(`${process.env.BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const responseData = await apiResponse.json();
    if (!apiResponse.ok) {
      return Response.json({ error: responseData.error || 'Unknown error' }, { status: apiResponse.status });
    }
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}