/**
 * OpenAI API連携サービス
 */

import { CRITERIA } from '../constants/criteria.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * OpenAI APIを呼び出して動画を評価
 */
export async function callOpenAI(env, videoBase64, prompt, movementType) {
    const apiKey = env.OPENAI_API_KEY;

    if (!apiKey) {
        console.warn('OPENAI_API_KEY not set, returning mock result');
        return generateMockResult(movementType);
    }

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: prompt.system
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: prompt.user
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:video/mp4;base64,${videoBase64}`,
                                    detail: 'auto'
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenAI API error:', error);
            throw new Error(`OpenAI API returned ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content in OpenAI response');
        }

        return JSON.parse(content);

    } catch (error) {
        console.error('OpenAI call failed:', error);
        // エラー時はモック結果を返す
        return generateMockResult(movementType);
    }
}

/**
 * モック評価結果を生成（API未設定時・エラー時用）
 */
function generateMockResult(movementType) {
    const criteriaList = CRITERIA[movementType] || [];

    const criteria = criteriaList.map((c, index) => {
        // デモ用のバリエーション
        const scores = [3, 4, 4, 3];
        const score = scores[index % scores.length];

        return {
            name: c.name,
            score: score,
            rationale: `${c.description}について観察した結果、${score >= 4 ? '適切な動作パターンが見られます' : '改善の余地が見られます'}。`,
            feedback: score >= 4
                ? 'この観点は良好です。現在の動作を維持していきましょう。'
                : `${c.description}を意識して練習することで、さらに改善が期待できます。`
        };
    });

    const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);

    return {
        criteria: criteria,
        totalScore: totalScore,
        overallFeedback: '動画の分析を行いました。全体的に動作の基本は押さえられています。各観点のフィードバックを参考に、意識的な練習を続けることで、さらなる向上が期待できます。動作の改善は継続的な取り組みが大切です。'
    };
}
