const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;
const app = express();
const port = 3000;

// Configure your Cloudinary credentials
cloudinary.config({
  cloud_name: 'dj3qabx11',
  api_key: '533762782692462',
  api_secret: 'YcvSAvEFsEu-rZyhKmLnI3bQ5KQ'
});

// Set up middleware to parse JSON request bodies
app.use(express.json());

// Configure CORS to allow requests from localhost:5173
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Define the Puppeteer function
const runPuppeteer = async (panelsData, stockSheetsData) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Set the viewport to the full screen size
  const screenSize = { width: 1920, height: 1080 };

  // Navigate to the website
  await page.goto('https://www.cutlistoptimizer.com/', { waitUntil: 'networkidle2' });

  // Wait for the main grid container to load
  await page.waitForSelector('#tiles-grid');
  await page.waitForSelector('#stock-sheets-input');

  const clickAndType = async (cell, text) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await cell.click();
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await page.keyboard.type(text);
        const enteredText = await page.evaluate(cell => cell.textContent.trim(), cell);
        if (enteredText === text) {
          console.log(`Successfully entered ${text}`);
          break;
        } else {
          console.log(`Entered text "${enteredText}" does not match expected "${text}". Retrying...`);
          await retryClearAndType(cell, text);
        }
      } catch (error) {
        console.log(`Attempt ${attempt + 1} failed to click and type. Retrying...`);
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
    await page.keyboard.press('Backspace');
    await page.keyboard.type(text); 
  } catch (error) {
    console.log(`Retry attempt failed. Retrying...`);
  }
};

  const processGrid = async (gridSelector, data) => {
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const cells = await page.$$(`${gridSelector} .ui-grid-row:nth-child(${rowIndex + 1}) .ui-grid-cell-contents`);
      if (cells.length >= 3) {
        console.log(`Processing row ${rowIndex + 1} in ${gridSelector}`);
        await clickAndType(cells[0], data[rowIndex][0]);
        await clickAndType(cells[1], data[rowIndex][1]);
        await clickAndType(cells[2], data[rowIndex][2]);

        const cell1Text = await page.evaluate(cell => cell.textContent.trim(), cells[0]);
        const cell2Text = await page.evaluate(cell => cell.textContent.trim(), cells[1]);
        const cell3Text = await page.evaluate(cell => cell.textContent.trim(), cells[2]);

        console.log(`Row ${rowIndex + 1} in ${gridSelector} - Length cell: ${cell1Text}, Width cell: ${cell2Text}, Qty cell: ${cell3Text}`);
      } else {
        console.error('Not enough cells found in row ' + (rowIndex + 1));
      }
    }
  };

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

  const typeForEmail = async (cell, text) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await cell.click();
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await page.keyboard.type(text);
        const enteredText = await page.evaluate(cell => cell.value.trim(), cell);
        if (enteredText === text) {
          console.log(`Successfully entered ${text}`);
          break;
        } else {
          console.log(`Entered text "${enteredText}" does not match expected "${text}". Retrying...`);
        }
      } catch (error) {
        console.log(`Attempt ${attempt + 1} failed to click and type. Retrying...`);
      }
    }
  };

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

  await processGrid('#tiles-grid', panelsData);
  await processGrid('#stock-tiles-grid', stockSheetsData);
  await clickGotItButton();
  await clickCalculateButton();

  await page.waitForSelector('input[placeholder="Email"]', { visible: true });
  await page.waitForSelector('input[placeholder="Password"]', { visible: true });

  await typeForEmail(await page.$('input[placeholder="Email"]'), 'Ssingh@365aitech.com');
  await typeForEmail(await page.$('input[placeholder="Password"]'), 'Password@123!');

  await page.click('button[ng-click="login();"]');

  await new Promise(resolve => setTimeout(resolve, 5000));

  await clickCalculateButton();
  await new Promise(resolve => setTimeout(resolve, 5000));
  await clickAcceptButton();

  await page.setViewport(screenSize);
  await new Promise(resolve => setTimeout(resolve, 10000));

  const screenshotPath = 'full_screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`Screenshot taken: ${screenshotPath}`);

  const result = await cloudinary.uploader.upload(screenshotPath, { folder: 'screenshots' });
  console.log(`Screenshot uploaded to Cloudinary: ${result.secure_url}`);

  await browser.close();

  return result.secure_url;
};

app.post('/design-data', async (req, res) => {
  const { panels, stockSheet } = req.body;
  console.log('panels', panels, stockSheet)
  try {
    const cloudinaryLink = await runPuppeteer(panels, stockSheet);
    console.log('clu link', cloudinaryLink)
    res.status(200).json({
      yourDesignLink: cloudinaryLink
    });
  } catch (error) {
    console.error('Error running Puppeteer:', error);
    res.status(500).send('Error running Puppeteer');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
