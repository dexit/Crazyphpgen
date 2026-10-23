import test from 'node:test';
import assert from 'node:assert/strict';
import { clampGrid, createDefaultBloc, PRESET_SOLUTIONS } from './bloc-engine';
import { generatePhpSolution } from './php-generator';
import { SolutionProject } from './types';

test('clampGrid enforces 12-column limits and valid spans', () => {
  const c1 = clampGrid({ colStart: -5, colSpan: 20, rowStart: 0, rowSpan: 99 });
  assert.equal(c1.colStart, 1);
  assert.equal(c1.colSpan, 12); // maxSpan from colStart 1 is 12
  assert.equal(c1.rowStart, 1);
  assert.equal(c1.rowSpan, 6);

  const c2 = clampGrid({ colStart: 10, colSpan: 6 });
  assert.equal(c2.colStart, 10);
  assert.equal(c2.colSpan, 3); // 13 - 10 = 3 max span
});

test('createDefaultBloc creates valid typed bloc components', () => {
  const metric = createDefaultBloc('metric', 0);
  assert.equal(metric.type, 'metric');
  assert.equal(metric.phpConfig.httpMethod, 'GET');
  assert.ok(metric.stateFields.length > 0);
  assert.ok(metric.events.length > 0);

  const datagrid = createDefaultBloc('datagrid', 1);
  assert.equal(datagrid.type, 'datagrid');
  assert.equal(datagrid.grid.colSpan, 8);

  const form = createDefaultBloc('form', 2);
  assert.equal(form.type, 'form');
  assert.equal(form.phpConfig.httpMethod, 'POST');
});

test('generatePhpSolution outputs all expected project files', () => {
  const preset = PRESET_SOLUTIONS[0];
  const files = generatePhpSolution(preset);

  // Check required core files
  const paths = files.map((f) => f.path);
  assert.ok(paths.includes('composer.json'), 'Missing composer.json');
  assert.ok(paths.includes('public/index.php'), 'Missing index.php');
  assert.ok(paths.includes('src/Core/Bloc.php'), 'Missing Bloc.php base');
  assert.ok(paths.includes('src/Core/Request.php'), 'Missing Request.php');
  assert.ok(paths.includes('src/Core/Response.php'), 'Missing Response.php');
  assert.ok(paths.includes('src/Core/Database.php'), 'Missing Database.php');
  assert.ok(paths.includes('src/Core/Repository.php'), 'Missing Repository.php');
  assert.ok(paths.includes('src/Security/AuthManager.php'), 'Missing AuthManager.php');
  assert.ok(paths.includes('src/Security/SessionManager.php'), 'Missing SessionManager.php');
  assert.ok(paths.includes('src/Http/Controllers/AuthController.php'), 'Missing AuthController.php');
  assert.ok(paths.includes('src/Core/RedisClient.php'), 'Missing RedisClient.php');
  assert.ok(paths.includes('src/Queue/QueueManager.php'), 'Missing QueueManager.php');
  assert.ok(paths.includes('docker-compose.yml'), 'Missing docker-compose.yml');
  assert.ok(paths.includes('Dockerfile'), 'Missing Dockerfile');
  assert.ok(paths.includes('bin/setup.php'), 'Missing setup.php');
  assert.ok(paths.includes('src/Views/layouts/app.php'), 'Missing app layout');
  assert.ok(paths.includes('database/migrations/001_create_schema.php'), 'Missing schema migration');
  assert.ok(paths.includes('README.md'), 'Missing README');

  // Verify Auth and Database code validity
  const authFile = files.find((f) => f.path === 'src/Security/AuthManager.php');
  assert.ok(authFile);
  assert.ok(authFile.code.includes('password_hash'), 'AuthManager should use password_hash');
  assert.ok(authFile.code.includes('password_verify'), 'AuthManager should use password_verify');
  assert.ok(authFile.code.includes('createPasswordResetToken'), 'AuthManager should support reset token');

  const dbFile = files.find((f) => f.path === 'src/Core/Database.php');
  assert.ok(dbFile);
  assert.ok(dbFile.code.includes('PDO::ATTR_ERRMODE'), 'Database should configure error handling');
  assert.ok(dbFile.code.includes('transaction'), 'Database should support ACID transactions');

  // Verify bloc class generation
  for (const bloc of preset.blocs) {
    const expectedBlocFile = `src/Blocs/${bloc.phpConfig.className}.php`;
    const expectedCtrlFile = `src/Http/Controllers/${bloc.phpConfig.className}Controller.php`;
    const expectedViewFile = `src/Views/blocs/${bloc.slug}.php`;
    assert.ok(paths.includes(expectedBlocFile), `Missing ${expectedBlocFile}`);
    assert.ok(paths.includes(expectedCtrlFile), `Missing ${expectedCtrlFile}`);
    assert.ok(paths.includes(expectedViewFile), `Missing ${expectedViewFile}`);
  }

  // Verify composer.json validity
  const compFile = files.find((f) => f.path === 'composer.json');
  assert.ok(compFile);
  const parsed = JSON.parse(compFile.code);
  assert.equal(parsed.require.php, '>=8.3');
  assert.equal(parsed.autoload['psr-4']['App\\'], 'src/');
});

test('PHP Bloc code contains correct strict types and class names', () => {
  const dummyProject: SolutionProject = {
    id: 'test_proj',
    name: 'Test Project',
    slug: 'test_proj',
    description: 'Testing PHP generator',
    framework: 'psr4_vanilla',
    databaseDriver: 'sqlite',
    phpVersion: '8.3',
    blocs: [createDefaultBloc('metric', 0)],
  };

  const files = generatePhpSolution(dummyProject);
  const blocFile = files.find((f) => f.path.startsWith('src/Blocs/'));
  assert.ok(blocFile, 'Bloc file should be generated');
  assert.ok(blocFile.code.includes('declare(strict_types=1);'));
  assert.ok(blocFile.code.includes('namespace App\\Blocs;'));
  assert.ok(blocFile.code.includes('final class RevenueMetricBloc extends Bloc'));
});
