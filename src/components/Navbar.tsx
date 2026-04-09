import { Shield } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="h-16 border-bottom border-neutral-200 bg-white px-6 flex items-center gap-2 shrink-0">
      <div className="p-1.5 bg-neutral-900 text-white rounded-lg">
        <Shield className="w-5 h-5" />
      </div>
      <span className="font-bold text-lg tracking-tight">DocuIntel AI</span>
    </nav>
  );
}
