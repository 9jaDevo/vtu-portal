import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  // Optional: A custom mapping for path segments to display names
  pathMap?: { [key: string]: string };
}

export function Breadcrumbs({ pathMap = {} }: BreadcrumbsProps) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbs: BreadcrumbItem[] = [];

  // Determine the base link (Home, Dashboard, or Admin)
  if (location.pathname.startsWith('/dashboard')) {
    breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });
  } else if (location.pathname.startsWith('/admin')) {
    breadcrumbs.push({ label: 'Admin', path: '/admin' });
  } else if (location.pathname !== '/') { // Only add Home if not already on root
    breadcrumbs.push({ label: 'Home', path: '/' });
  }

  pathnames.forEach((name, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    const displayName = pathMap[name] || name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    // Skip the initial 'dashboard' or 'admin' segment if already added as base
    if ((location.pathname.startsWith('/dashboard') && name === 'dashboard') ||
        (location.pathname.startsWith('/admin') && name === 'admin')) {
      return;
    }

    breadcrumbs.push({
      label: displayName,
      path: routeTo,
    });
  });

  // If only "Home" or base dashboard/admin is present, don't show breadcrumbs
  if (breadcrumbs.length <= 1 && (location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/admin')) {
    return null;
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1 rtl:rotate-180" />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}