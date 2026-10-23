import { BlocItem, BlocType, GridCoord, SolutionProject } from './types';

export function clampGrid(coord: Partial<GridCoord>): GridCoord {
  const colStart = Math.max(1, Math.min(12, Math.round(coord.colStart ?? 1)));
  const maxSpan = 13 - colStart;
  const colSpan = Math.max(1, Math.min(maxSpan, Math.round(coord.colSpan ?? 6)));
  const rowStart = Math.max(1, Math.round(coord.rowStart ?? 1));
  const rowSpan = Math.max(1, Math.min(6, Math.round(coord.rowSpan ?? 1)));
  return { colStart, colSpan, rowStart, rowSpan };
}

export function createDefaultBloc(type: BlocType, existingCount: number = 0): BlocItem {
  const id = `bloc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const idx = existingCount + 1;

  switch (type) {
    case 'metric':
      return {
        id,
        title: `Total Revenue Metric ${idx}`,
        slug: `revenue_metric_${idx}`,
        type: 'metric',
        grid: { colStart: 1, colSpan: 3, rowStart: 1, rowSpan: 1 },
        description: 'Displays aggregated KPI metric with trend indicator and cached repository query.',
        events: [
          { name: 'RefreshMetric', payloadType: 'void', description: 'Re-computes aggregate from database', phpHandler: 'onRefresh' },
          { name: 'ChangePeriod', payloadType: 'string', description: 'Switches time period: 7d, 30d, 1y', phpHandler: 'onChangePeriod' },
        ],
        stateFields: [
          { name: 'value', type: 'number', initialValue: 48920 },
          { name: 'currency', type: 'string', initialValue: 'USD' },
          { name: 'trendPercentage', type: 'number', initialValue: 12.4 },
          { name: 'period', type: 'string', initialValue: '30d' },
        ],
        phpConfig: {
          className: `RevenueMetricBloc`,
          modelName: 'Transaction',
          tableName: 'transactions',
          repositoryQuery: '$this->transactions->sumWithinPeriod($period)',
          validationRules: { period: 'required|in:7d,30d,90d,1y' },
          psrRoute: `/api/blocs/metric-${idx}`,
          httpMethod: 'GET',
          cacheSeconds: 60,
        },
        uiConfig: {
          accentColor: 'emerald',
          icon: 'TrendingUp',
        },
      };

    case 'datagrid':
      return {
        id,
        title: `Users Data Grid ${idx}`,
        slug: `users_grid_${idx}`,
        type: 'datagrid',
        grid: { colStart: 1, colSpan: 8, rowStart: 2, rowSpan: 2 },
        description: 'Paginated, filterable, sortable interactive record grid backed by PHP Model.',
        events: [
          { name: 'FetchPage', payloadType: '{ page: number, perPage: number }', description: 'Loads paginated records', phpHandler: 'onFetchPage' },
          { name: 'SortColumn', payloadType: '{ column: string, direction: asc|desc }', description: 'Sorts query by column', phpHandler: 'onSort' },
          { name: 'DeleteRecord', payloadType: '{ id: int }', description: 'Soft deletes record by primary key', phpHandler: 'onDelete' },
        ],
        stateFields: [
          { name: 'records', type: 'array', initialValue: [
            { id: 1, name: 'Alex Vance', email: 'alex@example.com', role: 'Administrator', status: 'Active', created_at: '2026-03-14' },
            { id: 2, name: 'Elena Rostova', email: 'elena@sol.org', role: 'Manager', status: 'Active', created_at: '2026-04-01' },
            { id: 3, name: 'Marcus Bell', email: 'marcus@dev.io', role: 'Staff', status: 'Pending', created_at: '2026-05-18' },
          ]},
          { name: 'currentPage', type: 'number', initialValue: 1 },
          { name: 'totalPages', type: 'number', initialValue: 4 },
          { name: 'totalCount', type: 'number', initialValue: 38 },
        ],
        phpConfig: {
          className: `UserDataGridBloc`,
          modelName: 'User',
          tableName: 'users',
          repositoryQuery: '$this->users->paginate($page, $perPage, $sortColumn, $sortDir)',
          validationRules: {
            page: 'integer|min:1',
            perPage: 'integer|min:5|max:100',
            sortColumn: 'string|in:id,name,email,created_at',
          },
          psrRoute: `/api/blocs/users-grid-${idx}`,
          httpMethod: 'GET',
        },
        uiConfig: {
          accentColor: 'indigo',
          icon: 'Table',
          fields: [
            { id: 'f1', label: 'Name', type: 'text', key: 'name', required: true },
            { id: 'f2', label: 'Email', type: 'text', key: 'email', required: true },
            { id: 'f3', label: 'Role', type: 'badge', key: 'role' },
            { id: 'f4', label: 'Status', type: 'badge', key: 'status' },
          ],
        },
      };

    case 'form':
      return {
        id,
        title: `Quick Entry Form ${idx}`,
        slug: `entry_form_${idx}`,
        type: 'form',
        grid: { colStart: 9, colSpan: 4, rowStart: 2, rowSpan: 2 },
        description: 'PSR-7 form submission handler with server-side validation and flash response.',
        events: [
          { name: 'SubmitForm', payloadType: 'FormData', description: 'Validates and saves model entity', phpHandler: 'onSubmit' },
          { name: 'ResetForm', payloadType: 'void', description: 'Clears input state and validation errors', phpHandler: 'onReset' },
        ],
        stateFields: [
          { name: 'formData', type: 'object', initialValue: { title: '', email: '', category: 'general', notes: '' } },
          { name: 'isSubmitting', type: 'boolean', initialValue: false },
          { name: 'successMessage', type: 'string', initialValue: '' },
          { name: 'errors', type: 'object', initialValue: {} },
        ],
        phpConfig: {
          className: `EntryFormBloc`,
          modelName: 'Ticket',
          tableName: 'tickets',
          repositoryQuery: '$this->tickets->create($validatedData)',
          validationRules: {
            title: 'required|string|min:3|max:120',
            email: 'required|email',
            category: 'required|in:general,billing,support',
            notes: 'nullable|string|max:1000',
          },
          psrRoute: `/api/blocs/form-${idx}/submit`,
          httpMethod: 'POST',
        },
        uiConfig: {
          accentColor: 'amber',
          icon: 'PenTool',
          fields: [
            { id: 'f1', label: 'Subject / Title', type: 'text', key: 'title', required: true },
            { id: 'f2', label: 'Contact Email', type: 'text', key: 'email', required: true },
            { id: 'f3', label: 'Category', type: 'select', key: 'category', required: true },
          ],
        },
      };

    case 'chart':
      return {
        id,
        title: `Analytics Series Chart ${idx}`,
        slug: `chart_${idx}`,
        type: 'chart',
        grid: { colStart: 4, colSpan: 6, rowStart: 1, rowSpan: 1 },
        description: 'Interactive SVG / Blade chart series bound to time-bucketed SQL query.',
        events: [
          { name: 'ToggleMetric', payloadType: 'string', description: 'Switches between clicks, visits, revenue', phpHandler: 'onToggleMetric' },
        ],
        stateFields: [
          { name: 'series', type: 'array', initialValue: [
            { label: 'Mon', value: 42 },
            { label: 'Tue', value: 68 },
            { label: 'Wed', value: 85 },
            { label: 'Thu', value: 55 },
            { label: 'Fri', value: 92 },
            { label: 'Sat', value: 110 },
            { label: 'Sun', value: 78 },
          ]},
          { name: 'activeMetric', type: 'string', initialValue: 'conversions' },
        ],
        phpConfig: {
          className: `AnalyticsChartBloc`,
          modelName: 'MetricLog',
          tableName: 'metric_logs',
          repositoryQuery: '$this->metrics->getWeeklyBuckets($activeMetric)',
          validationRules: { activeMetric: 'required|string' },
          psrRoute: `/api/blocs/chart-${idx}`,
          httpMethod: 'GET',
          cacheSeconds: 300,
        },
        uiConfig: {
          accentColor: 'sky',
          icon: 'BarChart3',
        },
      };

    case 'filter_bar':
      return {
        id,
        title: `Search & Facet Filter ${idx}`,
        slug: `filter_bar_${idx}`,
        type: 'filter_bar',
        grid: { colStart: 1, colSpan: 12, rowStart: 1, rowSpan: 1 },
        description: 'Global search and multi-tag filtering bar that triggers child Bloc updates.',
        events: [
          { name: 'SearchQueryChanged', payloadType: 'string', description: 'Debounced search term dispatch', phpHandler: 'onSearch' },
          { name: 'FilterTagToggled', payloadType: 'string', description: 'Toggles status tag filter', phpHandler: 'onToggleTag' },
        ],
        stateFields: [
          { name: 'query', type: 'string', initialValue: '' },
          { name: 'selectedTag', type: 'string', initialValue: 'all' },
        ],
        phpConfig: {
          className: `FilterBarBloc`,
          modelName: 'SearchFilter',
          tableName: 'filter_presets',
          repositoryQuery: '$this->filters->matchQuery($query, $selectedTag)',
          validationRules: { query: 'nullable|string|max:100', selectedTag: 'string' },
          psrRoute: `/api/blocs/filters-${idx}`,
          httpMethod: 'GET',
        },
        uiConfig: {
          accentColor: 'purple',
          icon: 'Search',
        },
      };

    case 'kanban':
      return {
        id,
        title: `Pipeline Stage Kanban ${idx}`,
        slug: `pipeline_${idx}`,
        type: 'kanban',
        grid: { colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 2 },
        description: 'Multi-column pipeline with drag/move state updates and stage transitions in PHP.',
        events: [
          { name: 'MoveStage', payloadType: '{ itemId: int, newStage: string }', description: 'Transitions entity to new stage', phpHandler: 'onMoveStage' },
        ],
        stateFields: [
          { name: 'stages', type: 'array', initialValue: [
            { id: 'lead', name: 'Qualified Leads', count: 12 },
            { id: 'contacted', name: 'Proposal Sent', count: 7 },
            { id: 'negotiation', name: 'Negotiation', count: 4 },
            { id: 'won', name: 'Closed Won', count: 19 },
          ]},
        ],
        phpConfig: {
          className: `PipelineKanbanBloc`,
          modelName: 'Opportunity',
          tableName: 'opportunities',
          repositoryQuery: '$this->opportunities->groupByStage()',
          validationRules: { itemId: 'required|integer', newStage: 'required|string' },
          psrRoute: `/api/blocs/kanban-${idx}/move`,
          httpMethod: 'POST',
        },
        uiConfig: {
          accentColor: 'rose',
          icon: 'Kanban',
        },
      };

    case 'detail_card':
    default:
      return {
        id,
        title: `Entity Inspector Card ${idx}`,
        slug: `detail_card_${idx}`,
        type: 'detail_card',
        grid: { colStart: 10, colSpan: 3, rowStart: 1, rowSpan: 1 },
        description: 'Inspector card showing active entity attributes, tags, and status badge.',
        events: [
          { name: 'SelectEntity', payloadType: '{ id: int }', description: 'Loads detail record', phpHandler: 'onSelect' },
        ],
        stateFields: [
          { name: 'activeItem', type: 'object', initialValue: { id: 1, title: 'Enterprise Contract 2026', status: 'Active', value: '$12,400' } },
        ],
        phpConfig: {
          className: `DetailInspectorBloc`,
          modelName: 'Contract',
          tableName: 'contracts',
          repositoryQuery: '$this->contracts->findWithRelations($id)',
          validationRules: { id: 'required|integer' },
          psrRoute: `/api/blocs/detail-${idx}`,
          httpMethod: 'GET',
        },
        uiConfig: {
          accentColor: 'indigo',
          icon: 'FileText',
        },
      };
  }
}

export const PRESET_SOLUTIONS: SolutionProject[] = [
  {
    id: 'preset_saas',
    name: 'SaaS Platform Analytics & Accounts',
    slug: 'saas_platform',
    description: 'Modern PHP 8.3 BLoC solution for SaaS dashboards: MRR metrics, customer data grid, ticket creation form, and active usage chart.',
    framework: 'psr4_vanilla',
    databaseDriver: 'sqlite',
    phpVersion: '8.3',
    blocs: [
      {
        id: 'b_metric_1',
        title: 'Monthly Recurring Revenue',
        slug: 'mrr_metric',
        type: 'metric',
        grid: { colStart: 1, colSpan: 3, rowStart: 1, rowSpan: 1 },
        description: 'Total active subscriptions converted to MRR in USD.',
        events: [
          { name: 'RefreshMetric', payloadType: 'void', description: 'Re-aggregates revenue', phpHandler: 'onRefresh' },
        ],
        stateFields: [
          { name: 'value', type: 'number', initialValue: 84320 },
          { name: 'currency', type: 'string', initialValue: 'USD' },
          { name: 'trendPercentage', type: 'number', initialValue: 18.2 },
          { name: 'period', type: 'string', initialValue: 'Monthly' },
        ],
        phpConfig: {
          className: 'MrrMetricBloc',
          modelName: 'Subscription',
          tableName: 'subscriptions',
          repositoryQuery: '$this->subscriptions->calculateTotalMrr()',
          validationRules: {},
          psrRoute: '/api/blocs/mrr',
          httpMethod: 'GET',
          cacheSeconds: 120,
        },
        uiConfig: { accentColor: 'emerald', icon: 'DollarSign' },
      },
      {
        id: 'b_chart_1',
        title: 'Signups & Retention Trend',
        slug: 'retention_chart',
        type: 'chart',
        grid: { colStart: 4, colSpan: 6, rowStart: 1, rowSpan: 1 },
        description: 'Weekly cohort signups and active retention stream.',
        events: [
          { name: 'TogglePeriod', payloadType: 'string', description: 'Switch timeframe', phpHandler: 'onTogglePeriod' },
        ],
        stateFields: [
          { name: 'series', type: 'array', initialValue: [
            { label: 'W1', value: 120 },
            { label: 'W2', value: 185 },
            { label: 'W3', value: 240 },
            { label: 'W4', value: 310 },
            { label: 'W5', value: 420 },
            { label: 'W6', value: 580 },
          ]},
          { name: 'activeMetric', type: 'string', initialValue: 'new_signups' },
        ],
        phpConfig: {
          className: 'RetentionChartBloc',
          modelName: 'UserMetric',
          tableName: 'user_metrics',
          repositoryQuery: '$this->metrics->getWeeklyCohortTrends()',
          validationRules: {},
          psrRoute: '/api/blocs/retention-chart',
          httpMethod: 'GET',
        },
        uiConfig: { accentColor: 'sky', icon: 'TrendingUp' },
      },
      {
        id: 'b_metric_2',
        title: 'Active Workspaces',
        slug: 'workspaces_metric',
        type: 'metric',
        grid: { colStart: 10, colSpan: 3, rowStart: 1, rowSpan: 1 },
        description: 'Organizations currently active on the platform.',
        events: [
          { name: 'Refresh', payloadType: 'void', description: 'Update counter', phpHandler: 'onRefresh' },
        ],
        stateFields: [
          { name: 'value', type: 'number', initialValue: 1420 },
          { name: 'currency', type: 'string', initialValue: '' },
          { name: 'trendPercentage', type: 'number', initialValue: 8.5 },
          { name: 'period', type: 'string', initialValue: 'Live' },
        ],
        phpConfig: {
          className: 'WorkspaceCounterBloc',
          modelName: 'Workspace',
          tableName: 'workspaces',
          repositoryQuery: '$this->workspaces->countActive()',
          validationRules: {},
          psrRoute: '/api/blocs/workspaces-count',
          httpMethod: 'GET',
        },
        uiConfig: { accentColor: 'purple', icon: 'Building2' },
      },
      {
        id: 'b_grid_1',
        title: 'Organization Customer Accounts',
        slug: 'accounts_datagrid',
        type: 'datagrid',
        grid: { colStart: 1, colSpan: 8, rowStart: 2, rowSpan: 2 },
        description: 'Full CRUD management of organizations, seat limits, and billing tiers.',
        events: [
          { name: 'SearchAccounts', payloadType: 'string', description: 'Filter rows by query', phpHandler: 'onSearch' },
          { name: 'ChangePlan', payloadType: '{ id: int, plan: string }', description: 'Upgrade customer tier', phpHandler: 'onPlanChange' },
        ],
        stateFields: [
          { name: 'records', type: 'array', initialValue: [
            { id: 1, name: 'Acme Global Corp', email: 'billing@acme.com', role: 'Enterprise (99 seats)', status: 'Active', created_at: '2026-01-12' },
            { id: 2, name: 'Hyperion Labs', email: 'ops@hyperion.ai', role: 'Pro (25 seats)', status: 'Active', created_at: '2026-02-04' },
            { id: 3, name: 'Nebula Stream', email: 'admin@nebula.io', role: 'Starter (5 seats)', status: 'Trial', created_at: '2026-03-21' },
            { id: 4, name: 'Vortex Dynamics', email: 'finance@vortex.org', role: 'Enterprise (150 seats)', status: 'Active', created_at: '2026-04-10' },
          ]},
          { name: 'currentPage', type: 'number', initialValue: 1 },
          { name: 'totalPages', type: 'number', initialValue: 12 },
          { name: 'totalCount', type: 'number', initialValue: 48 },
        ],
        phpConfig: {
          className: 'OrganizationGridBloc',
          modelName: 'Organization',
          tableName: 'organizations',
          repositoryQuery: '$this->organizations->paginateWithBilling()',
          validationRules: { page: 'integer|min:1', plan: 'string|in:starter,pro,enterprise' },
          psrRoute: '/api/blocs/organizations',
          httpMethod: 'GET',
        },
        uiConfig: {
          accentColor: 'indigo',
          icon: 'Table',
          fields: [
            { id: 'f1', label: 'Company Name', type: 'text', key: 'name', required: true },
            { id: 'f2', label: 'Billing Email', type: 'text', key: 'email', required: true },
            { id: 'f3', label: 'Plan & Seats', type: 'badge', key: 'role' },
            { id: 'f4', label: 'Account State', type: 'badge', key: 'status' },
          ],
        },
      },
      {
        id: 'b_form_1',
        title: 'Provision New Tenant Org',
        slug: 'provision_form',
        type: 'form',
        grid: { colStart: 9, colSpan: 4, rowStart: 2, rowSpan: 2 },
        description: 'Isomorphic form validating new organization creation in PHP backend.',
        events: [
          { name: 'SubmitTenant', payloadType: 'FormData', description: 'Creates workspace and initializes schema', phpHandler: 'onSubmitTenant' },
        ],
        stateFields: [
          { name: 'formData', type: 'object', initialValue: { title: '', email: '', category: 'support', notes: '' } },
          { name: 'isSubmitting', type: 'boolean', initialValue: false },
          { name: 'successMessage', type: 'string', initialValue: '' },
          { name: 'errors', type: 'object', initialValue: {} },
        ],
        phpConfig: {
          className: 'ProvisionTenantFormBloc',
          modelName: 'Workspace',
          tableName: 'workspaces',
          repositoryQuery: '$this->workspaceService->provisionTenant($validatedData)',
          validationRules: {
            title: 'required|string|min:3|max:80',
            email: 'required|email|unique:workspaces,owner_email',
            category: 'required|in:general,billing,support',
          },
          psrRoute: '/api/blocs/provision-tenant',
          httpMethod: 'POST',
        },
        uiConfig: {
          accentColor: 'amber',
          icon: 'Layers',
          fields: [
            { id: 'f1', label: 'Workspace Slug / Name', type: 'text', key: 'title', required: true },
            { id: 'f2', label: 'Owner Email', type: 'text', key: 'email', required: true },
            { id: 'f3', label: 'Support Tier', type: 'select', key: 'category', required: true },
          ],
        },
      },
    ],
    dbTables: [
      {
        id: 't_workspaces',
        name: 'workspaces',
        description: 'Multi-tenant organization accounts and quota configurations',
        rowCount: 1420,
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'name', type: 'VARCHAR', isNullable: false },
          { name: 'slug', type: 'VARCHAR', isUnique: true, isIndex: true },
          { name: 'owner_email', type: 'VARCHAR', isIndex: true },
          { name: 'plan', type: 'VARCHAR', defaultValue: "'starter'" },
          { name: 'max_seats', type: 'INTEGER', defaultValue: '5' },
          { name: 'status', type: 'VARCHAR', defaultValue: "'active'" },
          { name: 'created_at', type: 'DATETIME' },
          { name: 'updated_at', type: 'DATETIME' },
        ],
      },
      {
        id: 't_subscriptions',
        name: 'subscriptions',
        description: 'Active billing subscriptions and recurring Stripe / LemonSqueezy refs',
        rowCount: 980,
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'workspace_id', type: 'INTEGER', foreignKey: { targetTable: 'workspaces', targetColumn: 'id' } },
          { name: 'stripe_subscription_id', type: 'VARCHAR', isUnique: true },
          { name: 'mrr_cents', type: 'INTEGER' },
          { name: 'currency', type: 'VARCHAR', defaultValue: "'usd'" },
          { name: 'current_period_end', type: 'DATETIME' },
          { name: 'status', type: 'VARCHAR', defaultValue: "'active'" },
        ],
      },
      {
        id: 't_transactions',
        name: 'transactions',
        description: 'Invoice settlements and payments ledger',
        rowCount: 4520,
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'workspace_id', type: 'INTEGER', foreignKey: { targetTable: 'workspaces', targetColumn: 'id' } },
          { name: 'amount', type: 'DECIMAL' },
          { name: 'period', type: 'VARCHAR' },
          { name: 'settled_at', type: 'DATETIME' },
        ],
      },
      {
        id: 't_tickets',
        name: 'tickets',
        description: 'Support requests and customer communications',
        rowCount: 312,
        columns: [
          { name: 'id', type: 'INTEGER', isPrimary: true },
          { name: 'workspace_id', type: 'INTEGER', foreignKey: { targetTable: 'workspaces', targetColumn: 'id' } },
          { name: 'title', type: 'VARCHAR' },
          { name: 'email', type: 'VARCHAR' },
          { name: 'category', type: 'VARCHAR' },
          { name: 'status', type: 'VARCHAR', defaultValue: "'open'" },
          { name: 'created_at', type: 'DATETIME' },
        ],
      },
    ],
    permissions: [
      { role: 'admin', table: 'workspaces', canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      { role: 'admin', table: 'subscriptions', canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      { role: 'admin', table: 'transactions', canCreate: true, canRead: true, canUpdate: true, canDelete: false, scope: 'all' },
      { role: 'manager', table: 'workspaces', canCreate: false, canRead: true, canUpdate: true, canDelete: false, scope: 'organization' },
      { role: 'manager', table: 'subscriptions', canCreate: true, canRead: true, canUpdate: false, canDelete: false, scope: 'organization' },
      { role: 'customer', table: 'workspaces', canCreate: false, canRead: true, canUpdate: false, canDelete: false, scope: 'own' },
      { role: 'customer', table: 'tickets', canCreate: true, canRead: true, canUpdate: true, canDelete: false, scope: 'own' },
      { role: 'guest', table: 'workspaces', canCreate: false, canRead: false, canUpdate: false, canDelete: false, scope: 'own' },
    ],
  },
  {
    id: 'preset_ecommerce',
    name: 'E-Commerce Warehouse & Order Flow',
    slug: 'ecommerce_orders',
    description: 'Inventory monitoring, active orders grid, fulfillment kanban, and dispatch form.',
    framework: 'psr4_vanilla',
    databaseDriver: 'mysql',
    phpVersion: '8.3',
    blocs: [
      {
        id: 'b_ec_metric',
        title: 'Fulfilled Today',
        slug: 'fulfillment_metric',
        type: 'metric',
        grid: { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 1 },
        description: 'Total order units packed and shipped today.',
        events: [{ name: 'Refresh', payloadType: 'void', description: 'Recount units', phpHandler: 'onRefresh' }],
        stateFields: [
          { name: 'value', type: 'number', initialValue: 342 },
          { name: 'currency', type: 'string', initialValue: 'Units' },
          { name: 'trendPercentage', type: 'number', initialValue: 24.1 },
          { name: 'period', type: 'string', initialValue: 'Today' },
        ],
        phpConfig: {
          className: 'FulfillmentMetricBloc',
          modelName: 'Order',
          tableName: 'orders',
          repositoryQuery: '$this->orders->countShippedToday()',
          validationRules: {},
          psrRoute: '/api/blocs/orders/fulfillment-metric',
          httpMethod: 'GET',
        },
        uiConfig: { accentColor: 'emerald', icon: 'PackageCheck' },
      },
      {
        id: 'b_ec_filter',
        title: 'Order Filter & SKU Finder',
        slug: 'order_filter',
        type: 'filter_bar',
        grid: { colStart: 5, colSpan: 8, rowStart: 1, rowSpan: 1 },
        description: 'Instant SKU lookup and warehouse aisle filter.',
        events: [{ name: 'SearchSKU', payloadType: 'string', description: 'Look up SKU', phpHandler: 'onSearch' }],
        stateFields: [
          { name: 'query', type: 'string', initialValue: '' },
          { name: 'selectedTag', type: 'string', initialValue: 'all' },
        ],
        phpConfig: {
          className: 'OrderFilterBloc',
          modelName: 'Product',
          tableName: 'products',
          repositoryQuery: '$this->products->searchBySkuOrBarcode($query)',
          validationRules: { query: 'string|max:50' },
          psrRoute: '/api/blocs/orders/search',
          httpMethod: 'GET',
        },
        uiConfig: { accentColor: 'purple', icon: 'Search' },
      },
      {
        id: 'b_ec_kanban',
        title: 'Fulfillment Pipeline',
        slug: 'fulfillment_pipeline',
        type: 'kanban',
        grid: { colStart: 1, colSpan: 12, rowStart: 2, rowSpan: 2 },
        description: 'Orders moving through Pick, Pack, Quality Inspection, and Dispatched.',
        events: [{ name: 'UpdateStatus', payloadType: '{ orderId: int, status: string }', description: 'Transitions order state', phpHandler: 'onStatusChange' }],
        stateFields: [
          { name: 'stages', type: 'array', initialValue: [
            { id: 'awaiting', name: 'Awaiting Pick', count: 18 },
            { id: 'packing', name: 'Packing Station', count: 9 },
            { id: 'label_printed', name: 'Label Printed', count: 14 },
            { id: 'dispatched', name: 'Carrier Hand-off', count: 42 },
          ]},
        ],
        phpConfig: {
          className: 'FulfillmentKanbanBloc',
          modelName: 'Order',
          tableName: 'orders',
          repositoryQuery: '$this->orders->groupByFulfillmentStage()',
          validationRules: { orderId: 'required|integer', status: 'required|string' },
          psrRoute: '/api/blocs/fulfillment/transition',
          httpMethod: 'POST',
        },
        uiConfig: { accentColor: 'rose', icon: 'Truck' },
      },
    ],
  },
];
