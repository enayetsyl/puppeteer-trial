const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Set the viewport to the full screen size
  const screenSize = { width: 1920, height: 1080 };
 

  // Navigate to the website
  await page.goto('https://www.cutlistoptimizer.com/', { waitUntil: 'networkidle2' });

  // Wait for the main grid container to load
  await page.waitForSelector('#tiles-grid');
  await page.waitForSelector('#stock-sheets-input');

  // Utility function to add a random delay between 1500ms and 3000ms
  const delay = () => {
    console.log('delay function called')
    // const randomDelay = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
    // return new Promise(resolve => setTimeout(resolve, randomDelay));
  };



 // Function to click, clear, and type text into an input field
 const clickAndType = async (cell, text) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await cell.click(); // Click to focus the input field
      await page.keyboard.down('Control');
      await page.keyboard.press('a'); // Select all text
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace'); // Clear the input field
      await page.keyboard.type(text); // Type the new value
      await delay(); // Wait for a random delay to ensure input is registered

      // Verify the value was entered correctly
      const enteredText = await page.evaluate(cell => cell.textContent.trim(), cell);
      if (enteredText === text) {
        console.log(`Successfully entered ${text}`);
        break; // Exit loop if the correct value is entered
      } else {
        console.log(`Entered text "${enteredText}" does not match expected "${text}". Retrying...`);
        await retryClearAndType(cell, text);
      }
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed to click and type. Retrying...`);
      await delay(); // Wait a bit before retrying with a random delay
    }
  }
};

// Function to retry clearing and typing the text
const retryClearAndType = async (cell, text) => {
  try {
    // await cell.click(); // Click to focus the input field
    await page.keyboard.down('Control');
    await page.keyboard.press('a'); // Select all text
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace'); // Clear the input field
    await page.keyboard.type(text); // Type the new value
    await delay(); // Wait for a random delay to ensure input is registered
  } catch (error) {
    console.log(`Retry attempt failed. Retrying...`);
  }
};

// Function to process a grid with given selector and data
const processGrid = async (gridSelector, data) => {
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const cells = await page.$$(`${gridSelector} .ui-grid-row:nth-child(${rowIndex + 1}) .ui-grid-cell-contents`);
    if (cells.length >= 3) {
      console.log(`Processing row ${rowIndex + 1} in ${gridSelector}`);
      await clickAndType(cells[0], data[rowIndex][0]); // First cell for Length
      await clickAndType(cells[1], data[rowIndex][1]); // Second cell for Width
      await clickAndType(cells[2], data[rowIndex][2]); // Third cell for Qty

      // Verify the values have been entered correctly
      const cell1Text = await page.evaluate(cell => cell.textContent.trim(), cells[0]);
      const cell2Text = await page.evaluate(cell => cell.textContent.trim(), cells[1]);
      const cell3Text = await page.evaluate(cell => cell.textContent.trim(), cells[2]);

      console.log(`Row ${rowIndex + 1} in ${gridSelector} - Length cell: ${cell1Text}, Width cell: ${cell2Text}, Qty cell: ${cell3Text}`);
    } else {
      console.error('Not enough cells found in row ' + (rowIndex + 1));
    }
  }
};


 // Function to click the "Calculate" button
 const clickCalculateButton = async () => {
  try {
    const calculateButton = await page.$('#calculate-btn button[ng-click="submitTask()"]:not(.ng-hide)');
    if (calculateButton) {
      await calculateButton.click();
      console.log('Clicked the Calculate button');
    } else {
      console.error('Calculate button not found');
    }
  } catch (error) {
    console.error('Failed to click the Calculate button:', error);
  }
};

// Function to click the "Accept" button
const clickAcceptButton = async () => {
  try {
    const acceptButton = await page.$('button[ng-click="stopTask()"]:not(.ng-hide)');
    if (acceptButton) {
      await acceptButton.click();
      console.log('Clicked the Accept button');
    } else {
      console.error('Accept button not found');
    }
  } catch (error) {
    console.error('Failed to click the Accept button:', error);
  }
};

 // Function to write email and password
 const typeForEmail = async (cell, text) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await cell.click(); // Click to focus the input field
      await page.keyboard.down('Control');
      await page.keyboard.press('a'); // Select all text
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace'); // Clear the input field
      await page.keyboard.type(text); // Type the new value
      await delay(); // Wait for a random delay to ensure input is registered

      // Verify the value was entered correctly
      const enteredText = await page.evaluate(cell => cell.value.trim(), cell);
      if (enteredText === text) {
        console.log(`Successfully entered ${text}`);
        break; // Exit loop if the correct value is entered
      } else {
        console.log(`Entered text "${enteredText}" does not match expected "${text}". Retrying...`);
      }
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed to click and type. Retrying...`);
      await delay(); // Wait a bit before retrying with a random delay
    }
  }
};


  // Function to click the "Got it!" button for cookies
  const clickGotItButton = async () => {
    try {
      const gotItButton = await page.$('.cc-btn.cc-dismiss[aria-label="dismiss cookie message"]');
      if (gotItButton) {
        await gotItButton.click();
        console.log('Clicked the "Got it!" button for cookies');
      } else {
        console.error('"Got it!" button for cookies not found');
      }
    } catch (error) {
      console.error('Failed to click the "Got it!" button for cookies:', error);
    }
  };
  // Input data for the Panels grid
  const panelsData = [
    ['600', '200', '1'],
    ['600', '200', '1'],
    ['600', '200', '1'],
    ['600', '200', '1'],
    ['600', '200', '1']
  ];

  // Input data for the Stock sheets grid
  const stockSheetsData = [
    ['1220', '2440', '5']
  ];

  // Process the Panels grid
  await processGrid('#tiles-grid', panelsData);

  // Process the Stock sheets grid
  await processGrid('#stock-tiles-grid', stockSheetsData);

    // Click the "Got it!" button for cookies
    await clickGotItButton();

  // Click the Calculate button
  await clickCalculateButton();

  // Wait for the login form to be visible
  await page.waitForSelector('input[placeholder="Email"]', { visible: true });
  await page.waitForSelector('input[placeholder="Password"]', { visible: true });

  // Type the email and password
  await typeForEmail(await page.$('input[placeholder="Email"]'), 'Ssingh@365aitech.com');
  await typeForEmail(await page.$('input[placeholder="Password"]'), 'Password@123!');

  // Click the Sign In button
  await page.click('button[ng-click="login();"]');

  // Wait for navigation to complete after login
  // try {
  //   await page.waitForNavigation({ waitUntil: 'networkidle2' });
  // } catch (error) {
  //   console.error('Navigation timed out:', error);
  // }

 
  // Wait for 10 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Click the Calculate button again after login
  await clickCalculateButton();

  // Wait for 10 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Click the Accept button
  await clickAcceptButton();

   await page.setViewport(screenSize);
  // Wait for 20 seconds
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Take a full-page screenshot
  const screenshotPath = 'full_screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`Screenshot taken: ${screenshotPath}`);

  // Close the browser
  await browser.close();
})();
