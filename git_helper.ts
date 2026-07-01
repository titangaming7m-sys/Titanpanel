import { execSync } from 'child_process';

try {
  console.log('--- GIT COMMITS ---');
  const log = execSync('git log --oneline -n 10', { encoding: 'utf-8' });
  console.log(log);

  console.log('--- GIT STATUS ---');
  const status = execSync('git status', { encoding: 'utf-8' });
  console.log(status);
} catch (error: any) {
  console.error('Error running git commands:', error.message);
  if (error.stdout) console.log('stdout:', error.stdout);
  if (error.stderr) console.log('stderr:', error.stderr);
}
