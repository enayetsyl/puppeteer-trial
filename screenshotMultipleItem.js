const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to the website
  await page.goto('https://www.cutlistoptimizer.com/', { waitUntil: 'networkidle2' });

  // Wait for the main grid container to load
  await page.waitForSelector('#tiles-grid');

  // Function to click, clear, and type text into an input field
  const clickAndType = async (cell, text) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await cell.click({ clickCount: 3 }); // Click to focus and select any text
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace'); // Clear the input field
        await page.keyboard.type(text); // Type the new value
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 500ms to ensure input is registered

        // Verify the value was entered correctly
        const enteredText = await page.evaluate(cell => cell.textContent, cell);
        if (enteredText === text) break; // Exit loop if the correct value is entered
      } catch (error) {
        console.log(`Attempt ${attempt + 1} failed to click and type. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit before retrying
      }
    }
  };

  // Wait for the specific cells to be available
  await page.waitForSelector('.ui-grid-row');

  // Input data for the three rows
  const data = [
    ['600', '200', '2'],
    ['650', '550', '3'],
    ['100', '200', '1'],
    ['200', '300', '4']
  ];

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const cells = await page.$$(`.ui-grid-row:nth-child(${rowIndex + 1}) .ui-grid-cell-contents`);
    if (cells.length >= 3) {
      console.log(`Processing row ${rowIndex + 1}`);
      await clickAndType(cells[0], data[rowIndex][0]); // First cell for Length
      await clickAndType(cells[1], data[rowIndex][1]); // Second cell for Width
      await clickAndType(cells[2], data[rowIndex][2]); // Third cell for Qty

      // Verify the values have been entered correctly
      const cell1Text = await page.evaluate(cell => cell.textContent, cells[0]);
      const cell2Text = await page.evaluate(cell => cell.textContent, cells[1]);
      const cell3Text = await page.evaluate(cell => cell.textContent, cells[2]);

      console.log(`Row ${rowIndex + 1} - Length cell: ${cell1Text}, Width cell: ${cell2Text}, Qty cell: ${cell3Text}`);
    } else {
      console.error('Not enough cells found in row ' + (rowIndex + 1));
    }
  }

  // Take a screenshot
  await page.screenshot({ path: 'screenshot.png' });

  // Close the browser
  await browser.close();
})();
