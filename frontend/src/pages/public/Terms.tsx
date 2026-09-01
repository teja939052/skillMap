import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-navy-900">Skill Map</span>
          </Link>
          <Link to="/login">
            <span className="text-sm font-medium text-gray-600 hover:text-navy-900 transition-colors">Sign In</span>
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: September 1, 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using Skill Map ("the Platform"), you agree to be bound by these Terms and Conditions.
                If you do not agree to these terms, please do not use the Platform. These terms apply to all users,
                including students, faculty, industry partners, and institutional administrators.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed">
                Skill Map is an Academia × Industry Competency Intelligence Platform that enables students to build
                evidence-backed competency profiles, institutions to align curriculum with industry demand, and
                industry partners to discover matched candidates. The Platform provides competency mapping, gap
                analysis, assessment tools, and opportunity matching services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">3. User Accounts</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must notify us immediately of any unauthorized use of your account.</li>
                <li>One person or entity may not maintain more than one account without authorization.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">4. User Responsibilities</h2>
              <p className="text-gray-600 leading-relaxed">You agree to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
                <li>Provide truthful and accurate information in your profile and evidence submissions.</li>
                <li>Not misrepresent your competencies, qualifications, or affiliations.</li>
                <li>Not attempt to gain unauthorized access to any part of the Platform.</li>
                <li>Not use the Platform for any unlawful purpose or in violation of these terms.</li>
                <li>Not upload false, misleading, or fraudulent evidence documents.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">5. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                The Platform, including its design, features, algorithms, and content, is the intellectual property
                of Skill Map. You retain ownership of the content you upload, but by uploading, you grant Skill Map
                a non-exclusive license to display and process your content for the purpose of providing the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">6. Data and Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Your use of the Platform is also governed by our Privacy Policy. By using the Platform, you consent
                to the collection and use of your information as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">7. Evidence and Verification</h2>
              <p className="text-gray-600 leading-relaxed">
                Skill Map provides tools for evidence upload and verification. However, Skill Map does not guarantee
                the accuracy of any user-submitted evidence. Verification processes are conducted in good faith but
                are not a guarantee of authenticity. Users are encouraged to report suspected fraudulent evidence.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">8. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                The Platform is provided "as is" without warranties of any kind. Skill Map shall not be liable for
                any indirect, incidental, or consequential damages arising from your use of the Platform. We do not
                guarantee employment, internship, or any specific outcome from using our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">9. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to suspend or terminate your account at our discretion, without prior notice,
                for conduct that we determine violates these Terms or is harmful to other users, the Platform,
                or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">10. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We may modify these Terms at any time. Continued use of the Platform after changes constitutes
                acceptance of the revised Terms. Material changes will be notified via email or Platform notification.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">11. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes
                arising from these terms shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">12. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                For any questions regarding these Terms and Conditions, please contact us through the Platform's
                support channels.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 border-t border-gray-200">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-navy-900">Skill Map</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-xs text-gray-500 hover:text-accent transition-colors">Terms</Link>
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-accent transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
