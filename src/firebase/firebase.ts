"use client";

import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/** Initialize only when needed: builds and the public site do not require Firebase keys. */
export function getClientAuth() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) throw new Error('Configura Firebase para habilitar el administrador.');
  const app = getApps().find(app => app.name === 'ingenix-client') ?? initializeApp({
    apiKey,
    projectId,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }, 'ingenix-client');
  return getAuth(app);
}
