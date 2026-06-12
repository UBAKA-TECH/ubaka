"use client";

import dynamic from "next/dynamic";
import "../src/i18n"; // Import SPA translations

const App = dynamic(() => import("../src/App"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-cream-100 dark:bg-charcoal-900">
      <div className="w-12 h-12 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin"></div>
    </div>
  )
});

export default function SPAContainer() {
  return <App />;
}
