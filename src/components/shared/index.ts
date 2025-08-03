// Shared Customer Components
export { default as CustomerPageLayout } from '../customer/CustomerPageLayout';

// UI Components
export { default as StatusBadge } from '../customer/common/StatusBadge';
export { default as EmptyState } from '../customer/common/EmptyState';
export { default as DataTable } from '../customer/common/DataTable';
export { StatCard, StatsGrid } from '../customer/common/StatsGrid';
export { default as QuickActionsCard } from '../customer/common/QuickActionsCard';
export { default as ContactCards } from '../customer/common/ContactCards';

// Hooks
export { useFormatDate, useFormatCurrency, useFormatPhone } from '../../hooks/useFormatters';
export { useSecureNavigation } from '../../hooks/useSecureNavigation';
