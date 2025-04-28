const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

async function getInstagramFeed(username) {
  const url = `https://www.instagram.com/${username}/`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Tunggu sampai konten keluar
    await page.waitForSelector('article');

    const feed = await page.evaluate(() => {
      const posts = document.querySelectorAll('article img');
      const results = [];

      posts.forEach(img => {
        const imageUrl = img.src;
        const caption = img.alt || '';
        const date = new Date().toISOString(); // Karena public feed tidak ada tanggal
        results.push({ imageUrl, caption, date });
      });

      return results;
    });

    await browser.close();

    // Batasi maksimum 35 posting
    return feed.slice(0, 35);
  } catch (error) {
    console.error('Error scraping Instagram:', error.message);
    await browser.close();
    return null;
  }
}

app.get('/api/instagram/:username', async (req, res) => {
  const { username } = req.params;
  const feed = await getInstagramFeed(username);

  if (feed) {
    res.json(feed);
  } else {
    res.status(500).json({ error: 'Failed to scrape Instagram data' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
