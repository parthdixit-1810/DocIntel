import { User } from 'firebase/auth';
import { Button } from './ui/button';
import { LogOut, Shield, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className="h-16 border-bottom border-neutral-200 bg-white px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-neutral-900 text-white rounded-lg">
          <Shield className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight">DocuIntel AI</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-full border border-neutral-100">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <UserIcon className="w-4 h-4 text-neutral-500" />
          )}
          <span className="text-sm font-medium text-neutral-700">{user.displayName}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} className="text-neutral-500 hover:text-red-600">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
}
