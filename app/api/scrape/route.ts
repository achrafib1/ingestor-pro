import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        const $ = cheerio.load(response.data);

        // Basic cleanup: remove scripts, styles, nav, footer
        $("script, style, nav, footer, header, iframe, noscript").remove();

        const title = $("title").text() || "Untitled Page";
        const content = $("body").text().replace(/\s+/g, " ").trim();

        return NextResponse.json({ title, content, url });
    } catch (error: any) {
        console.error("Scraping error:", error.message);
        return NextResponse.json({ error: "Failed to scrape URL: " + error.message }, { status: 500 });
    }
}
