async function test() {
  try {
    const roles = [
      { name: 'Citizen', email: 'citizen@citywise.org', password: 'password123' },
      { name: 'PWD Roads Officer', email: 'roads@citywise.org', password: 'password123' },
      { name: 'Admin', email: 'admin@citywise.org', password: 'admin123' }
    ];

    for (const r of roles) {
      const res = await fetch('https://citywise-portal.vercel.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: r.email, password: r.password })
      });
      const text = await res.text();
      console.log(`[${r.name}] Status: ${res.status}, Body: ${text.slice(0, 300)}`);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

test();
