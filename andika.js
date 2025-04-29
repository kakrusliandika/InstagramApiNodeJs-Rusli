const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let puppeteer;
let isLambda = !!process.env.AWS_LAMBDA_FUNCTION_VERSION;

if (isLambda) {
  puppeteer = require('puppeteer-core');
  var chrome = require('chrome-aws-lambda');
} else {
  puppeteer = require('puppeteer');
}

app.get('/api/instagram/:username', async (req, res) => {
  const username = req.params.username;
  const feed = await getInstagramFeed(username);

  if (feed) {
    res.json(feed);
  } else {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

async function getInstagramFeed(username) {
  const url = `https://www.instagram.com/${username}/`;

  let browser;

  try {
    if (isLambda) {
      browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath || '/usr/bin/chromium-browser',
        headless: chrome.headless,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('article');

    const feed = await page.evaluate(() => {
      const posts = document.querySelectorAll('article img');
      const results = [];

      posts.forEach(img => {
        const imageUrl = img.src;
        const caption = img.alt || '';
        const date = new Date().toISOString();
        results.push({ imageUrl, caption, date });
      });

      return results;
    });

    await browser.close();
    return feed.slice(0, 35);
  } catch (error) {
    console.error('Error scraping Instagram:', error.message);
    if (browser) await browser.close();
    return null;
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

