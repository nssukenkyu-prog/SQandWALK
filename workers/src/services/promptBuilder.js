/**
 * プロンプト構築サービス（専門的評価版）
 */

import { CRITERIA, SCORE_DEFINITIONS, FRAME_PHASE_DESCRIPTIONS } from '../constants/criteria.js';

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
        squat_front: 'スクワット（前方視点・前額面分析）',
        squat_side: 'スクワット（側方視点・矢状面分析）',
        gait: '歩行動作（矢状面分析）'
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
    return `あなたは運動学・バイオメカニクスの専門知識を持つ教育AIです。
動画から抽出されたフレーム画像を分析し、動作パターンを専門的観点から評価してフィードバックを提供します。

## あなたの役割
- 運動学的観点から動作パターンを観察・分析する
- 各評価観点について、具体的な所見と教育的フィードバックを提供する
- どのフレーム（画像）を根拠に評価したかを明示する

## 絶対に守るべきルール

1. 以下の用語を絶対に使用しないでください：${PROHIBITED_TERMS.join('、')}
2. 「〜すべき」「間違っている」など断定的な表現を避けてください
3. 評価は教育目的の参考情報であることを常に意識してください
4. 最終判断は教員・指導者・本人が行う前提で回答してください

## 専門用語の使い方
- 専門用語は使用してよいが、必ず日本語での説明を併記する
- 例：「膝関節外反（Knee Valgus）が観察されます」

## スコアの意味

${Object.entries(SCORE_DEFINITIONS).map(([score, def]) => `- ${score}点: ${def}`).join('\n')}

## 出力形式

必ず以下のJSON形式で出力してください：

{
  "criteria": [
    {
      "name": "評価観点名",
      "score": 1-5の整数,
      "rationale": "観察に基づく詳細な所見（どのフレームで何が観察されたか）",
      "frameReferences": [使用したフレーム番号の配列, 例: [2, 3, 4]],
      "feedback": "改善に向けた具体的なアドバイス（エクササイズ提案も可）"
    }
  ],
  "totalScore": 4観点の合計点,
  "overallFeedback": "全体的なフィードバック（動作の特徴、強み、改善優先順位を含む）"
}`;
}

/**
 * ユーザープロンプトを構築
 */
function buildUserPrompt(movementType, movementLabel, criteriaList) {
    const isSquat = movementType.startsWith('squat');
    const phaseDescriptions = isSquat
        ? FRAME_PHASE_DESCRIPTIONS.squat
        : FRAME_PHASE_DESCRIPTIONS.gait;

    const phaseList = Object.entries(phaseDescriptions)
        .map(([num, desc]) => `  - フレーム${num}: ${desc}`)
        .join('\n');

    const criteriaDescription = criteriaList.map((c, i) => {
        const points = c.detailedPoints.map(p => `    - ${p}`).join('\n');
        return `### ${i + 1}. ${c.name}
**観察ポイント**: ${c.description}
**詳細チェック項目**:
${points}
**関連筋群**: ${c.relatedMuscles.join('、')}
**主な観察フェーズ**: ${c.framePhase}`;
    }).join('\n\n');

    return `## 評価対象
「${movementLabel}」の動作を分析してください。

## 送信されるフレーム画像について
6枚のフレーム画像が送信されます。各フレームは動作の異なるフェーズを表しています：
${phaseList}

## 評価観点

${criteriaDescription}

## 分析の注意点

1. **フレーム参照を明記**: 各観点の評価で、どのフレーム（1-6）を根拠にしたかを必ず記載してください
2. **具体的な所見**: 「〜が見られる」「〜の傾向がある」など、観察に基づく具体的な記述をしてください
3. **改善提案**: フィードバックには可能であれば具体的なエクササイズや意識するポイントを含めてください
4. **禁止表現**: 医学的診断を示唆する表現は使用しないでください

画像を分析し、JSON形式で評価結果を出力してください。`;
}
