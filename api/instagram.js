const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const url = `https://www.instagram.com/${username}/`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
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
    await browser.close();
    res.status(500).json({ error: 'Failed to scrape Instagram data' });
  }
};
