"use client";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col">
      {/* Main content area - full height on mobile, accounting for header and bottom nav */}
      <div className="flex-1 overflow-hidden md:pt-0">
        {children}
      </div>
    </div>
  );
}
