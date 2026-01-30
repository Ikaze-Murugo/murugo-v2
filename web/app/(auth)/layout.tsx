import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text">
              Murugo Homes
            </h1>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Find your perfect property in Rwanda
          </p>
        </div>

        {/* Auth content */}
        {children}
      </div>
    </div>
  );
}
