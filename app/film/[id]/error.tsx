'use client'; // Error components must be Client Components

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="w-screen h-screen flex flex-col space-y-12 justify-center items-center">
      <h2 className="text-4xl">Something went wrong!</h2>
      <div className="flex justify-center items-center space-x-4">
        <Link className="p-2 border-2 border-white rounded-lg" href="/">
          ←
        </Link>
        <span>Try again</span>
      </div>
    </div>
  );
}
