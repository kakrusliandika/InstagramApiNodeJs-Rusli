const express = require('express');
const puppeteerCore = require('puppeteer-core');
const chromeLambda = require('chrome-aws-lambda');
const app = express();
const port = process.env.PORT || 3000;

const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_VERSION;

let puppeteer;
let chrome;

if (isLambda) {
  puppeteer = puppeteerCore;
  chrome = chromeLambda;
} else {
  puppeteer = require('puppeteer'); // Use puppeteer for local development
}

app.get('/api/instagram/:username', async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const feed = await getInstagramFeed(username);
    if (feed) {
      res.json(feed);
    } else {
      res.status(500).json({ error: 'Failed to fetch feed' });
    }
  } catch (error) {
    console.error('Error fetching Instagram feed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function getInstagramFeed(username) {
  const url = `https://www.instagram.com/${username}/`;

  let browser;

  try {
    // Launch puppeteer with proper arguments depending on the environment
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
    return feed.slice(0, 35); // Return only the first 35 posts
  } catch (error) {
    console.error('Error scraping Instagram:', error.message);
    if (browser) await browser.close();
    return null;
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
