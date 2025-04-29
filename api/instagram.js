const puppeteerCore = require('puppeteer-core');
const chromeLambda = require('chrome-aws-lambda');

module.exports = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    console.log('Mempersiapkan browser...');
    const browser = await puppeteerCore.launch({
      args: chromeLambda.args,
      executablePath: await chromeLambda.executablePath || '/usr/bin/chromium-browser',
      headless: chromeLambda.headless,
      defaultViewport: chromeLambda.defaultViewport,
    });

    console.log('Browser berhasil dibuka');

    const page = await browser.newPage();

    // Set User-Agent agar tidak terdeteksi sebagai bot
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    const url = `https://www.instagram.com/${username}/`;
    console.log(`Membuka halaman: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('article', { timeout: 10000 });
    console.log('Selector artikel ditemukan, mulai mengambil data...');

    const feed = await page.evaluate(() => {
      const images = document.querySelectorAll('article img');
      const results = [];

      images.forEach(img => {
        results.push({
          imageUrl: img.src,
          caption: img.alt || '',
          date: new Date().toISOString(),
        });
      });

      return results;
    });

    await browser.close();
    console.log(`Scraping selesai, total postingan: ${feed.length}`);
    res.status(200).json(feed.slice(0, 35)); // Maksimal 35 post
  } catch (error) {
    console.error('Gagal mengambil feed:', error.message);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
};
