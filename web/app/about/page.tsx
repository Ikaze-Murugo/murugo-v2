export const metadata = {
  title: "About us",
  description: "Learn about Murugo Homes and our mission to connect people with properties across Rwanda.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          About Murugo Homes
        </h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Murugo Homes is Rwanda&apos;s trusted platform for finding and listing properties. We connect
          renters, buyers, and sellers with quality homes, apartments, offices, and land across
          Kigali and beyond.
        </p>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To make property search and listing simple, transparent, and accessible for everyone—
              whether you&apos;re looking for a place to rent, a home to buy, or a way to list your
              property.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">What we offer</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Browse properties by type, location, and transaction (rent, sale, lease)</li>
              <li>Direct connection with listers—individuals, commissioners, and companies</li>
              <li>Secure listings and verified profiles</li>
              <li>Mobile app coming soon for on-the-go search</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground">
              Have questions? Visit our{" "}
              <a href="/contact" className="text-primary underline hover:no-underline">
                Contact us
              </a>{" "}
              page to get in touch.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
