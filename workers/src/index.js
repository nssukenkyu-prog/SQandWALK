/**
 * 動作評価API - Cloudflare Workers エントリーポイント
 */

import { handleEvaluate } from './handlers/evaluate.js';

// CORS設定
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // 本番環境では特定のオリジンに制限
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * OPTIONSリクエストの処理（CORS preflight）
 */
function handleOptions() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}

/**
 * ヘルスチェック
 */
function handleHealth() {
    return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'movement-eval-api'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
}

/**
 * メインハンドラー
 */
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        // CORS preflight
        if (method === 'OPTIONS') {
            return handleOptions();
        }

        try {
            // ルーティング
            if (path === '/api/health' && method === 'GET') {
                return handleHealth();
            }

            if (path === '/api/evaluate' && method === 'POST') {
                const response = await handleEvaluate(request, env);
                // CORSヘッダーを追加
                const headers = new Headers(response.headers);
                Object.entries(corsHeaders).forEach(([key, value]) => {
                    headers.set(key, value);
                });
                return new Response(response.body, {
                    status: response.status,
                    headers,
                });
            }

            // 404
            return new Response(JSON.stringify({
                error: 'Not Found',
                message: 'The requested endpoint does not exist'
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            });

        } catch (error) {
            console.error('Server error:', error);
            return new Response(JSON.stringify({
                error: 'Internal Server Error',
                message: error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            });
        }
    },
};
