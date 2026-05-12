const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

const criticalRoutes = ['/', '/items', '/beta', '/how-it-works', '/safety', '/install', '/offline'];
const optionalRoutes = ['/dashboard'];

async function checkRoute(route, { optional = false } = {}) {
  const url = new URL(route, baseUrl).toString();

  try {
    const response = await fetch(url, { redirect: 'manual' });
    const isRedirect = response.status >= 300 && response.status < 400;
    const marker = optional ? '[optional]' : '[critical]';
    const redirectNote = isRedirect ? ` -> ${response.headers.get('location') ?? 'redirect'}` : '';
    console.log(`${marker} ${route}: ${response.status}${redirectNote}`);

    if (response.status >= 500) {
      return { ok: false, route, reason: `status ${response.status}` };
    }

    return { ok: true, route };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${optional ? '[optional]' : '[critical]'} ${route}: fetch error (${message})`);
    return { ok: false, route, reason: message };
  }
}

async function run() {
  console.log(`Running smoke test against: ${baseUrl}`);

  const criticalResults = await Promise.all(criticalRoutes.map((route) => checkRoute(route)));
  const optionalResults = await Promise.all(optionalRoutes.map((route) => checkRoute(route, { optional: true })));

  const criticalFailures = criticalResults.filter((result) => !result.ok);
  const optionalFailures = optionalResults.filter((result) => !result.ok);

  if (optionalFailures.length > 0) {
    console.warn(`Optional route issues: ${optionalFailures.map((f) => `${f.route} (${f.reason})`).join(', ')}`);
  }

  if (criticalFailures.length > 0) {
    console.error(`Smoke test failed. Critical route issues: ${criticalFailures.map((f) => `${f.route} (${f.reason})`).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  console.log('Smoke test passed. No critical 5xx/errors detected.');
}

run();
