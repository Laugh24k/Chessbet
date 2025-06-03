import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { NotificationPanel } from '@/components/notification-panel';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { logout } = useAuth();
  const { connectWallet, ready } = usePrivy();
  const { wallets } = useWallets();
  const [activeTab, setActiveTab] = useState('general');

  const handleExit = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleConnectSolanaWallet = () => {
    if (ready) {
      connectWallet();
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'fas fa-cog' },
    { id: 'wallet', label: 'Wallet', icon: 'fas fa-wallet' },
    { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
    { id: 'account', label: 'Account', icon: 'fas fa-user' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-dark-800 border-dark-600">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
                }`}
              >
                <i className={tab.icon} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <Card className="bg-dark-700 border-dark-600">
                  <CardHeader>
                    <CardTitle className="text-white">Game Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Auto-accept skill-matched games</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Show board coordinates</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Enable sound effects</span>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-dark-700 border-dark-600">
                  <CardHeader>
                    <CardTitle className="text-white">Display</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Dark mode</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Compact view</span>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-4">
                <Card className="bg-dark-700 border-dark-600">
                  <CardHeader>
                    <CardTitle className="text-white">Solana Wallet Connection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {wallets.length > 0 ? (
                      <div className="space-y-3">
                        {wallets.map((wallet, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-dark-600 rounded-lg">
                            <div>
                              <div className="text-white font-medium">
                                {wallet.walletClientType} Wallet
                              </div>
                              <div className="text-gray-400 text-sm">
                                {wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                              <span className="text-green-400 text-sm">Connected</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <i className="fas fa-wallet text-gray-600 text-4xl mb-4" />
                        <p className="text-gray-400 mb-4">No Solana wallet connected</p>
                        <Button 
                          onClick={handleConnectSolanaWallet}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <i className="fas fa-plus mr-2" />
                          Connect Solana Wallet
                        </Button>
                      </div>
                    )}
                    
                    <div className="mt-6 p-4 bg-blue-900 rounded-lg border border-blue-800">
                      <h4 className="text-blue-200 font-medium mb-2">
                        <i className="fas fa-info-circle mr-2" />
                        Self-Custodial Wallet
                      </h4>
                      <p className="text-blue-300 text-sm">
                        Your wallet is self-custodial, meaning you control your private keys. 
                        You can export your private key at any time from the wallet page.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-dark-700 border-dark-600">
                  <CardHeader>
                    <CardTitle className="text-white">Network Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 bg-green-900 rounded-lg border border-green-800">
                      <div>
                        <div className="text-green-200 font-medium">Solana Network</div>
                        <div className="text-green-300 text-sm">Primary network for all transactions</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-sm">Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <NotificationPanel />
            )}

            {activeTab === 'account' && (
              <div className="space-y-4">
                <Card className="bg-dark-700 border-dark-600">
                  <CardHeader>
                    <CardTitle className="text-white">Account Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-red-900 rounded-lg border border-red-800">
                      <h4 className="text-red-200 font-medium mb-2">Exit Application</h4>
                      <p className="text-red-300 text-sm mb-4">
                        This will log you out and return you to the home page. 
                        Your game progress and wallet will be saved.
                      </p>
                      <Button 
                        onClick={handleExit}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <i className="fas fa-sign-out-alt mr-2" />
                        Exit Application
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-dark-700 border-dark-600">
                  <CardHeader>
                    <CardTitle className="text-white">Data & Privacy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Share analytics data</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">Allow promotional emails</span>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}