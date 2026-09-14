import JSZip from 'jszip';
import { PluginFile } from '../types';

// Load files at build time using Vite's static raw glob
const rawFiles = (import.meta as any).glob('/wordpress-plugin/rk-student-portal/**/*', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;


export function getPluginFiles(): PluginFile[] {
  const result: PluginFile[] = [];

  for (const [filePath, content] of Object.entries(rawFiles)) {
    // filePath is like "/wordpress-plugin/rk-student-portal/rk-student-portal.php"
    const relPath = filePath.replace('/wordpress-plugin/rk-student-portal/', '');
    const name = relPath.split('/').pop() || relPath;
    result.push({
      path: relPath,
      name,
      content: typeof content === 'string' ? content : '',
      size: typeof content === 'string' ? content.length : 0,
    });
  }

  // Sort so main php file comes first, then includes, admin, public
  return result.sort((a, b) => {
    if (a.name === 'rk-student-portal.php') return -1;
    if (b.name === 'rk-student-portal.php') return 1;
    return a.path.localeCompare(b.path);
  });
}

export async function downloadPluginZip(): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('rk-student-portal');

  const files = getPluginFiles();
  for (const file of files) {
    if (folder) {
      folder.file(file.path, file.content);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rk-student-portal.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
