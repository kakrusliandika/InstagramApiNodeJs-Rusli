const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

module.exports = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  const url = `https://www.instagram.com/${username}/`;
  let browser;

  try {
    browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath || '/usr/bin/chromium-browser',
      headless: chrome.headless,
    });

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
    res.status(200).json(feed.slice(0, 35));
  } catch (error) {
    console.error('Error scraping Instagram:', error.message);
    if (browser) await browser.close();
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
};
