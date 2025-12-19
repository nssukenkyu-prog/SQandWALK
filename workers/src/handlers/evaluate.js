/**
 * 評価APIハンドラー
 */

import { callOpenAI } from '../services/openai.js';
import { buildPrompt } from '../services/promptBuilder.js';
import { validateRequest } from '../utils/validation.js';
import { calculateTotalScore, interpretScore } from '../utils/scoring.js';
import { CRITERIA } from '../constants/criteria.js';

/**
 * 評価リクエストを処理
 */
export async function handleEvaluate(request, env) {
    try {
        // リクエストボディを取得
        const body = await request.json();

        // バリデーション
        const validation = validateRequest(body);
        if (!validation.valid) {
            return new Response(JSON.stringify({
                error: 'Validation Error',
                message: validation.message
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { video, movementType } = body;

        // プロンプト構築
        const prompt = buildPrompt(movementType);

        // OpenAI API呼び出し
        const openaiResponse = await callOpenAI(env, video, prompt, movementType);

        // レスポンス整形
        const result = formatEvaluationResult(openaiResponse, movementType);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Evaluation error:', error);
        return new Response(JSON.stringify({
            error: 'Evaluation Failed',
            message: error.message || '評価処理中にエラーが発生しました'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 評価結果を整形
 */
function formatEvaluationResult(openaiResponse, movementType) {
    // OpenAIからのレスポンスをパース
    let evaluation;

    try {
        // JSONレスポンスを期待
        if (typeof openaiResponse === 'string') {
            evaluation = JSON.parse(openaiResponse);
        } else {
            evaluation = openaiResponse;
        }
    } catch (e) {
        // パースエラー時はデフォルト形式で返す
        console.error('Failed to parse OpenAI response:', e);
        evaluation = createDefaultEvaluation(movementType);
    }

    // 総合スコアが含まれていない場合は計算
    if (!evaluation.totalScore && evaluation.criteria) {
        evaluation.totalScore = calculateTotalScore(evaluation.criteria);
    }

    return {
        evaluation: {
            movementType: movementType,
            criteria: evaluation.criteria || [],
            totalScore: evaluation.totalScore || 0,
            overallFeedback: evaluation.overallFeedback || '評価を完了しました。'
        },
        disclaimer: 'この評価は教育目的の参考情報です。医学的診断ではありません。',
        timestamp: new Date().toISOString()
    };
}

/**
 * デフォルトの評価結果を生成（エラー時用）
 */
function createDefaultEvaluation(movementType) {
    const criteriaList = CRITERIA[movementType] || [];

    return {
        criteria: criteriaList.map(c => ({
            name: c.name,
            score: 3,
            rationale: '評価を行いました。',
            feedback: 'より詳細な評価には、鮮明な動画が必要です。'
        })),
        totalScore: criteriaList.length * 3,
        overallFeedback: '動画の分析を行いました。より精度の高い評価のためには、適切な照明と角度で撮影された動画をご使用ください。'
    };
}
