import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "About Us",
  description: "Learn more about NextCommerse and our mission",
};

export default function AboutPage() {
  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            About NextCommerse
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            NextCommerse is an African-focused e-commerce platform built to make
            online shopping reliable, accessible, and secure for everyday
            customers and growing businesses.
          </p>
        </section>

        <section className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border p-5">
            <h2 className="text-lg font-semibold">Our Mission</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Empower local commerce with modern tools that connect buyers and
              sellers across Africa.
            </p>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="text-lg font-semibold">What We Offer</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Curated products, secure checkout, multiple payment options, and
              real-time order updates.
            </p>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="text-lg font-semibold">Why Trust Us</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We focus on dependable delivery workflows, transparent pricing,
              and customer-first support.
            </p>
          </div>
        </section>

        <section className="mb-10 rounded-lg border p-6">
          <h2 className="text-2xl font-semibold">Our Values</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Customer-first experience in every interaction</li>
            <li>Honest pricing and transparent order tracking</li>
            <li>Reliable technology that scales with local businesses</li>
            <li>Inclusive commerce for diverse markets and communities</li>
          </ul>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Questions, partnerships, or support requests? Reach us at
            biileprinceyennuyar5@gmail.com. | 0555902675
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
