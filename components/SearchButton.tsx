'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function SearchButton() {
  const router = useRouter();
  const [url, setUrl] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const urlSegments = url.split('/');
    if (urlSegments[urlSegments.length - 1] === '') {
      urlSegments.pop();
    }

    const filmSlug = urlSegments.pop();
    router.push(`/film/${filmSlug}`);
  }

  return (
    <form
      className="h-full flex flex-wrap justify-center md:flex-nowrap md:space-x-4"
      onSubmit={handleSubmit}
    >
      <input
        className="cursor-pointer h-full p-2 rounded-lg w-full text-black"
        placeholder="Enter valid Letterboxd film URL"
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        className="w-full h-full p-2 rounded-lg border-2 border-white uppercase font-medium text-sm hover:bg-zinc-900 md:w-fit"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
}
