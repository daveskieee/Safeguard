const API_URL = 'http://localhost:5000/api';

export async function fetchTanks() {
  const response = await fetch(`${API_URL}/tanks`);
  if (!response.ok) throw new Error('Failed to fetch tanks');
  return response.json();
}

export async function fetchTankReadings(tankId) {
  const response = await fetch(`${API_URL}/tanks/${tankId}/readings`);
  if (!response.ok) throw new Error('Failed to fetch readings');
  return response.json();
}

export async function fetchTankDetails(tankId) {
  const response = await fetch(`${API_URL}/tanks/${tankId}`);
  if (!response.ok) throw new Error('Failed to fetch tank details');
  return response.json();
}

export async function createTank(name, type) {
  const response = await fetch(`${API_URL}/tanks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type })
  });
  if (!response.ok) throw new Error('Failed to create tank');
  return response.json();
}

export async function updateThresholds(tankId, thresholds) {
  const response = await fetch(`${API_URL}/thresholds/${tankId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(thresholds)
  });
  if (!response.ok) throw new Error('Failed to update thresholds');
  return response.json();
}

export async function postReading(tankId, temperature, pH, salinity) {
  const response = await fetch(`${API_URL}/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tankId, temperature, pH, salinity })
  });
  if (!response.ok) throw new Error('Failed to post reading');
  return response.json();
}

export async function updateTankImage(tankId, image) {
  const response = await fetch(`${API_URL}/tanks/${tankId}/image`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image })
  });
  if (!response.ok) throw new Error('Failed to update tank image');
  return response.json();
}

export async function deleteTank(tankId) {
  const response = await fetch(`${API_URL}/tanks/${tankId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error('Failed to delete tank');
  return response.json();
}
