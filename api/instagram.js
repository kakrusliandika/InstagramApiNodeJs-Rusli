const puppeteerCore = require('puppeteer-core');
const chromeLambda = require('chrome-aws-lambda');

module.exports = async (req, res) => {
  const { username } = req.query; // Get username from query parameter

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const feed = await getInstagramFeed(username);
    if (feed) {
      res.status(200).json(feed);
    } else {
      res.status(500).json({ error: 'Failed to fetch feed' });
    }
  } catch (error) {
    console.error('Error fetching Instagram feed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function getInstagramFeed(username) {
  const url = `https://www.instagram.com/${username}/`;

  let browser;

  try {
    // Launch puppeteer with proper arguments for Vercel (Lambda environment)
    browser = await puppeteerCore.launch({
      args: chromeLambda.args,
      executablePath: await chromeLambda.executablePath || '/usr/bin/chromium-browser',
      headless: chromeLambda.headless,
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
    return feed.slice(0, 35); // Return only the first 35 posts
  } catch (error) {
    console.error('Error scraping Instagram:', error.message);
    if (browser) await browser.close();
    return null;
  }
}
