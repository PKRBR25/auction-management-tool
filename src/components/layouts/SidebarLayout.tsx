import { ReactNode } from 'react';
import Link from 'next/link';
import {
  UserIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

interface SidebarLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Users', href: '/users', icon: UserIcon },
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Auctions', href: '/auctions', icon: ClipboardDocumentListIcon },
  { name: 'Participants', href: '/participants', icon: UsersIcon },
  { name: 'Start New Auction', href: '/auctions/new', icon: PlusCircleIcon },
];

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <img
                className="h-8 w-auto"
                src="/vercel.svg"
                alt="Your Company"
              />
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <item.icon
                      className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
