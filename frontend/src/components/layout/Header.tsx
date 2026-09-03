import { Search, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui';
import { Dropdown, DropdownItem, DropdownDivider, DropdownLabel } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 ml-12 lg:ml-0">
        {title && (
          <div>
            <h1 className="text-lg font-semibold text-navy-900">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 w-64">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-navy-700 placeholder:text-gray-400 outline-none w-full"
          />
        </div>

        <NotificationBell />

        <button className="p-2 text-gray-500 hover:text-navy-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="h-5 w-5" />
        </button>

        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <Avatar name={user?.name ?? 'User'} src={user?.avatar} size="sm" />
            </button>
          }
        >
          <DropdownLabel>Account</DropdownLabel>
          <DropdownItem onClick={() => navigate(`/${user?.role === 'platform_admin' ? 'admin' : user?.role === 'institution_admin' ? 'institution' : user?.role}/dashboard`)}>
            Dashboard
          </DropdownItem>
          <DropdownItem onClick={() => navigate('/settings')}>
            Settings
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={() => {}} variant="danger">
            Sign Out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
