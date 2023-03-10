import { spawn } from 'child_process';
import os from 'os';

// Define the command and arguments
const command = 'istanbul-merge';
let args = [
  '--out',
  'coverage/coverage-final.json',
];

// Check the operating system and set the arguments accordingly
if (os.platform() === 'win32') {
  args.push('$(for /r packages %i in (coverage*.json) do @echo %i)');
} else {
  args.push(`$(find packages -name 'coverage*.json')`);
}

// Execute the command as a child process
const childProcess = spawn(command, args);

// Log the output of the command to the console
childProcess.stdout.on('data', data => {
  console.log(data.toString());
});

// Log any errors that occur during execution
childProcess.stderr.on('data', data => {
  console.error(data.toString());
});

// Log a message when the command has finished executing
childProcess.on('close', code => {
  console.log(`Command exited with code ${code}`);
});
