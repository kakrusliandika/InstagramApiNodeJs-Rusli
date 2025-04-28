const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Missing username' });
  }

  const url = `https://www.instagram.com/${username}/`;

  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
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

    return res.status(200).json(feed.slice(0, 35));
  } catch (error) {
    console.error('Error scraping Instagram:', error.message);
    if (browser !== null) await browser.close();
    return res.status(500).json({ error: 'Failed to scrape Instagram data' });
  }
};
