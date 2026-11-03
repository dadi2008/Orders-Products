type PageSkeletonVariant =
  | "orders"
  | "groups"
  | "products"
  | "users"
  | "settings"
  | "analytics"
  | "auth"
  | "application";

type PageSkeletonProps = {
  variant?: PageSkeletonVariant;
  compact?: boolean;
};

const rows = Array.from({ length: 5 }, (_, index) => index);

export function PageSkeleton({ variant = "orders", compact = false }: PageSkeletonProps) {
  if (variant === "auth") return <AuthSkeleton />;
  if (variant === "application") return <ApplicationSkeleton />;

  return (
    <section className={`page page-skeleton page-skeleton--${variant}`} aria-busy="true" aria-label="Loading">
      {!compact && (
        <div className="page-skeleton__heading">
          <i className="skeleton skeleton--round" />
          <i className="skeleton skeleton--title" />
        </div>
      )}
      {variant === "orders" ? (
        <OrdersSkeleton />
      ) : variant === "groups" ? (
        <GroupsSkeleton />
      ) : variant === "products" ? (
        <ProductsSkeleton />
      ) : variant === "users" ? (
        <UsersSkeleton />
      ) : variant === "settings" ? (
        <SettingsSkeleton />
      ) : (
        <AnalyticsSkeleton />
      )}
    </section>
  );
}

function OrdersSkeleton() {
  return (
    <div className="page-skeleton__orders">
      {Array.from({ length: 4 }, (_, index) => (
        <article className="page-skeleton__order-row" key={index}>
          <i className="skeleton skeleton--line skeleton--line-wide" />
          <div className="page-skeleton__order-count">
            <i className="skeleton skeleton--list-icon" />
            <div>
              <i className="skeleton skeleton--number" />
              <i className="skeleton skeleton--caption" />
            </div>
          </div>
          <div className="page-skeleton__date">
            <i className="skeleton skeleton--caption" />
            <i className="skeleton skeleton--date-line" />
          </div>
          <div className="page-skeleton__money">
            <i className="skeleton skeleton--caption" />
            <i className="skeleton skeleton--caption" />
          </div>
          <i className="skeleton skeleton--delete" />
        </article>
      ))}
    </div>
  );
}

function GroupsSkeleton() {
  return (
    <div className="page-skeleton__split">
      <GroupCardsSkeleton />
      <article className="page-skeleton__details">
        <i className="skeleton skeleton--line skeleton--line-wide" />
        <i className="skeleton skeleton--line skeleton--line-short" />
        {Array.from({ length: 4 }, (_, index) => (
          <div className="page-skeleton__detail-row" key={index}>
            <i className="skeleton skeleton--thumbnail" />
            <i className="skeleton skeleton--line" />
            <i className="skeleton skeleton--status" />
          </div>
        ))}
      </article>
    </div>
  );
}

function GroupCardsSkeleton() {
  return (
    <div className="page-skeleton__groups-list">
      {Array.from({ length: 4 }, (_, index) => (
        <article className="page-skeleton__group-row" key={index}>
          <i className="skeleton skeleton--line skeleton--line-wide" />
          <div className="page-skeleton__order-count">
            <i className="skeleton skeleton--list-icon" />
            <div>
              <i className="skeleton skeleton--number" />
              <i className="skeleton skeleton--caption" />
            </div>
          </div>
          <div className="page-skeleton__date">
            <i className="skeleton skeleton--caption" />
            <i className="skeleton skeleton--date-line" />
          </div>
        </article>
      ))}
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="page-skeleton__products">
      {Array.from({ length: 6 }, (_, index) => (
        <article className="page-skeleton__product-row" key={index}>
          <i className="skeleton skeleton--dot" />
          <i className="skeleton skeleton--thumbnail" />
          <div className="page-skeleton__product-description">
            <i className="skeleton skeleton--line skeleton--line-wide" />
            <i className="skeleton skeleton--caption" />
          </div>
          <i className="skeleton skeleton--status" />
          <div className="page-skeleton__guarantee">
            <i className="skeleton skeleton--caption" />
            <i className="skeleton skeleton--caption" />
          </div>
          <i className="skeleton skeleton--caption" />
          <div className="page-skeleton__money">
            <i className="skeleton skeleton--caption" />
            <i className="skeleton skeleton--caption" />
          </div>
          <i className="skeleton skeleton--line skeleton--line-medium" />
          <div className="page-skeleton__date">
            <i className="skeleton skeleton--caption" />
            <i className="skeleton skeleton--date-line" />
          </div>
          <i className="skeleton skeleton--delete" />
        </article>
      ))}
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="page-skeleton__users">
      <div className="page-skeleton__user-row page-skeleton__user-row--head">
        <i className="skeleton skeleton--line" />
        <i className="skeleton skeleton--line" />
        <i className="skeleton skeleton--line" />
      </div>
      {rows.map((index) => (
        <div className="page-skeleton__user-row" key={index}>
          <i className="skeleton skeleton--line skeleton--line-medium" />
          <i className="skeleton skeleton--line skeleton--line-wide" />
          <i className="skeleton skeleton--line skeleton--line-short" />
        </div>
      ))}
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <article className="page-skeleton__settings">
      <i className="skeleton skeleton--avatar" />
      <i className="skeleton skeleton--line skeleton--line-short" />
      <i className="skeleton skeleton--input" />
      <i className="skeleton skeleton--line skeleton--line-short" />
      <i className="skeleton skeleton--input" />
      <i className="skeleton skeleton--button" />
    </article>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="page-skeleton__analytics">
      {rows.slice(0, 2).map((index) => (
        <article className="page-skeleton__analytics-card" key={index}>
          <i className="skeleton skeleton--line skeleton--line-medium" />
          <i className="skeleton skeleton--line skeleton--line-short" />
          <div className="page-skeleton__chart">
            {rows.map((bar) => (
              <i className="skeleton" key={bar} />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function AuthSkeleton() {
  return (
    <main className="auth-page" aria-busy="true" aria-label="Loading">
      <section className="auth-card auth-card--skeleton">
        <div className="auth-card__header">
          <i className="skeleton skeleton--logo" />
          <i className="skeleton skeleton--language" />
        </div>
        <i className="skeleton skeleton--auth-title" />
        <i className="skeleton skeleton--line skeleton--line-short" />
        <i className="skeleton skeleton--input" />
        <i className="skeleton skeleton--line skeleton--line-short" />
        <i className="skeleton skeleton--input" />
        <i className="skeleton skeleton--button" />
      </section>
    </main>
  );
}

function ApplicationSkeleton() {
  return (
    <div className="application-skeleton" aria-busy="true" aria-label="Loading">
      <header className="application-skeleton__top">
        <i className="skeleton skeleton--logo" />
        <i className="skeleton application-skeleton__search" />
      </header>
      <aside className="application-skeleton__navigation">
        <i className="skeleton skeleton--avatar" />
        {rows.map((index) => <i className="skeleton skeleton--nav-line" key={index} />)}
      </aside>
      <main className="application-skeleton__content">
        <PageSkeleton />
      </main>
    </div>
  );
}
