// app/api/results/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 20;

  try {
    // Replace with your actual backend API endpoint
    const backendUrl = `http://backend:5000/results?page=${page}&limit=${limit}`;

    const response = await fetch(backendUrl, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      results: data.results,
      totalResults: data.totalResults,
    });
  } catch (error) {
    console.error('Error fetching data from backend:', error);

    return NextResponse.json(
      { message: 'Failed to fetch data.' },
      { status: 500 }
    );
  }
}
