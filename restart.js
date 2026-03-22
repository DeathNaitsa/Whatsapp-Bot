import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let botProcess = null;
let restarting = false;
let password = null;

async function getPassword() {
    const args = process.argv.slice(2);
    const pIndex = args.indexOf('-p');
    
    if (pIndex !== -1 && args[pIndex + 1]) {
        return args[pIndex + 1];
    }
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('🔐 Datenbank-Passwort: ', (password) => {
            rl.close();
            resolve(password);
        });
    });
}

function startBot() {
    if (restarting) return;
    
    console.log('\n🚀 Starting bot...\n');
    
    const args = ['index.new.js'];
    if (password) {
        args.push('-p', password);
    }
    
    botProcess = spawn('node', args, {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    botProcess.on('exit', (code) => {
        if (code === 0 && !restarting) {
            console.log('\n🔄 Bot exited with code 0 - Restarting in 2 seconds...\n');
            setTimeout(() => {
                startBot();
            }, 2000);
        } else if (code !== 0) {
            console.log(`\n❌ Bot crashed with code ${code} - Restarting in 5 seconds...\n`);
            setTimeout(() => {
                startBot();
            }, 5000);
        }
    });

    botProcess.on('error', (err) => {
        console.error('❌ Failed to start bot:', err);
        setTimeout(() => {
            startBot();
        }, 5000);
    });
}

process.on('SIGINT', () => {
    console.log('\n⏹️  Stopping bot...');
    restarting = true;
    if (botProcess) {
        botProcess.kill();
    }
    process.exit(0);
});

(async () => {
    password = await getPassword();
    console.log('✅ Passwort gespeichert für Auto-Restart\n');
    startBot();
})();
