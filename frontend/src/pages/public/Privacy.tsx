import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Privacy() {
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
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: September 1, 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Skill Map ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our Platform.
                Please read this policy carefully. By using the Platform, you consent to the practices described herein.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">2. Information We Collect</h2>
              <h3 className="text-base font-medium text-navy-900 mb-2">2.1 Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Name, email address, and contact information provided during registration.</li>
                <li>Profile information including educational background, skills, and experience.</li>
                <li>Authentication data (passwords are encrypted and cannot be accessed by us).</li>
                <li>OAuth data (if you sign in via Google or other providers).</li>
              </ul>

              <h3 className="text-base font-medium text-navy-900 mb-2 mt-4">2.2 Competency and Evidence Data</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Assessment results and scores.</li>
                <li>Uploaded evidence documents (certificates, project files, etc.).</li>
                <li>Competency profiles and proficiency levels.</li>
                <li>Growth plans and learning progress.</li>
              </ul>

              <h3 className="text-base font-medium text-navy-900 mb-2 mt-4">2.3 Usage Data</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Log data including IP address, browser type, and pages visited.</li>
                <li>Device information and operating system.</li>
                <li>Interaction data such as feature usage and session duration.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>To provide, maintain, and improve the Platform's features and services.</li>
                <li>To match students with opportunities based on competency profiles.</li>
                <li>To generate analytics and insights for institutions and industry partners.</li>
                <li>To verify evidence and maintain the integrity of competency claims.</li>
                <li>To communicate with you about updates, security, and support.</li>
                <li>To personalize your experience and deliver relevant content.</li>
                <li>To comply with legal obligations and prevent fraud.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">4. Information Sharing</h2>
              <p className="text-gray-600 leading-relaxed">We may share your information with:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
                <li><strong>Institutions:</strong> Your competency profile and progress data may be shared with your affiliated educational institution for academic and administrative purposes.</li>
                <li><strong>Industry Partners:</strong> Anonymized or profile-level data may be shared with industry partners for opportunity matching. Personal identifiers are only shared with your explicit consent.</li>
                <li><strong>Service Providers:</strong> Third-party services that help us operate the Platform (hosting, analytics, etc.) under strict confidentiality agreements.</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">5. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement industry-standard security measures including encryption in transit (TLS/SSL),
                encrypted password storage, access controls, and regular security audits. However, no method
                of electronic transmission is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">6. Data Retention</h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide
                services. You may request deletion of your account and associated data at any time. Some information
                may be retained in anonymized form for analytics purposes or as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">7. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
                <li>Access and download your personal data.</li>
                <li>Correct inaccurate or incomplete information.</li>
                <li>Request deletion of your personal data.</li>
                <li>Withdraw consent for data processing (where applicable).</li>
                <li>Object to certain types of data processing.</li>
                <li>Lodge a complaint with a data protection authority.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">8. Cookies and Tracking</h2>
              <p className="text-gray-600 leading-relaxed">
                We use essential cookies for authentication and session management. Analytics cookies may be used
                to understand Platform usage. You can control cookie preferences through your browser settings.
                Disabling cookies may affect Platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">9. Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                The Platform is not intended for users under the age of 13. We do not knowingly collect personal
                information from children under 13. If we become aware of such collection, we will delete the data promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">10. Third-Party Links</h2>
              <p className="text-gray-600 leading-relaxed">
                The Platform may contain links to third-party websites or services. We are not responsible for the
                privacy practices or content of these third parties. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">11. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes via
                email or a prominent notice on the Platform. Continued use after changes constitutes acceptance
                of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy-900 mb-3">12. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions or concerns about this Privacy Policy or your data, please contact us through
                the Platform's support channels or at the email provided in the application settings.
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
