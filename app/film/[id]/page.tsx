import Sentiment from 'sentiment';
import Image from 'next/image';
import Link from 'next/link';
import { movieData } from './movie-data';

export async function generateStaticParams() {
  return movieData.map((movie) => ({
    id: movie.id,
  }));
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
  const movie = movieData.find((movie) => movie.id === id);
  if (!movie) {
    throw new Error('Could not find movie');
  }
  const { title, director, rating, year, imageUrl, reviews } = movie;
  const reviewSentiment = sentiment.analyze(reviews);
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
