/**
 * プロンプト構築サービス
 */

import { CRITERIA, SCORE_DEFINITIONS } from '../constants/criteria.js';

/**
 * 禁止用語リスト
 */
const PROHIBITED_TERMS = [
    '診断', '異常', '疾患', '障害', '病気',
    '治療', '症状', '患者', '正常', '異常値'
];

/**
 * 動作種別に応じたプロンプトを構築
 */
export function buildPrompt(movementType) {
    const criteriaList = CRITERIA[movementType] || [];
    const movementLabels = {
        squat_front: 'スクワット（前方視点）',
        squat_side: 'スクワット（側方視点）',
        gait: '歩行動作'
    };

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(movementType, movementLabels[movementType], criteriaList);

    return {
        system: systemPrompt,
        user: userPrompt
    };
}

/**
 * システムプロンプトを構築
 */
function buildSystemPrompt() {
    return `あなたは運動学習を支援する教育AIです。動画から動作パターンを観察し、教育的なフィードバックを提供します。

## 絶対に守るべきルール

1. 以下の用語を絶対に使用しないでください：${PROHIBITED_TERMS.join('、')}
2. 「〜すべき」「間違っている」など断定的な表現を避けてください
3. 評価は教育目的の参考情報であることを常に意識してください
4. 最終判断は教員・指導者・本人が行う前提で回答してください

## 使用すべき表現例

❌ 「膝の動きが異常です」
✅ 「膝が内側に入る傾向が見られます」

❌ 「姿勢に問題があります」
✅ 「体幹がやや前傾している場面があります」

❌ 「この動作は間違っています」
✅ 「この観点では改善の余地が見られます」

## スコアの意味

${Object.entries(SCORE_DEFINITIONS).map(([score, def]) => `- ${score}点: ${def}`).join('\n')}

## 出力形式

必ず以下のJSON形式で出力してください：

{
  "criteria": [
    {
      "name": "観点名",
      "score": 1-5の整数,
      "rationale": "観察に基づく根拠説明",
      "feedback": "改善に向けたアドバイス"
    }
  ],
  "totalScore": 4観点の合計点,
  "overallFeedback": "全体的なフィードバック（100-200字程度）"
}`;
}

/**
 * ユーザープロンプトを構築
 */
function buildUserPrompt(movementType, movementLabel, criteriaList) {
    const criteriaDescription = criteriaList.map((c, i) =>
        `${i + 1}. ${c.name}: ${c.description}`
    ).join('\n');

    return `以下の動画は「${movementLabel}」の動作です。
教育目的で、動作パターンを観察し評価してください。

## 評価観点

${criteriaDescription}

## 注意事項

- 各観点を1〜5点で評価してください
- 点数の根拠を具体的に説明してください
- 改善に向けた建設的なフィードバックを提供してください
- 断定的な表現や医学用語は避けてください

動画を分析し、JSON形式で評価結果を出力してください。`;
}
