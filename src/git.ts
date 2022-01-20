import { error, log } from '@/utils';
import { SpawnSyncReturns } from 'child_process';
import spawn from 'cross-spawn';

function runGit(args: string[], cwd: string) {
  return spawn.sync('git', args, {
    cwd, encoding: 'utf-8',
  });
}

function logReturns(returns: SpawnSyncReturns<string>) {
  if (returns.error) {
    throw returns.error;
  }
  const stdout = returns.stdout.trim();
  if (stdout) {
    log(stdout);
  }
  const stderr = returns.stderr.trim();
  if (stderr) {
    error(stderr);
  }
  return returns.status === 0;
}

export function commitAll(rootDir: string, message: string) {
  for (const args of [
    ['add', '-A', '--ignore-errors'],
    ['commit', '-m', message],
  ]) {
    log('[git]', ...args);
    if (!logReturns(runGit(args, rootDir))) {
      break;
    }
  }
}
