"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { QuickExpenseButton } from "./QuickExpenseButton";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Bills", href: "/bills", icon: "💳" },
  { name: "Income", href: "/income", icon: "💰" },
  { name: "Expenses", href: "/expenses", icon: "🛒" },
  { name: "Calendar", href: "/calendar", icon: "📅" },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Nav Links */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center mr-8">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💰</span>
                  <h1 className="text-xl font-bold text-brand-navy">
                    Finance Manager
                  </h1>
                </div>
              </div>
              <div className="hidden sm:flex sm:space-x-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-brand-navy text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100 hover:text-brand-navy"
                      }`}
                    >
                      <span className="mr-2 text-base">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              {session?.user && (
                <>
                  <div className="hidden md:block text-sm text-right">
                    <p className="text-xs text-gray-500">Logged in as</p>
                    <p className="font-bold text-brand-navy">
                      {session.user.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden border-t border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto py-3 px-4 space-x-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex-shrink-0 inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-brand-navy text-white shadow-md"
                      : "text-gray-700 bg-white hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-1.5 text-sm">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Quick Expense Floating Button */}
      <QuickExpenseButton />
    </div>
  );
}
