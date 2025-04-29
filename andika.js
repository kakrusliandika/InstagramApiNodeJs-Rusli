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
        results.push({
          imageUrl: img.src,
          caption: img.alt || '',
          date: new Date().toISOString()
        });
      });

      return results;
    });

    await browser.close();
    res.status(200).json(feed.slice(0, 35));
  } catch (error) {
    if (browser) await browser.close();
    res.status(500).json({ error: error.message });
  }
};
