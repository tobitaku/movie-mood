import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

exports.handler = async () => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.IS_LOCAL
        ? '/tmp/localChromium/chromium/mac_arm-1184749/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
        : await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Get movie meta data first
    await page.goto(`https://letterboxd.com/film/${id}/`);
    const [title, director, rating, year, imageUrl] = await Promise.all([
      page.$eval('#featured-film-header > h1', (e) => e.innerText),
      page.$eval('#featured-film-header > p > a > span', (e) => e.innerText),
      page.$eval(
        '#film-page-wrapper > div.col-17 > aside > section.section.ratings-histogram-chart > span > a',
        (e) => e.innerText
      ),
      page.$eval('#featured-film-header > p > small > a', (e) => e.innerText),
      page.$eval('#poster-zoom > div > div > img', (e) => e.src),
    ]);

    // Then navigate to reviews page and get review data
    await page.goto(`https://letterboxd.com/film/${id}/reviews/by/activity/`);
    // Expand long reviews first
    await page.$$eval(
      'div.body-text.-prose.collapsible-text > div > p > a.reveal.js-reveal',
      (moreButtons) => moreButtons.forEach((moreButton) => moreButton.click())
    );
    const reviews = await page.$$eval(
      'div.body-text.-prose.collapsible-text > p',
      (filmDetails) =>
        filmDetails.map((filmDetail) => filmDetail.textContent).join(' ')
    );

    await browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify({
        title,
        director,
        rating,
        year,
        imageUrl,
        reviews,
      }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching data' }),
    };
  }
};
