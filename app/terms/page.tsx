import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-primary selection:text-black">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-2 text-white">Terms of Service</h1>
          <p className="text-gray-500 font-mono text-sm mb-12">Last Updated: January 30, 2026</p>
          
          <div className="prose prose-invert prose-lg max-w-none space-y-12 text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
              <p>
                Welcome to AudioGenes ("we," "our," or "us"). By accessing or using our website, services, and tools, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2. Account Registration</h2>
              <p>
                To access certain features, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3. Licensing and Usage</h2>
              <p className="mb-4">
                AudioGenes facilitates the licensing of musical beats between Producers (sellers) and Artists (buyers).
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li><strong>Non-Exclusive Licenses:</strong> Beats may be sold to multiple artists. The specific rights granted (streams, distribution, performance) are defined in the license agreement selected at checkout.</li>
                <li><strong>Exclusive Licenses:</strong> Once an exclusive license is purchased, the beat is removed from the marketplace and cannot be sold to others. Previous non-exclusive licensees maintain their rights according to their agreements.</li>
                <li><strong>Prohibited Use:</strong> You may not untag "tagged" beats without purchasing a license. You may not resell the beat files themselves.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4. Payments and Refunds</h2>
              <p>
                All payments are processed securely. Due to the digital nature of our products, all sales are final and non-refundable unless otherwise required by law or in cases of proven technical failure preventing access to the files.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Intellectual Property</h2>
              <p>
                Producers retain full ownership of the copyright in the underlying musical composition and sound recording of their beats, subject to the licenses granted to buyers. Artists own the copyright in their new derivative works (vocals + beat) created using licensed beats, subject to the terms of the license.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. User Conduct</h2>
              <p>
                You agree not to use the Service to upload content that is illegal, offensive, or infringes on the rights of others. We reserve the right to suspend or terminate accounts that violate these guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">7. Limitation of Liability</h2>
              <p>
                AudioGenes is a marketplace platform. We are not a record label or publisher. We are not liable for any disputes between users regarding ownership, royalties, or clearing of samples, beyond the scope of the standard license templates provided.
              </p>
            </section>

             <section>
              <h2 className="text-xl font-bold text-white mb-4">8. Contact</h2>
              <p>
                For questions regarding these Terms, please contact us at legal@audiogenes.com.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
