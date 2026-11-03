'use client';

import { useState, type FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CommandLineIcon } from '@heroicons/react/24/outline';
import { getClientAuth } from '@/src/firebase/firebase';
import styles from './admin.module.css';

export default function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(
        getClientAuth(),
        String(values.get('email')).trim(),
        String(values.get('password')),
      );
      if ((await result.user.getIdTokenResult(true)).claims.admin !== true) {
        setError('Tu cuenta no tiene permiso de administrador.');
        return;
      }
      router.replace('/dashboard');
    } catch {
      setError('No se pudo iniciar sesión. Comprueba tus datos y la configuración de Firebase.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className={styles.center}>
      <form onSubmit={submit} className={styles.form}>
        <span className={styles.loginMark}>
          <CommandLineIcon aria-hidden="true" />
        </span>
        <span className={styles.eyebrow}>Ingenix · Administración</span>
        <h1>Acceso a Ingenix</h1>
        <p>Solo cuentas autorizadas. No hay registro público.</p>
        <label>
          Correo
          <input name="email" type="email" autoComplete="username" required disabled={busy} />
        </label>
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={busy}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button disabled={busy}>{busy ? 'Verificando…' : 'Iniciar sesión'}</button>
        <Link href="/">Volver al sitio</Link>
      </form>
    </main>
  );
}
