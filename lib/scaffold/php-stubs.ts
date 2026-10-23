/**
 * PHP-Stubs inspired contract & abstraction repository.
 * Standard library, PSR interfaces, PHP 8.3 core traits, and modern framework blueprints.
 */

export interface PhpStubMethod {
  name: string;
  visibility: 'public' | 'protected' | 'private';
  isStatic?: boolean;
  params: { name: string; type: string; default?: string }[];
  returnType: string;
  description: string;
}

export interface PhpStubProperty {
  name: string;
  type: string;
  visibility: 'public' | 'protected' | 'private';
  isReadonly?: boolean;
  isStatic?: boolean;
  default?: string;
}

export interface PhpStubContract {
  id: string;
  category: 'core' | 'psr' | 'framework' | 'orm' | 'security';
  type: 'interface' | 'class' | 'trait' | 'enum';
  namespace: string;
  name: string;
  description: string;
  extends?: string;
  implements?: string[];
  properties: PhpStubProperty[];
  methods: PhpStubMethod[];
  buildingStyle?: {
    themeColor: string;
    buildingType: 'skyscraper' | 'warehouse' | 'observatory' | 'powerplant' | 'datacenter' | 'gateway';
    heightUnits: number;
  };
}

export const PHP_STUBS_CATALOG: PhpStubContract[] = [
  {
    id: 'psr_request_interface',
    category: 'psr',
    type: 'interface',
    namespace: 'Psr\\Http\\Message',
    name: 'ServerRequestInterface',
    description: 'Representation of an incoming, server-side HTTP request according to PSR-7 standard.',
    extends: 'MessageInterface',
    properties: [],
    methods: [
      { name: 'getServerParams', visibility: 'public', params: [], returnType: 'array', description: 'Retrieve server parameters.' },
      { name: 'getCookieParams', visibility: 'public', params: [], returnType: 'array', description: 'Retrieve cookies.' },
      { name: 'getQueryParams', visibility: 'public', params: [], returnType: 'array', description: 'Retrieve query string arguments.' },
      { name: 'getParsedBody', visibility: 'public', params: [], returnType: 'null|array|object', description: 'Retrieve any parameters provided in the request body.' },
      { name: 'getAttribute', visibility: 'public', params: [{ name: 'name', type: 'string' }], returnType: 'mixed', description: 'Retrieve a single derived request attribute.' },
    ],
    buildingStyle: { themeColor: '#6366f1', buildingType: 'gateway', heightUnits: 3 },
  },
  {
    id: 'psr_response_interface',
    category: 'psr',
    type: 'interface',
    namespace: 'Psr\\Http\\Message',
    name: 'ResponseInterface',
    description: 'Representation of an outgoing, client-facing HTTP response according to PSR-7 standard.',
    extends: 'MessageInterface',
    properties: [],
    methods: [
      { name: 'getStatusCode', visibility: 'public', params: [], returnType: 'int', description: 'Gets the response status code.' },
      { name: 'withStatus', visibility: 'public', params: [{ name: 'code', type: 'int' }, { name: 'reasonPhrase', type: 'string', default: "''" }], returnType: 'static', description: 'Return an instance with the specified status code.' },
      { name: 'getBody', visibility: 'public', params: [], returnType: 'StreamInterface', description: 'Gets the body of the message.' },
    ],
    buildingStyle: { themeColor: '#38bdf8', buildingType: 'gateway', heightUnits: 3 },
  },
  {
    id: 'core_json_serializable',
    category: 'core',
    type: 'interface',
    namespace: '',
    name: 'JsonSerializable',
    description: 'Objects which can be serialized to JSON through json_encode().',
    properties: [],
    methods: [
      { name: 'jsonSerialize', visibility: 'public', params: [], returnType: 'mixed', description: 'Specify data which should be serialized to JSON.' },
    ],
    buildingStyle: { themeColor: '#10b981', buildingType: 'datacenter', heightUnits: 2 },
  },
  {
    id: 'core_pdo',
    category: 'core',
    type: 'class',
    namespace: '',
    name: 'PDO',
    description: 'PHP Data Objects connection layer for relational database engines (Postgres, MySQL, SQLite).',
    properties: [],
    methods: [
      { name: 'prepare', visibility: 'public', params: [{ name: 'query', type: 'string' }], returnType: 'PDOStatement|false', description: 'Prepares a statement for execution and returns a statement object.' },
      { name: 'query', visibility: 'public', params: [{ name: 'query', type: 'string' }], returnType: 'PDOStatement|false', description: 'Executes an SQL statement in a single call.' },
      { name: 'beginTransaction', visibility: 'public', params: [], returnType: 'bool', description: 'Initiates a database transaction.' },
      { name: 'commit', visibility: 'public', params: [], returnType: 'bool', description: 'Commits a transaction.' },
      { name: 'lastInsertId', visibility: 'public', params: [], returnType: 'string|false', description: 'Returns the ID of the last inserted row.' },
    ],
    buildingStyle: { themeColor: '#a855f7', buildingType: 'powerplant', heightUnits: 4 },
  },
  {
    id: 'app_bloc_base',
    category: 'framework',
    type: 'class',
    namespace: 'App\\Core',
    name: 'Bloc',
    description: 'Abstract isomorphic reactive BLoC state container matching client grid components.',
    implements: ['JsonSerializable'],
    properties: [
      { name: 'state', type: 'object', visibility: 'protected' },
    ],
    methods: [
      { name: 'getState', visibility: 'public', params: [], returnType: 'object', description: 'Returns active immutable state DTO.' },
      { name: 'dispatch', visibility: 'public', params: [{ name: 'event', type: 'object' }], returnType: 'void', description: 'Dispatches UI action to state machine transition.' },
      { name: 'emit', visibility: 'protected', params: [{ name: 'newState', type: 'object' }], returnType: 'void', description: 'Emits a new immutable state to listeners.' },
      { name: 'toArray', visibility: 'public', params: [], returnType: 'array', description: 'Serializes state for SSR Blade templates.' },
    ],
    buildingStyle: { themeColor: '#f59e0b', buildingType: 'skyscraper', heightUnits: 5 },
  },
  {
    id: 'app_model_base',
    category: 'orm',
    type: 'class',
    namespace: 'App\\Models',
    name: 'Model',
    description: 'Typed PHP 8.3 DataMapper with database hydration, casts, and relationship loaders.',
    implements: ['JsonSerializable'],
    properties: [
      { name: 'id', type: '?int', visibility: 'public' },
      { name: 'attributes', type: 'array', visibility: 'public' },
    ],
    methods: [
      { name: 'find', visibility: 'public', isStatic: true, params: [{ name: 'id', type: 'int' }], returnType: '?static', description: 'Finds model record by primary key.' },
      { name: 'all', visibility: 'public', isStatic: true, params: [{ name: 'limit', type: 'int', default: '50' }], returnType: 'array', description: 'Fetches paginated records list.' },
      { name: 'create', visibility: 'public', isStatic: true, params: [{ name: 'data', type: 'array' }], returnType: 'static', description: 'Inserts record into database.' },
    ],
    buildingStyle: { themeColor: '#ec4899', buildingType: 'warehouse', heightUnits: 3 },
  },
  {
    id: 'app_policy_manager',
    category: 'security',
    type: 'class',
    namespace: 'App\\Security',
    name: 'PolicyManager',
    description: 'Role-Based Access Control evaluator checking user roles and table permissions.',
    properties: [
      { name: 'matrix', type: 'array', visibility: 'private', isStatic: true },
    ],
    methods: [
      { name: 'can', visibility: 'public', isStatic: true, params: [{ name: 'role', type: 'string' }, { name: 'table', type: 'string' }, { name: 'action', type: 'string' }], returnType: 'bool', description: 'Verifies if role has action permission on table.' },
      { name: 'getScope', visibility: 'public', isStatic: true, params: [{ name: 'role', type: 'string' }, { name: 'table', type: 'string' }], returnType: 'string', description: 'Returns row visibility scope (all, organization, own).' },
    ],
    buildingStyle: { themeColor: '#14b8a6', buildingType: 'observatory', heightUnits: 3 },
  },
];
