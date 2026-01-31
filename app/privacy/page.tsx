import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-primary selection:text-black">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-2 text-white">Privacy Policy</h1>
          <p className="text-gray-500 font-mono text-sm mb-12">Last Updated: January 30, 2026</p>
          
          <div className="prose prose-invert prose-lg max-w-none space-y-12 text-gray-300">
            <section>
              <p>
                At AudioGenes, your privacy is paramount. This Privacy Policy explains how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li><strong>Account Information:</strong> When you register, we collect your name, email address, and password.</li>
                <li><strong>Profile Data:</strong> Information you choose to add to your user profile, such as a biography, social media links, and profile picture.</li>
                <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products you have purchased from us. We do not store full credit card numbers; these are handled by our payment processor (Stripe).</li>
                <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited, beats played, and interactions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">How We Use Your Information</h2>
              <p>
                We use your data to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>Provide and maintain the AudioGenes platform.</li>
                <li>Process transactions and send purchase confirmations.</li>
                <li>Send you technical notices, updates, security alerts, and support messages.</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our Service.</li>
                <li>Personalize our Service, including by providing content and features that match your interests.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Data Protection</h2>
              <p>
                We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Sharing of Information</h2>
              <p>
                We do not sell your personal information. We may share information with:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>Service providers who assist our business operations (e.g., payment processing, hosting).</li>
                <li>Law enforcement bodies when required by law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal information. You can manage most of your data directly through your account settings dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Contact</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@audiogenes.com.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
