/**
 * Auth middleware for Vercel Serverless Functions.
 *
 * Verifies Firebase ID tokens without requiring the heavy firebase-admin SDK.
 * Uses Google's public token verification endpoint as a lightweight alternative.
 *
 * Usage in an API route:
 *   import { requireAdmin, getAuthUser } from './_lib/auth.js';
 *
 *   // For admin-only operations:
 *   const { error } = await requireAdmin(req, res);
 *   if (error) return; // response already sent
 *
 *   // For optional auth (e.g. attaching userId to orders):
 *   const user = await getAuthUser(req); // null if not logged in
 */

const FIREBASE_PROJECT_ID = 'm-martin-estofados';

// Admin emails allowed to perform write operations
const ADMIN_EMAILS = [
    process.env.ADMIN_EMAIL || 'admin@mmartin.com',
];

/**
 * Extract the Bearer token from the Authorization header.
 * @param {import('http').IncomingMessage} req
 * @returns {string|null}
 */
function extractToken(req) {
    const headers = req.headers || {};
    const authHeader = headers.authorization || headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.split('Bearer ')[1];
}

/**
 * Verify a Firebase ID token by calling Google's tokeninfo endpoint.
 * Returns the decoded token payload or null on failure.
 *
 * @param {string} idToken
 * @returns {Promise<{uid: string, email: string, email_verified: boolean}|null>}
 */
async function verifyFirebaseToken(idToken) {
    try {
        // Use Google's secure token verification endpoint
        const response = await fetch(
            `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${getFirebaseApiKey()}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            }
        );

        if (!response.ok) {
            const errBody = await response.text().catch(() => '');
            throw new Error(`Google API falhou [Status ${response.status}]: ${errBody}`);
        }

        const data = await response.json();
        const user = data.users?.[0];
        if (!user) {
            throw new Error('Nenhum usuário retornado pelo Google.');
        }

        return {
            uid: user.localId,
            email: user.email || '',
            email_verified: user.emailVerified || false,
        };
    } catch (err) {
        console.error('[auth] Token verification failed:', err.message);
        throw err; // Re-throw to caller to expose the exact reason
    }
}

/**
 * Get the Firebase Web API key.
 * Falls back to the hardcoded project key if env var is not set.
 */
function getFirebaseApiKey() {
    return process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDpM6q7Czf8o0EJ5NkyiWLoDJtEv2_ZEH8';
}

/**
 * Extract the authenticated user from the request, if any.
 * Returns null if the request has no valid auth token.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<{uid: string, email: string}|null>}
 */
export async function getAuthUser(req) {
    const token = extractToken(req);
    if (!token) return { user: null, error: null };
    try {
        const user = await verifyFirebaseToken(token);
        return { user, error: null };
    } catch (err) {
        return { user: null, error: err.message };
    }
}

/**
 * Require that the request is authenticated as an admin.
 * If not, sends a 401 or 403 response and returns { error: true }.
 * If authenticated, returns { error: false, user }.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {Promise<{error: boolean, user?: {uid: string, email: string}}>}
 */
export async function requireAdmin(req, res) {
    const token = extractToken(req);

    if (!token) {
        res.status(401).json({ error: 'Autenticação necessária. Faça login como administrador.' });
        return { error: true };
    }

    let user;
    try {
        user = await verifyFirebaseToken(token);
    } catch (err) {
        res.status(401).json({ error: `Falha no Token JWT: ${err.message}` });
        return { error: true };
    }

    if (!user) {
        res.status(401).json({ error: 'Token inválido ou expirado.' });
        return { error: true };
    }

    if (!ADMIN_EMAILS.includes(user.email)) {
        res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
        return { error: true };
    }

    return { error: false, user };
}
