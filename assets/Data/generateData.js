// This is mannually run script to fetch data from the fakestoreapi and write it to data.js file
// Type `node generateData.js` in the terminal to run this script

const fs = require("fs");

async function fetchData() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const data = await response.json();

    // Convert fetched data into the required format
    const items = data.slice(0, 30).map((item, index) => ({
      id: index + 1,
      name: item.title,
      price: `$${item.price}`,
      image: item.image,
    }));

    // Write to data.js file
    const content = `export const items = ${JSON.stringify(items, null, 2)};`;
    fs.writeFileSync("data.js", content);

    console.log("Data successfully written to data.js");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();
