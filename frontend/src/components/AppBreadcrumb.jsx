import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AppBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Determine which dashboard to link to based on role (user or admin)
  const role = pathnames[0]; // 'user' or 'admin'
  const dashboardPath = `/${role}/dashboard`;
  const isDashboard = location.pathname === dashboardPath;

  // Get segments after the role, excluding 'dashboard'
  const segments = pathnames.slice(1).filter((s) => s !== 'dashboard');

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isDashboard ? (
            <BreadcrumbPage className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
              Dashboard
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link to={dashboardPath} className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const path = `/${role}/${segments.slice(0, index + 1).join('/')}`;
          const displayName = segment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
                    {displayName}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path} className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
                      {displayName}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
