import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const calendarApiUrl = process.env.NEXT_PUBLIC_CALENDAR_API_URL;

        if (!calendarApiUrl) {
            return NextResponse.json({ error: "Calendar API URL not configured" }, { status: 500 });
        }

        const res = await fetch(calendarApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Cloudflare Worker Error:", errorText);
            return NextResponse.json({ error: "Upstream server error" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Calendar Proxy Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
