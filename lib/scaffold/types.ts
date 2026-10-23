export type BlocType =
  | 'metric'
  | 'datagrid'
  | 'form'
  | 'chart'
  | 'filter_bar'
  | 'activity_log'
  | 'kanban'
  | 'detail_card';

export type PHPFramework = 'psr4_vanilla' | 'laravel11_livewire' | 'symfony7_twig';

export interface GridCoord {
  colStart: number; // 1 to 12
  colSpan: number;  // 1 to 12
  rowStart: number; // 1 to N
  rowSpan: number;  // 1 to N
}

export interface BlocEvent {
  name: string;
  payloadType: string;
  description: string;
  phpHandler: string;
}

export interface BlocStateField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  initialValue: any;
}

export interface UIField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'badge';
  key: string;
  required?: boolean;
}

export interface BlocItem {
  id: string;
  title: string;
  slug: string;
  type: BlocType;
  grid: GridCoord;
  description: string;
  events: BlocEvent[];
  stateFields: BlocStateField[];
  mockData?: any;
  phpConfig: {
    className: string;
    modelName: string;
    tableName: string;
    repositoryQuery: string;
    validationRules: Record<string, string>;
    psrRoute: string;
    httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
    cacheSeconds?: number;
  };
  uiConfig: {
    accentColor: string; // indigo, emerald, amber, rose, sky, purple
    icon: string;
    fields?: UIField[];
  };
}

export interface DbColumn {
  name: string;
  type: 'INTEGER' | 'VARCHAR' | 'TEXT' | 'BOOLEAN' | 'DATETIME' | 'DECIMAL' | 'JSON';
  isPrimary?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
  isIndex?: boolean;
  defaultValue?: string;
  foreignKey?: {
    targetTable: string;
    targetColumn: string;
  };
}

export interface DbTable {
  id: string;
  name: string;
  description: string;
  columns: DbColumn[];
  rowCount?: number;
}

export interface RolePermission {
  role: 'admin' | 'manager' | 'operator' | 'customer' | 'guest';
  table: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  scope: 'all' | 'organization' | 'own';
}

export interface DbRowRecord {
  id: number;
  [key: string]: any;
}

export interface QueueJob {
  id: string;
  queue: string;
  handler: string;
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface SolutionProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  framework: PHPFramework;
  databaseDriver: 'sqlite' | 'mysql' | 'pgsql';
  phpVersion: string;
  blocs: BlocItem[];
  dbTables?: DbTable[];
  permissions?: RolePermission[];
  tableRecords?: Record<string, DbRowRecord[]>;
}

export interface GeneratedFile {
  path: string;
  language: 'php' | 'json' | 'yaml' | 'markdown' | 'html';
  code: string;
  category: 'bloc' | 'controller' | 'model' | 'view' | 'migration' | 'config' | 'test' | 'policy' | 'orm' | 'security';
}

