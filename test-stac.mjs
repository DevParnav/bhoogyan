async function testStac() {
  const url = 'https://stac.dataspace.copernicus.eu/v1/search';
  const payload = {
    collections: ["sentinel-2-l2a"],
    intersects: {
      "type": "Polygon",
      "coordinates": [[[78.0, 27.8], [78.2, 27.8], [78.2, 28.0], [78.0, 28.0], [78.0, 27.8]]]
    },
    datetime: "2024-01-01T00:00:00Z/2024-01-31T23:59:59Z", // using 2024 to ensure data exists
    limit: 5
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      console.log('Error HTTP', res.status);
      console.log(await res.text());
      return;
    }
    
    const data = await res.json();
    console.log(`Success! Found ${data.features.length} features.`);
    if (data.features.length > 0) {
      console.log('Sample feature properties:');
      console.log(Object.keys(data.features[0].properties));
      console.log('Cloud cover:', data.features[0].properties['eo:cloud_cover']);
      console.log('Date:', data.features[0].properties['datetime']);
    }
  } catch (err) {
    console.error('Fetch failed', err);
  }
}
testStac();
