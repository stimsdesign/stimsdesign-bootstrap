export const prerender = false;
/**
 * Newsletter Subscription Endpoint
 * Handles email signups, performs validation, and includes a honeypot bot trap.
 * Supports both JSON and standard form submissions.
 */
import type { APIRoute } from 'astro';
import { db } from '@stimsdesign/core/db';
import { logger } from '@stimsdesign/core/logger';

// Simple email validator (good enough for signups)
function isValidEmail(email: string) {
    // trims + basic RFC-ish test
    const e = email.trim();
    if (e.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function sameOriginOnly(req: Request) {
    const origin = req.headers.get('origin');
    if (!origin) return true; // non-AJAX form posts won't send Origin
    const here = new URL(req.url).origin;
    return origin === here;
}

export const POST: APIRoute = async ({ request, redirect }) => {
    try {

        // Enforce same-origin for AJAX requests
        if (!sameOriginOnly(request)) {
            return new Response('Forbidden', { status: 403 });
        }

        const contentType = request.headers.get('content-type') || '';

        // Only accept standard HTML form posts (application/x-www-form-urlencoded or multipart)
        let email = '';
        let honeypot = '';


        if (contentType.includes('application/json')) {
            const body = await request.json().catch(() => ({}));
            email = String(body.email || '');
            honeypot = String(body.website || '');
        } else {
            const form = await request.formData();
            email = String(form.get('email') || '');
            honeypot = String(form.get('website') || '');
        }

        // Bot trap
        if (honeypot) {
            // Pretend success so bots don’t learn the trap
            if (contentType.includes('application/json')) {
                return new Response(JSON.stringify({ ok: true, bot: true }), {
                    headers: { 'content-type': 'application/json' },
                });
            } else {
                return redirect('/thank-you', 303);
            }
        }

        if (!isValidEmail(email)) {
            if (contentType.includes('application/json')) {
                return new Response(JSON.stringify({ ok: false, message: 'invalid email' }), {
                    status: 400,
                    headers: { 'content-type': 'application/json' },
                });
            } else {
                return redirect('/?error=invalid', 303);
            }
            // fallback for non-JS forms
            // const here = new URL(request.url);
            // const ref = request.headers.get('referer');
            // const dest = ref && ref.startsWith(here.origin) ? new URL(ref) : new URL('/', here.origin);
            // dest.searchParams.set('error', 'invalid');
            // return redirect(dest.pathname + '?' + dest.searchParams.toString(), 303);
        }

        // Optional: rate limit by IP (quick+dirty)
        const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for') || '';
        const ua = request.headers.get('user-agent') || '';

        // Insert or ignore duplicates
        await db.query(
            'INSERT INTO newsletter_subscribers (email, source_ip, user_agent) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
            [email, ip || null, ua || null]
        );

        if (contentType.includes('application/json')) {
            return new Response(JSON.stringify({ ok: true }), {
                headers: { 'content-type': 'application/json' },
            });
        }

        return redirect('/thank-you', 303);

    } catch (err: any) {
        logger.error(err);
        if ((request.headers.get('content-type') || '').includes('application/json')) {
            return new Response(JSON.stringify({ ok: false, message: err.message || 'server error' }), {
                status: 500,
                headers: { 'content-type': 'application/json' },
            });
        }
        return redirect('/?error=server', 303);
    }
};
