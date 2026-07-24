async function testFetch() {
  console.log("=== Testing http://localhost:3000 ===");
  try {
    const res = await fetch("http://localhost:3000", { redirect: "manual" });
    console.log("Status:", res.status);
    console.log("Headers:");
    res.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testFetch();
