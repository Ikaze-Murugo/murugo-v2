"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Smartphone, Download, ArrowLeft, CheckCircle2 } from "lucide-react";

const APK_FILENAME = "murugohomes.apk";
const APK_URL = `/download/${APK_FILENAME}`;

export default function DownloadPage() {
  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
          <div className="p-8 md:p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
              <Smartphone className="h-8 w-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Download Murugo Homes
            </h1>
            <p className="text-muted-foreground mb-8">
              Get the Android app to browse properties, save favorites, and contact listers on the go.
            </p>

            <a href={APK_URL} download={APK_FILENAME}>
              <Button size="lg" className="gap-2 w-full sm:w-auto min-w-[220px]">
                <Download className="h-5 w-5" />
                Download for Android
              </Button>
            </a>

            <p className="text-xs text-muted-foreground mt-4">
              APK · Android 5.0 or higher
            </p>
          </div>

          <div className="border-t bg-muted/30 px-8 md:px-10 py-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              How to install
            </h2>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Tap &quot;Download for Android&quot; above.</li>
              <li>When the download finishes, open the file from your notifications or Downloads folder.</li>
              <li>If asked, allow installation from this source (Chrome or your browser).</li>
              <li>Tap &quot;Install&quot; and open the app when done.</li>
            </ol>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Prefer the website?{" "}
          <Link href="/properties" className="text-primary hover:underline">
            Browse properties on the web
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
