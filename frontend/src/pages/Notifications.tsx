import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { Bell, Percent, CheckCheck, MapPin } from 'lucide-react';
import { notificationApi, type AppNotification } from '@/api/notifications';

export default function Notifications() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list({ limit: 50 }),
  });

  const markAll = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const items: AppNotification[] = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Real-time matched-opportunity alerts</p>
        </div>
        {items.some((n) => !n.read) && (
          <Button size="sm" onClick={() => markAll.mutate()}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-gray-500">Loading…</p>}
        {!isLoading && items.length === 0 && (
          <EmptyState title="No notifications" description="We'll alert you here when a new opportunity matches your skills." />
        )}
        {items.map((n) => (
          <Card key={n.id} className={`p-4 ${!n.read ? 'ring-1 ring-blue-200 bg-blue-50/40' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-2 rounded-lg ${!n.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  {n.type === 'opportunity_match' || n.type === 'freelance_match' ? <MapPin className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-navy-900">{n.title}</h3>
                    {(n.type === 'opportunity_match' || n.type === 'freelance_match') && /%/.test(n.title) && (
                      <Badge size="sm" variant="outline" className="!text-green-600">
                        <Percent className="w-3 h-3 mr-0.5" />match
                      </Badge>
                    )}
                    {!n.read && <Badge size="sm" variant="default" className="!bg-blue-500 !text-white">New</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                </div>
              </div>
              {n.link && (
                <Button size="sm" variant="outline" onClick={() => navigate(n.link ?? '/')}>
                  Go
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
