const api = new URL(process.env.API_URL ?? "http://127.0.0.1:4000/api/v1");
if (!["localhost", "127.0.0.1", "::1"].includes(api.hostname) || process.env.NODE_ENV === "production") {
  throw new Error("Demo accounts may only be created in a local development API. Set API_URL to localhost.");
}

const password = process.env.DEMO_PASSWORD ?? "GharSync123!";
const base = api.href.replace(/\/$/, "");
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path, { token, method = "GET", body, retry = true } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { ...(body ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (response.status === 429 && retry) {
    const seconds = Number(response.headers.get("retry-after")) || 12;
    console.log(`Rate limit reached; waiting ${seconds} seconds.`);
    await pause(seconds * 1000);
    return request(path, { token, method, body, retry: false });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${JSON.stringify(data)}`);
  return { status: response.status, data };
}

async function signIn(email) {
  const { data } = await request("/mobile/sign-in", { method: "POST", body: { email, password } });
  return { ...data, email };
}

async function ensureAccount(email, fullName, business) {
  const body = { fullName, email, password, phone: "+923001234567", accountType: business ? "business" : "team" };
  if (business) Object.assign(body, { organizationName: `${fullName} Home Services`, businessType: "GENERAL_MAINTENANCE", city: "Lahore", countryCode: "PK" });
  try {
    const { data } = await request("/mobile/register", { method: "POST", body });
    const account = { ...data, email };
    if (account.phoneVerificationRequired) await request("/auth/phone-otp/verify", { token: account.accessToken, method: "POST", body: { code: "123456" } });
    await pause(12_000);
    return account;
  } catch (error) {
    if (!String(error.message).includes("409")) throw error;
    const account = await signIn(email);
    await pause(12_000);
    return account;
  }
}

async function ensureMember(owner, orgId, branchId, member, role) {
  const profile = (await request("/mobile/me", { token: member.accessToken })).data;
  const membership = profile.memberships?.find((item) => item.organizationId === orgId);
  if (!membership) {
    const invite = (await request(`/organizations/${orgId}/invites`, { token: owner.accessToken, method: "POST", body: { email: member.email, role, branchId } })).data;
    const inviteToken = new URL(invite.inviteUrl).searchParams.get("token");
    await request("/organizations/invites/accept", { token: member.accessToken, method: "POST", body: { token: inviteToken } });
  }
  await request(`/mobile/organizations/${orgId}/select`, { token: member.accessToken, method: "POST" });
}

for (let i = 1; i <= 10; i += 1) {
  const owner = await ensureAccount(`owner${i}@gmail.com`, `Demo Owner ${i}`, true);
  const profile = (await request("/mobile/me", { token: owner.accessToken })).data;
  const orgId = profile.currentOrganizationId ?? profile.memberships?.[0]?.organizationId;
  if (!orgId) throw new Error(`owner${i}@gmail.com has no workspace.`);
  const branch = (await request("/organizations/branches", { token: owner.accessToken })).data[0];
  for (const [role, prefix, displayRole] of [["ADMIN", "admin", "Admin"], ["TECHNICIAN", "technician", "Technician"]]) {
    const email = `${prefix}${i}@gmail.com`;
    const member = await ensureAccount(email, `Demo ${displayRole} ${i}`, false);
    await ensureMember(owner, orgId, branch.id, member, role);
  }
  console.log(`Created simple Gmail demo accounts for workspace ${i}/10.`);
}

console.log("\nDemo accounts: owner1–10@gmail.com, admin1–10@gmail.com, technician1–10@gmail.com");
console.log(`Shared password: ${password}`);
