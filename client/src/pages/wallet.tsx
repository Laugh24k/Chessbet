import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useWallets, usePrivy } from '@privy-io/react-auth';

export default function Wallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { wallets } = useWallets();
  const { exportWallet } = usePrivy();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Get user balance and transaction history
  const { data: balanceData } = useQuery({
    queryKey: ['/api/user/balance', user?.id],
    enabled: !!user?.id
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['/api/user/transactions', user?.id],
    enabled: !!user?.id
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: string; type: string }) => {
      const response = await apiRequest("POST", "/api/deposits", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Initiated",
        description: "Your deposit has been processed successfully",
      });
      setDepositAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit",
        variant: "destructive",
      });
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: string; address: string }) => {
      const response = await apiRequest("POST", "/api/withdrawals", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Initiated",
        description: "Your withdrawal has been processed successfully",
      });
      setWithdrawAmount('');
      setWithdrawAddress('');
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      amount: depositAmount,
      type: 'solana_wallet'
    });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Solana address",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      amount: withdrawAmount,
      address: withdrawAddress
    });
  };

  const handleExportPrivateKey = async () => {
    try {
      if (wallets.length > 0) {
        await exportWallet();
        toast({
          title: "Private Key Export",
          description: "Private key export initiated. Check your screen for the secure display.",
        });
      } else {
        toast({
          title: "No Wallet Found",
          description: "Please connect a wallet first",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export private key",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
          <p className="text-gray-400">Manage your SOL balance and transactions</p>
        </div>

        {/* Balance Card */}
        <Card className="bg-dark-700 border-dark-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <i className="fas fa-wallet text-primary" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-4">
              {balanceData?.balance || '0.00'} SOL
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={handleExportPrivateKey}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <i className="fas fa-key mr-2" />
                Export Private Key
              </Button>
              <div className="text-sm text-gray-400">
                <p>Self-custodial wallet - You control your keys</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deposit Card */}
          <Card className="bg-dark-700 border-dark-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <i className="fas fa-arrow-down text-green-400" />
                Deposit SOL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="deposit-amount" className="text-white">Amount (SOL)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  step="0.001"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-dark-600 border-dark-500 text-white"
                />
              </div>
              <Button 
                onClick={handleDeposit}
                disabled={depositMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {depositMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-arrow-down mr-2" />
                    Deposit from Wallet
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-400">
                Deposit directly from your connected Solana wallet
              </p>
            </CardContent>
          </Card>

          {/* Withdraw Card */}
          <Card className="bg-dark-700 border-dark-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <i className="fas fa-arrow-up text-red-400" />
                Withdraw SOL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="withdraw-amount" className="text-white">Amount (SOL)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  step="0.001"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-dark-600 border-dark-500 text-white"
                />
              </div>
              <div>
                <Label htmlFor="withdraw-address" className="text-white">Solana Address</Label>
                <Input
                  id="withdraw-address"
                  placeholder="Enter Solana wallet address"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="bg-dark-600 border-dark-500 text-white"
                />
              </div>
              <Button 
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {withdrawMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-arrow-up mr-2" />
                    Withdraw to Address
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-400">
                Withdraw to any Solana wallet address
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="bg-dark-700 border-dark-600">
          <CardHeader>
            <CardTitle className="text-white">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsData?.transactions?.length > 0 ? (
              <div className="space-y-3">
                {transactionsData.transactions.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 bg-dark-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <i className={`fas ${tx.type === 'deposit' ? 'fa-arrow-down text-green-400' : 'fa-arrow-up text-red-400'}`} />
                      <div>
                        <div className="text-white font-medium capitalize">{tx.type}</div>
                        <div className="text-gray-400 text-sm">{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}{tx.amount} SOL
                      </div>
                      <div className="text-gray-400 text-sm">{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-history text-gray-600 text-4xl mb-4" />
                <p className="text-gray-400">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}