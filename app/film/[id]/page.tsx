import puppeteer from 'puppeteer';
import Sentiment from 'sentiment';
import Image from 'next/image';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = [{ id: 'oppenheimer-2023' }];

  return posts.map((post) => ({
    id: post.id,
  }));
}

async function getMovieData(id: string): Promise<{
  title: string;
  director: string;
  rating: string;
  year: string;
  imageUrl: string;
  reviews: string;
}> {
  try {
    const browser = await puppeteer.launch();
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

    return { title, director, rating, year, imageUrl, reviews };
  } catch (e) {
    console.log(e);
    throw new Error('Failed to fetch data');
  }
}

function preprocessReviews(reviews: string): string {
  const processedReviews = reviews
    .split(' ')
    .map((review) => review.replace(/[.,\s]/g, ''));
  // Remove duplicates by creating a Set instance and joining back together again
  return [...new Set(processedReviews)].join();
}

function getTopFiveWords(reviewSentiment: Sentiment.AnalysisResult): {
  positive: string[];
  negative: string[];
} {
  const positive = reviewSentiment.calculation
    .filter((calc) => reviewSentiment.positive.includes(Object.keys(calc)[0]))
    .sort((a, b) => b[Object.keys(b)[0]] - a[Object.keys(a)[0]])
    .map((calc) => Object.keys(calc)[0])
    .slice(0, 5);
  const negative = reviewSentiment.calculation
    .filter((calc) => reviewSentiment.negative.includes(Object.keys(calc)[0]))
    .sort((a, b) => a[Object.keys(a)[0]] - b[Object.keys(b)[0]])
    .map((calc) => Object.keys(calc)[0])
    .slice(0, 5);
  return { positive, negative };
}

export default async function FilmPage({ params }: { params: { id: string } }) {
  const sentiment = new Sentiment();
  const { id } = params;
  const { title, director, rating, year, imageUrl, reviews } =
    await getMovieData(id);
  const reviewSentiment = sentiment.analyze(preprocessReviews(reviews));
  const { positive, negative } = getTopFiveWords(reviewSentiment);

  return (
    <main className="w-screen h-screen">
      <div className="flex flex-col p-8 space-y-8 justify-center items-center h-full">
        <div className="flex items-center space-x-4 mb-6">
          <div>
            <Link className="p-2 border-2 border-white rounded-lg" href="/">
              ←
            </Link>
          </div>
          <h1 className="text-6xl text-white font-extrabold tracking-tight">
            Moovie Mood 🎬
          </h1>
        </div>
        <div className="flex flex-wrap space-y-8 justify-center space-x-8 lg:flex-nowrap lg:space-y-0">
          <Image
            src={imageUrl}
            alt={`Movie poster of ${title}`}
            width={300}
            height={345}
            className="rounded-lg"
          />
          <div className="flex flex-col space-y-12">
            <div className="flex space-x-12">
              <div>
                <h1 className="text-6xl font-extrabold tracking-tight">
                  {title}
                </h1>
                <h2 className="text-md font-thin mt-4">{`released in ${year} by ${director}`}</h2>
              </div>
              <div>
                <span>
                  <h2 className="text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                    {rating}
                  </h2>
                  <p>Avg. review score</p>
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-extrabold mt-8 flex items-center space-x-4">
                <span>Overall review sentiment:</span>
                <span className="text-7xl">
                  {reviewSentiment.comparative > 0 ? '🤩' : '😡'}
                </span>
              </h2>
              <div className="flex space-x-12 mt-4">
                <div>
                  <h3 className="font-bold mb-4">
                    Top 5 most positive words/emojis used in reviews 👍:
                  </h3>
                  <ul className="list-disc list-inside">
                    {positive &&
                      positive.map((word) => <li key={word}>{word}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-4">
                    Top 5 most negative words/emojis used in reviews 👎:
                  </h3>
                  <ul className="list-disc list-inside">
                    {negative &&
                      negative.map((word) => <li key={word}>{word}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
