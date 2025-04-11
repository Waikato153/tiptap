import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get('room');

    if (!room) {
      return NextResponse.json(
        { status: "fail", error: "Room name is required." },
        { status: 400 }
      );
    }

    const authString = req.headers.get('authorization');
    if (!authString) {
      return NextResponse.json(
        { status: "fail", error: "Authorization header is required." },
        { status: 401 }
      );
    }

    const phpApiUrl = `https://dev-portal.fluidbusinesssystems.co.nz/api2/editor/setting/${room}`;
    const response = await fetch(phpApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/html',
        'Authorization': authString,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(response
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", error: "Unexpected error.", details: error.message },
      { status: 500 }
    );
  }
}
