import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

export function NotificationPanel() {
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  const notificationTypes = {
    game_invite: {
      icon: 'fas fa-chess',
      color: 'bg-blue-600',
      title: 'Game Invitation',
      description: 'Someone has challenged you to a chess match with SOL betting'
    },
    tournament_update: {
      icon: 'fas fa-trophy',
      color: 'bg-purple-600',
      title: 'Tournament Update',
      description: 'Updates about tournaments you joined - new rounds, eliminations, or prize distributions'
    },
    wallet_transaction: {
      icon: 'fas fa-wallet',
      color: 'bg-green-600',
      title: 'Wallet Transaction',
      description: 'Deposits, withdrawals, winnings, or other wallet balance changes'
    }
  };

  return (
    <div className="space-y-4">
      {/* Notification Type Explanations */}
      <Card className="bg-dark-700 border-dark-600">
        <CardHeader>
          <CardTitle className="text-white">What These 3 Notifications Mean</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notificationTypes).map(([type, info]) => (
            <div key={type} className="flex items-start gap-3 p-3 bg-dark-600 rounded-lg">
              <div className={`${info.color} p-2 rounded-full flex-shrink-0`}>
                <i className={`${info.icon} text-white text-sm`} />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">{info.title}</h4>
                <p className="text-gray-400 text-sm mt-1">{info.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-dark-700 border-dark-600">
        <CardHeader>
          <CardTitle className="text-white">Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-dark-600 rounded-lg">
            <span className="text-white">Game Invites</span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-dark-600 rounded-lg">
            <span className="text-white">Tournament Updates</span>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-dark-600 rounded-lg">
            <span className="text-white">Wallet Notifications</span>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              Enabled
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}