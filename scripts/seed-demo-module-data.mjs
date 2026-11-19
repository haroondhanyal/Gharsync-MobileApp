import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const api = new URL(process.env.API_URL ?? "http://127.0.0.1:4000/api/v1");
if (!["localhost", "127.0.0.1", "::1"].includes(api.hostname) || process.env.NODE_ENV === "production") throw new Error("Demo data may only be written to a local development API.");
const base = api.href.replace(/\/$/, "");
const password = process.env.DEMO_PASSWORD ?? "GharSync123!";
const startWorkspace = Number(process.env.DEMO_START_WORKSPACE ?? 1);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function call(path, { token, method = "GET", body, expected = [200, 201, 202], attempt = 0 } = {}) {
  const response = await fetch(`${base}${path}`, { method, headers: { ...(body ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (response.status === 429 && attempt < 5) {
    const delay = Math.max(12, Number(response.headers.get("retry-after")) || 0) * 1000;
    console.log(`API rate limit; waiting ${Math.ceil(delay / 1000)} seconds.`);
    await sleep(delay);
    return call(path, { token, method, body, expected, attempt: attempt + 1 });
  }
  const data = await response.json().catch(() => ({}));
  if (!expected.includes(response.status)) throw new Error(`${method} ${path}: ${response.status} ${JSON.stringify(data)}`);
  if (path === "/mobile/sign-in") await sleep(8_000);
  return data;
}

async function uploadAsset(token, assetId, index) {
  const bytes = await readFile(resolve("assets/web-mark.png"));
  const form = new FormData();
  form.set("file", new Blob([bytes], { type: "image/png" }), `gharsync-home-asset-${index}.png`);
  form.set("assetId", assetId);
  const response = await fetch(`${base}/documents`, { method: "POST", headers: { authorization: `Bearer ${token}` }, body: form });
  const data = await response.json().catch(() => ({}));
  if (response.status !== 201) throw new Error(`Asset photo upload failed (${response.status}): ${JSON.stringify(data)}`);
}

const customerNames = ["Ayesha Khan", "Bilal Ahmed", "Sara Malik"];
const services = [
  { name: "Home equipment inspection", category: "Inspection", basePrice: 3500, durationMins: 60, description: "Document condition, safety points, model and serial details, then provide a clear service summary." },
  { name: "Repair and maintenance visit", category: "Repair", basePrice: 5000, durationMins: 90, description: "Diagnose the issue, present an approved estimate, complete repair and record parts used." },
  { name: "Preventive home care service", category: "Maintenance", basePrice: 4200, durationMins: 75, description: "Clean, inspect and tune home equipment before seasonal peak demand." },
];

for (let workspace = startWorkspace; workspace <= 10; workspace += 1) {
  const ownerEmail = `owner${workspace}@gmail.com`;
  const login = await call("/mobile/sign-in", { method: "POST", token: undefined, body: { email: ownerEmail, password } });
  const token = login.accessToken;
  const existing = await call("/customers?status=active&page=1&pageSize=100", { token });
  if ((existing.data ?? []).some((customer) => customer.email === `demo.customer.1.workspace${workspace}@example.test`)) {
    console.log(`Workspace ${workspace}/10 already has demo module data.`);
    await sleep(8_000);
    continue;
  }

  const branch = (await call("/organizations/branches", { token }))[0];
  const catalog = [];
  for (const [index, service] of services.entries()) {
    catalog.push(await call("/services", { token, method: "POST", body: { ...service, minPrice: 2000, maxPrice: service.basePrice * 4, requiredSkills: ["Home service", "Safety inspection"], serviceAreas: ["Lahore"], branchIds: [branch.id], isActive: true } }));
  }

  const customers = [];
  const properties = [];
  const assets = [];
  for (let index = 0; index < customerNames.length; index += 1) {
    const customer = await call("/customers", { token, method: "POST", body: { fullName: `${customerNames[index]} · Workspace ${workspace}`, phone: `+92300111${String(workspace).padStart(2, "0")}${String(index + 1).padStart(2, "2")}`, countryCode: "PK", city: "Lahore", email: `demo.customer.${index + 1}.workspace${workspace}@example.test`, tags: ["demo", index === 0 ? "priority" : "residential"], notes: index === 0 ? "Prefers a morning appointment; confirm before dispatch. Keep the written estimate with the service report." : "Demo customer. Contact before arrival and record the equipment condition after service." } });
    customers.push(customer);
    const property = await call("/properties", { token, method: "POST", body: { customerId: customer.id, name: `Lahore ${["family home", "apartment", "home office"][index]}`, address: `${12 + index}-A, Model Town, Lahore`, city: "Lahore", propertyType: index === 1 ? "APARTMENT" : "HOUSE", ownership: index === 1 ? "TENANT" : "OWNER", notes: "Confirm gate access and ask before entering service areas." } });
    properties.push(property);
    const asset = await call("/assets", { token, method: "POST", body: { propertyId: property.id, category: ["Air conditioner", "Refrigerator", "Solar inverter"][index], brand: ["Dawlance", "Haier", "Inverex"][index], model: ["Inverter 1.5 ton", "No Frost 14 cu ft", "5.2kW Hybrid"][index], serialNumber: `GS-WS${workspace}-ASSET-${index + 1}`, installedAt: "2025-01-15T00:00:00.000Z", warrantyStartsAt: "2025-01-15T00:00:00.000Z", warrantyEndsAt: "2028-01-15T00:00:00.000Z", purchasePrice: 85000 + index * 22000, seller: "Lahore Home Appliances" } });
    assets.push(asset);
    if (index === 0) await uploadAsset(token, asset.id, workspace);
  }

  const bookings = [];
  for (let index = 0; index < customers.length; index += 1) {
    bookings.push(await call("/bookings", { token, method: "POST", body: { customerId: customers[index].id, propertyId: properties[index].id, assetId: assets[index].id, serviceId: catalog[index].id, branchId: branch.id, urgency: ["HIGH", "NORMAL", "LOW"][index], preferredAt: new Date(Date.now() + (index + 2) * 86_400_000).toISOString(), description: `${catalog[index].name} for ${assets[index].category}. Customer confirmed property access and requests a written service summary.` } }));
  }

  const supplier = await call("/inventory/suppliers", { token, method: "POST", body: { name: `Lahore Home Parts Supply ${workspace}`, phone: "+923001234567", email: `supplier.workspace${workspace}@example.test`, address: "Industrial Estate, Lahore", notes: "Demo supplier. Check model compatibility and invoice before recording a part." } });
  const product = await call("/inventory/products", { token, method: "POST", body: { sku: `GS-DEMO-WS${workspace}-FILTER`, name: "Washable split AC filter set", category: "Air filtration", manufacturer: "Universal", compatibleModels: ["Residential split AC", "Inverter AC"], description: "Reusable filter set. Check dimensions and airflow rating before installation.", unit: "set", unitCost: 650, sellingPrice: 1100, reorderLevel: 4, supplierId: supplier.id, tracksWarranty: true, warrantyDays: 180 } });
  await call("/inventory/movements", { token, method: "POST", body: { productId: product.id, branchId: branch.id, type: "RECEIPT", quantity: 12, unitCost: 650, reference: `PO-GS-DEMO-WS${workspace}`, notes: "Demo receipt checked against supplier delivery note." } });
  const claim = await call("/warranty-claims", { token, method: "POST", body: { assetId: assets[0].id, productId: product.id, supplierId: supplier.id, issue: "Filter frame is damaged; photos, equipment serial and inspection notes recorded for supplier review." } });
  await call(`/warranty-claims/${claim.id}`, { token, method: "PATCH", body: { status: "SUBMITTED" } });
  await call("/notifications", { token, method: "POST", body: { eventKey: `demo.workspace.${workspace}.welcome`, channel: "IN_APP", subject: "Demo workspace is ready", body: `${customers.length} customers, home equipment, ${bookings.length} bookings, stocked parts and a warranty claim are ready to explore.` } });

  await call(`/bookings/${bookings[0].id}/transition`, { token, method: "POST", body: { status: "UNDER_REVIEW", note: "Customer details, equipment serial and access notes reviewed." } });
  const quote = await call(`/bookings/${bookings[0].id}/quotes`, { token, method: "POST", body: { items: [{ description: catalog[0].name, quantity: 1, unitPrice: Number(catalog[0].basePrice) }], discount: 0, tax: 0, notes: "Includes inspection and standard labor. Parts require customer approval." } });
  await call(`/quotes/${quote.id}/send`, { token, method: "POST" });
  await call(`/quotes/${quote.id}/decision`, { token, method: "POST", body: { decision: "ACCEPTED", note: "Demo customer approved the written estimate." } });
  const organizationId = login.user.memberships?.[0]?.organizationId;
  const members = await call(`/organizations/${organizationId}/members`, { token });
  const technician = members.find((member) => member.user?.email === `technician${workspace}@gmail.com`);
  if (technician) {
    await call(`/workforce/technicians/${technician.id}/profile`, { token, method: "PUT", body: { skills: ["Home service", "Safety inspection", "Customer service"], employmentType: "FULL_TIME", hourlyRate: 850, isAvailable: true, bio: `GharSync demo technician ${workspace}, available for home equipment inspections and repairs.` } });
    await call(`/workforce/technicians/${technician.id}/availability`, { token, method: "PUT", body: { days: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, startMinute: 540, endMinute: 1020, isAvailable: true })) } });
    const appointment = new Date(Date.now() + 4 * 86_400_000);
    appointment.setUTCHours(5, 0, 0, 0);
    await call(`/bookings/${bookings[0].id}/transition`, { token, method: "POST", body: { status: "SCHEDULED", scheduledAt: appointment.toISOString() } });
    await call(`/bookings/${bookings[0].id}/transition`, { token, method: "POST", body: { status: "ASSIGNED", scheduledAt: appointment.toISOString(), assignedMemberId: technician.id } });
    const techToken = (await call("/mobile/sign-in", { method: "POST", body: { email: technician.user.email, password } })).accessToken;
    await call(`/bookings/${bookings[0].id}/work-status`, { token: techToken, method: "POST", body: { status: "TECHNICIAN_EN_ROUTE", note: "Technician is on the way to the demo home." } });
    await call(`/bookings/${bookings[0].id}/work-status`, { token: techToken, method: "POST", body: { status: "IN_PROGRESS", note: "Arrival confirmed; inspection checklist started." } });
    await call(`/bookings/${bookings[0].id}/work-status`, { token: techToken, method: "POST", body: { status: "COMPLETED", note: "Service complete; work area checked and customer briefed." } });
    const invoice = await call(`/invoices/booking/${bookings[0].id}`, { token, method: "POST", body: { dueAt: new Date(Date.now() + 14 * 86_400_000).toISOString() } });
    const payment = await call(`/invoices/${invoice.id}/payments`, { token, method: "POST", body: { amount: Number(catalog[0].basePrice), method: "BANK_TRANSFER", reference: `DEMO-WS${workspace}-TRANSFER`, idempotencyKey: `gharsync-demo-ws${workspace}-payment-v1`, note: "Demo payment record. No real funds moved." } });
    await call(`/invoices/payments/${payment.id}/decision`, { token, method: "POST", body: { decision: "VERIFIED", note: "Demo bank transfer reviewed." } });
  }
  console.log(`Seeded workspace ${workspace}/10 with customers, properties/assets/photos, services/bookings, quote, invoice/payment, stock, warranty claim and notification.`);
}

console.log("Demo module data is ready for owner1@gmail.com–owner10@gmail.com.");
