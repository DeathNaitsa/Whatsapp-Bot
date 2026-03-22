import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const handler = async (m, { send, chatId, sessionId }) => {
  const startTime = Date.now();
  
  await send.text(chatId, '⏱️ Messung läuft...');
  const firstLatency = Date.now() - startTime;
  
  const pingResults = [];
  for (let i = 0; i < 5; i++) {
    const pingStart = Date.now();
    await new Promise(resolve => setTimeout(resolve, 50));
    pingResults.push(Date.now() - pingStart);
  }
  
  const cpuSingleStart = Date.now();
  let cpuSingleOps = 0;
  while (Date.now() - cpuSingleStart < 500) {
    Math.sqrt(Math.random() * 1000000);
    cpuSingleOps++;
  }
  const cpuSingleOpsPerSec = (cpuSingleOps / 0.5).toFixed(0);
  
  const memTestStart = Date.now();
  const testArrays = [];
  for (let i = 0; i < 100; i++) {
    testArrays.push(new Array(100000).fill(Math.random()));
  }
  const memTestTime = Date.now() - memTestStart;
  const memAllocMBperSec = ((100 * 100000 * 8 / 1024 / 1024) / (memTestTime / 1000)).toFixed(2);
  
  const ramReadStart = Date.now();
  const readArray = new Array(5000000).fill(0).map((_, i) => i);
  let readSum = 0;
  for (let i = 0; i < readArray.length; i++) {
    readSum += readArray[i];
  }
  const ramReadTime = Date.now() - ramReadStart;
  const ramReadSpeed = ((5000000 * 8 / 1024 / 1024) / (ramReadTime / 1000)).toFixed(2);
  
  const ramWriteStart = Date.now();
  const writeArray = new Array(5000000);
  for (let i = 0; i < writeArray.length; i++) {
    writeArray[i] = i * 2;
  }
  const ramWriteTime = Date.now() - ramWriteStart;
  const ramWriteSpeed = ((5000000 * 8 / 1024 / 1024) / (ramWriteTime / 1000)).toFixed(2);
  
  const jsonTestStart = Date.now();
  const testObj = { data: [] };
  for (let i = 0; i < 5000; i++) {
    testObj.data.push({ id: i, name: `User${i}`, active: true, score: Math.random() * 100 });
  }
  JSON.stringify(testObj);
  const jsonTestTime = Date.now() - jsonTestStart;
  const jsonOpsPerSec = (10000 / (jsonTestTime / 1000)).toFixed(0);
  
  const gpuTestStart = Date.now();
  const size = 300;
  const mA = Array(size).fill(0).map(() => Array(size).fill(0).map(() => Math.random()));
  const mB = Array(size).fill(0).map(() => Array(size).fill(0).map(() => Math.random()));
  const mC = Array(size).fill(0).map(() => Array(size).fill(0));
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (let k = 0; k < size; k++) {
        sum += mA[i][k] * mB[k][j];
      }
      mC[i][j] = sum;
    }
  }
  
  const gpuTime = Date.now() - gpuTestStart;
  const gflops = ((size * size * size * 2) / (gpuTime / 1000) / 1000000000).toFixed(3);
  
  const vectorTestStart = Date.now();
  for (let i = 0; i < 30000; i++) {
    const v1 = { x: Math.random(), y: Math.random(), z: Math.random() };
    const v2 = { x: Math.random(), y: Math.random(), z: Math.random() };
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const cross = {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x
    };
    Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
  }
  const vectorTestTime = Date.now() - vectorTestStart;
  const vectorOpsPerSec = (60000 / (vectorTestTime / 1000)).toFixed(0);
  
  let gpuInfo = 'Unknown';
  try {
    if (os.platform() === 'linux') {
      try {
        const { stdout } = await execAsync('nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null');
        gpuInfo = stdout.trim();
      } catch {
        try {
          const { stdout } = await execAsync('lspci | grep -i vga');
          gpuInfo = stdout.split(':')[2]?.trim() || 'Integrated';
        } catch {
          gpuInfo = 'CPU Only';
        }
      }
    } else if (os.platform() === 'win32') {
      try {
        const { stdout } = await execAsync('wmic path win32_VideoController get name');
        gpuInfo = stdout.split('\n')[1]?.trim() || 'Unknown';
      } catch {
        gpuInfo = 'CPU Only';
      }
    }
  } catch {
    gpuInfo = 'Detection Failed';
  }
  
  const avgPing = (pingResults.reduce((a, b) => a + b, 0) / pingResults.length).toFixed(2);
  const minPing = Math.min(...pingResults);
  const maxPing = Math.max(...pingResults);
  
  const totalScore = Math.round(
    (cpuSingleOpsPerSec / 10000) * 15 +
    (parseFloat(memAllocMBperSec)) * 5 +
    (parseFloat(ramReadSpeed) / 100) * 10 +
    (parseFloat(ramWriteSpeed) / 100) * 10 +
    (parseFloat(gflops) * 100) * 20 +
    (jsonOpsPerSec / 1000) * 10 +
    (vectorOpsPerSec / 10000) * 15
  );
  
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const mem = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  
  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model || 'Unknown';
  const cpuCores = cpus.length;
  
  let response = '🏓 *Performance-Test*\n\n';
  
  response += '📊 *Netzwerk-Latenz:*\n';
  response += `├ Initial: ${firstLatency}ms\n`;
  for (let i = 0; i < pingResults.length; i++) {
    response += `├ Test ${i + 1}: ${pingResults[i]}ms\n`;
  }
  response += `├ Durchschnitt: ${avgPing}ms\n`;
  response += `├ Min/Max: ${minPing}ms / ${maxPing}ms\n`;
  const perfRating = avgPing < 100 ? '🟢 Exzellent' : avgPing < 300 ? '🟡 Gut' : avgPing < 500 ? '🟠 Mittel' : '🔴 Langsam';
  response += `└ Rating: ${perfRating}\n\n`;
  
  response += '🔥 *CPU-Tests:*\n';
  response += `├ Single-Thread: ${Number(cpuSingleOpsPerSec).toLocaleString('de-DE')} ops/s\n`;
  response += `└ JSON-Ops: ${Number(jsonOpsPerSec).toLocaleString('de-DE')} ops/s\n\n`;
  
  response += '🎮 *GPU/3D-Tests:*\n';
  response += `├ GPU: ${gpuInfo.substring(0, 30)}\n`;
  response += `├ Matrix ${size}×${size}: ${gpuTime}ms\n`;
  response += `├ GFLOPS: ${gflops}\n`;
  response += `└ Vector Ops: ${Number(vectorOpsPerSec).toLocaleString('de-DE')} ops/s\n\n`;
  
  response += '💾 *RAM-Performance:*\n';
  response += `├ Alloc: ${memAllocMBperSec} MB/s\n`;
  response += `├ Read: ${ramReadSpeed} MB/s\n`;
  response += `├ Write: ${ramWriteSpeed} MB/s\n`;
  const ramBandwidth = ((parseFloat(ramReadSpeed) + parseFloat(ramWriteSpeed)) / 2).toFixed(2);
  const ramRating = parseFloat(ramBandwidth) > 800 ? '🟢 Sehr schnell' : parseFloat(ramBandwidth) > 400 ? '🟡 Schnell' : parseFloat(ramBandwidth) > 200 ? '🟠 Mittel' : '🔴 Langsam';
  response += `└ Avg: ${ramBandwidth} MB/s (${ramRating})\n\n`;
  
  response += '🖥️ *System:*\n';
  response += `├ CPU: ${cpuModel.substring(0, 30)}\n`;
  response += `├ Kerne: ${cpuCores}\n`;
  response += `├ RAM: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB\n`;
  response += `├ Frei: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB\n`;
  response += `├ Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB\n`;
  response += `└ OS: ${os.platform()} ${os.arch()}\n\n`;
  
  response += `⏱️ *Uptime:* `;
  if (days > 0) response += `${days}d `;
  response += `${hours}h ${minutes}m ${seconds}s\n\n`;
  
  const scoreEmoji = totalScore > 150 ? '🏆' : totalScore > 100 ? '⭐' : totalScore > 50 ? '✅' : '⚠️';
  response += `${scoreEmoji} *Performance-Score:* ${totalScore}/200\n`;
  response += `├ Rating: ${totalScore > 150 ? '🟢 Exzellent' : totalScore > 100 ? '🟡 Gut' : totalScore > 50 ? '🟠 Mittel' : '🔴 Niedrig'}\n`;
  response += `└ Prozent: ${((totalScore / 200) * 100).toFixed(1)}%\n\n`;
  
  response += `📱 *Session:* ${sessionId}\n`;
  response += `🌍 *Node:* ${process.version}`;
  
  await send.text(chatId, response);
};

handler.help = ['ping'];
handler.tags = ['info'];
handler.command = ['ping', 'latency'];

export default handler;
