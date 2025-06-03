import { Header } from "@/components/ui/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-dark-700 border-dark-600">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Terms of Service</CardTitle>
            <p className="text-gray-400 text-center">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-300">
                  By accessing and using ChessWager, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
                <p className="text-gray-300">
                  You must be at least 18 years old to use our service. By using ChessWager, you represent and warrant that 
                  you are at least 18 years old and have the legal capacity to enter into this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Account Security</h2>
                <p className="text-gray-300">
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept 
                  responsibility for all activities that occur under your account or password.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Betting and Wagering</h2>
                <p className="text-gray-300">
                  All bets placed on ChessWager are final. Players must have sufficient balance in their account before 
                  creating or joining games. Winnings are automatically distributed to the winner's account upon game completion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Fair Play</h2>
                <p className="text-gray-300">
                  Players must play fair and not use any chess engines, assistance software, or receive help from other players 
                  during games. Violation of fair play rules may result in account suspension or termination.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Deposits and Withdrawals</h2>
                <p className="text-gray-300">
                  All transactions are processed on the Solana blockchain. Deposit and withdrawal processing times may vary 
                  based on network conditions. ChessWager is not responsible for blockchain network delays or failures.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Prohibited Activities</h2>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Using multiple accounts to gain unfair advantage</li>
                  <li>Colluding with other players</li>
                  <li>Using automated software or bots</li>
                  <li>Harassment or inappropriate behavior</li>
                  <li>Money laundering or other illegal activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                <p className="text-gray-300">
                  ChessWager shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Privacy Policy</h2>
                <p className="text-gray-300">
                  Your privacy is important to us. We collect and use personal information only as described in our Privacy Policy. 
                  By using our service, you consent to the collection and use of information in accordance with our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Modifications</h2>
                <p className="text-gray-300">
                  ChessWager reserves the right to modify these terms at any time. We will notify users of any material changes 
                  via email or through the platform. Continued use of the service after changes constitutes acceptance of new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
                <p className="text-gray-300">
                  If you have any questions about these Terms of Service, please contact us at support@chesswager.com
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
