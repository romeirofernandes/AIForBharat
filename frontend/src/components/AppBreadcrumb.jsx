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
  const rawSegments = pathnames.slice(1).filter((s) => s !== 'dashboard');

  // Merge numeric ID segments into the previous segment label as "Details"
  const segments = [];
  for (let i = 0; i < rawSegments.length; i++) {
    const seg = rawSegments[i];
    const isNumericId = /^\d+$/.test(seg);
    if (isNumericId && segments.length > 0) {
      const prev = segments[segments.length - 1];
      segments[segments.length - 1] = {
        key: prev.key + '/' + seg,
        path: `/${role}/${rawSegments.slice(0, i + 1).join('/')}`,
        displayName: prev.displayName.replace(/ Details$/, '') + ' Details',
      };
    } else {
      const displayName = seg.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const path = `/${role}/${rawSegments.slice(0, i + 1).join('/')}`;
      segments.push({ key: seg, path, displayName });
    }
  }

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

        {segments.map(({ key, path, displayName }, index) => {
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={key}>
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
