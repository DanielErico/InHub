import fs from 'fs';
import path from 'path';

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      const original = content;
      // Map sky to darker blue equivalent based on prompt
      content = content.replace(/sky-50\b/g, 'blue-100');
      content = content.replace(/sky-100\b/g, 'blue-200');
      content = content.replace(/sky-200\b/g, 'blue-400');
      content = content.replace(/sky-300\b/g, 'blue-500');
      content = content.replace(/sky-400\b/g, 'blue-600');
      content = content.replace(/sky-500\b/g, 'blue-700');
      content = content.replace(/sky-600\b/g, 'blue-800');
      content = content.replace(/sky-700\b/g, 'blue-900');
      content = content.replace(/sky-800\b/g, 'blue-950');
      content = content.replace(/sky-900\b/g, 'blue-950');
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

replaceInDir('./src/app');
