import SearchButton from '@/components/SearchButton';

export default function Home() {
  return (
    <main className="w-screen h-screen">
      <div className="flex flex-col justify-center items-center h-full">
        <h1 className="text-6xl font-extrabold tracking-tight mb-6">
          Moovie Mood 🎬
        </h1>
        <div className="w-full max-w-md h-12">
          <SearchButton />
        </div>
        <div className="mt-24 max-w-md">
          <p className="italic">
            Movie Mood: Using Puppeteer to collect reviews of Letterboxd film
            entries, this project performs sentiment analysis on the top 10,
            revealing film metadata and key positive/negative words.
          </p>
        </div>
      </div>
    </main>
  );
}
