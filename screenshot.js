// screenshot.js

const puppeteer = require('puppeteer');

(async () => {
  try {
    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: true });
    
    // Open a new page
    const page = await browser.newPage();
    
    // Define the URL to navigate to
    const url = 'https://replicate.com';
    
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });
    
      // Generate a dynamic file name with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `screenshot-${timestamp}.png`;
      
      // Take a full-page screenshot and save it to a file
      await page.screenshot({ path: fileName, fullPage: true });
    
    console.log('Screenshot taken and saved as screenshot.png');
    
    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
})();
