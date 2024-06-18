// screenshot_routes.js

const puppeteer = require('puppeteer');
const URL = require('url').URL;

(async () => {
  try {
    // Launch a headless browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Define the main URL to start from
    const mainUrl = 'https://365aitech.com/';
    
    // Navigate to the main URL
    await page.goto(mainUrl, { waitUntil: 'networkidle2' });
    
    // Get all links from the main page
    const links = await page.evaluate(() => 
      Array.from(document.querySelectorAll('a')).map(anchor => anchor.href)
    );
    
    // Filter the links to include only those from the same domain
    const mainDomain = new URL(mainUrl).origin;
    const filteredLinks = links.filter(link => link.startsWith(mainDomain));
    
    // Remove duplicates
    const uniqueLinks = [...new Set(filteredLinks)];
    
    // Function to take screenshot of a page
    const takeScreenshot = async (url, index) => {
      const screenshotPage = await browser.newPage();
      await screenshotPage.goto(url, { waitUntil: 'networkidle2' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `screenshot-${index}-${timestamp}.png`;
      await screenshotPage.screenshot({ path: fileName, fullPage: true });
      console.log(`Screenshot of ${url} taken and saved as ${fileName}`);
      await screenshotPage.close();
    };
    
    // Take screenshots of all unique links
    for (let i = 0; i < uniqueLinks.length; i++) {
      await takeScreenshot(uniqueLinks[i], i + 1);
    }
    
    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('Error taking screenshots:', error);
  }
})();
