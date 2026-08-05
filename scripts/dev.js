import { spawn } from 'node:child_process';

const server = spawn('npm', ['run', 'dev', '--prefix', 'server'], { stdio: 'inherit' });
const client = spawn('npm', ['run', 'dev', '--prefix', 'client'], { stdio: 'inherit' });

const stop = () => {
  server.kill('SIGTERM');
  client.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
