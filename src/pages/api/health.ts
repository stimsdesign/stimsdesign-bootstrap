export const prerender = false;
/**
 * API Health Check Endpoint
 * Verifies the database connection by executing a simple query.
 */
import type { APIRoute } from 'astro';
import { db } from '@stimsdesign/core/db';
import { logger } from '@stimsdesign/core/logger';
import dotenv from "dotenv";
dotenv.config();

export const GET: APIRoute = async ({ url }) => {
  const key = url.searchParams.get("key");
  const secret = process.env.STIMSDESIGN_SECRET_KEY;

  if (!secret || key !== secret) {
    return new Response(null, { status: 404 });
  }

  try {
    const { rows } = await db.query('SELECT 1 as ok');
    return new Response(JSON.stringify(rows), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e: any) {
    logger.error(e);
    return new Response(`Health error: ${e.message}`, { status: 500 });
  }
};
