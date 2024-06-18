const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to the website
  await page.goto('https://www.cutlistoptimizer.com/');

  // Wait for the main grid container to load
  await page.waitForSelector('#tiles-grid');

  // Function to click, clear and type text into an input field
  const clickAndType = async (page, cell, text) => {
    await cell.click({ clickCount: 3 }); // Click to focus and select any text
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace'); // Clear the input field
    await page.keyboard.type(text); // Type the new value
  };

  // Wait for the specific cells to be available
  await page.waitForSelector('.ui-grid-row:nth-child(1) .ui-grid-cell-contents');

  // Select all cells in the first row
  const cells = await page.$$('.ui-grid-row:nth-child(1) .ui-grid-cell-contents');
  if (cells.length >= 3) {
    await clickAndType(page, cells[0], '600'); // First cell for Length
    await clickAndType(page, cells[1], '200'); // Second cell for Width
    await clickAndType(page, cells[2], '2');   // Third cell for Qty

    // Verify the values have been entered correctly
    const cell1Text = await page.evaluate(cell => cell.textContent, cells[0]);
    const cell2Text = await page.evaluate(cell => cell.textContent, cells[1]);
    const cell3Text = await page.evaluate(cell => cell.textContent, cells[2]);

    console.log(`Length cell: ${cell1Text}`);
    console.log(`Width cell: ${cell2Text}`);
    console.log(`Qty cell: ${cell3Text}`);
  } else {
    console.error('Not enough cells found in the first row');
  }

  // Take a screenshot
  await page.screenshot({ path: 'screenshot.png' });

  // Close the browser
  await browser.close();
})();
