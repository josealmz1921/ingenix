import { homeSections } from '../src/content/home';
import { prepareCatalogImport } from '../src/content/catalogImport';
import { adminDb } from '../src/server/firebaseAdmin';
import { importCatalogEntries } from '../src/server/catalogImport';

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const projectIndex = args.indexOf('--project');
  const expectedProject = projectIndex >= 0 ? args[projectIndex + 1] : '';
  const allowed = new Set(['--apply', '--project', expectedProject]);
  if (args.some((arg) => !allowed.has(arg)) || (projectIndex >= 0 && !expectedProject)) {
    throw new Error('Uso: npm run import:site-content -- [--apply --project PROJECT_ID]');
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('Configura el proyecto Firebase en .env.local.');
  if ((expectedProject && expectedProject !== projectId) || (apply && !expectedProject)) {
    throw new Error('Para escribir, indica --apply --project con el ID del proyecto configurado.');
  }

  console.log(`Proyecto: ${projectId}. Modo: ${apply ? 'IMPORTAR' : 'SIMULACIÓN (sin escrituras)'}.`);
  const results = await importCatalogEntries(adminDb(), prepareCatalogImport(homeSections), apply);
  results.forEach((entry) => {
    const action = entry.skipped ? 'CONSERVADO' : apply ? 'CREADO' : 'POR CREAR';
    const state = entry.skipped ? 'estado existente sin cambios' : entry.published ? 'publicado' : 'borrador';
    console.log(`${action}: ${entry.path} (${state})`);
  });
  const count = results.filter((entry) => !entry.skipped).length;
  console.log(`${count} ${apply ? 'creados' : 'por crear'}; ${results.length - count} existentes sin modificar.`);
}

main().catch((error: unknown) => {
  // SDK errors can contain credential details; do not print raw errors or environment variables.
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
  const reasons: Record<string, string> = {
    '5': 'Firestore no existe o no está disponible en el proyecto configurado.',
    '7': 'La cuenta de servicio no tiene permiso para acceder a Firestore.',
    '9': 'Firestore requiere configuración adicional antes de continuar.',
    '16': 'Google rechazó las credenciales de la cuenta de servicio.',
    'app/invalid-credential': 'Las credenciales de Firebase Admin no son válidas.',
  };
  if (typeof code === 'string' || typeof code === 'number') {
    const reason = reasons[String(code)];
    if (reason) console.error(reason);
  }
  console.error('No se completó la importación. Revisa argumentos, credenciales y permisos de Firestore.');
  process.exitCode = 1;
});
