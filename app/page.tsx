import Link from 'next/link';
import { movieData } from './film/[id]/movie-data';

function getMovieLinks() {
  return movieData.map((movie) => ({
    title: movie.title,
    href: `/film/${movie.id}`,
  }));
}

export default function Home() {
  const links = getMovieLinks();

  return (
    <main className="w-screen h-screen">
      <div className="flex flex-col justify-center items-center h-full">
        <h1 className="text-6xl font-extrabold tracking-tight mb-6">
          Moovie Mood 🎬
        </h1>
        <div className="w-full max-w-md">
          <div className="flex flex-col space-y-4">
            {links.map((link) => (
              <Link className="underline" key={link.title} href={link.href}>
                {link.title} →
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-24 max-w-md">
          <p className="italic">
            Movie Mood: Using pre-scraped reviews of Letterboxd film entries,
            this project performs sentiment analysis on the top 10 reviews,
            revealing film metadata and key positive/negative words.
          </p>
        </div>
      </div>
    </main>
  );
}
