"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Smartphone, Download, ArrowLeft, CheckCircle2, Star, Zap, Shield } from "lucide-react";

// EAS build artifact URL — update after each new build (from EAS dashboard or build output)
const APK_URL = "https://expo.dev/artifacts/eas/vbCLhheXAQnDMGNGJ6bykP.apk";
const APK_FILENAME = "murugohomes.apk";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-12 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Main Download Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mb-8">
          <div className="p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
              <Smartphone className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-neutral-900">
              Download Murugo Homes
            </h1>
            <p className="text-neutral-600 mb-8 max-w-xl mx-auto text-sm md:text-base">
              Get the Android app to browse properties, save favorites, and contact listers on the go. Your perfect home is just a tap away.
            </p>

            <a href={APK_URL} download={APK_FILENAME} target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg" 
                className="gap-2 w-full sm:w-auto min-w-[240px] h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
              >
                <Download className="h-5 w-5" />
                Download for Android
              </Button>
            </a>

            <p className="text-xs text-neutral-500 mt-4">
              APK · Android 5.0 or higher · Free
            </p>
          </div>

          {/* Features */}
          <div className="border-t border-neutral-200 bg-gradient-to-br from-neutral-50 to-white px-8 md:px-12 py-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">Fast & Smooth</h3>
                <p className="text-xs text-neutral-600">
                  Browse properties with lightning-fast performance
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">Save Favorites</h3>
                <p className="text-xs text-neutral-600">
                  Keep track of properties you love
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">Secure</h3>
                <p className="text-xs text-neutral-600">
                  Your data is protected and private
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:p-8">
          <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            How to Install
          </h2>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                1
              </span>
              <span className="text-sm text-neutral-700 pt-0.5">
                Tap <strong>&quot;Download for Android&quot;</strong> above to start the download.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                2
              </span>
              <span className="text-sm text-neutral-700 pt-0.5">
                When the download finishes, open the file from your notifications or Downloads folder.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                3
              </span>
              <span className="text-sm text-neutral-700 pt-0.5">
                If asked, allow installation from this source (Chrome or your browser).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                4
              </span>
              <span className="text-sm text-neutral-700 pt-0.5">
                Tap <strong>&quot;Install&quot;</strong> and open the app when done. Enjoy!
              </span>
            </li>
          </ol>
        </div>

        {/* Alternative CTA */}
        <div className="mt-8 text-center bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-700">
            Prefer the website?{" "}
            <Link href="/properties" className="text-primary hover:underline font-medium">
              Browse properties on the web
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
