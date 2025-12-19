/**
 * 評価観点定義
 * 動作種別ごとの評価基準を管理
 */

/**
 * 動作種別ごとの評価観点
 */
export const CRITERIA = {
    // スクワット（前方視点）
    squat_front: [
        {
            id: 'knee_stability',
            name: '膝の安定性',
            description: '膝が内側（knee valgus）に入っていないか'
        },
        {
            id: 'foot_position',
            name: '足幅・足位置',
            description: '肩幅程度で左右対称か'
        },
        {
            id: 'trunk_stability',
            name: '体幹の安定性',
            description: '過度な側方への傾きがないか'
        },
        {
            id: 'symmetry',
            name: '動作の対称性',
            description: '左右均等に動作できているか'
        }
    ],

    // スクワット（側方視点）
    squat_side: [
        {
            id: 'knee_position',
            name: '膝の位置',
            description: '膝がつま先より過度に前に出ていないか'
        },
        {
            id: 'hip_flexion',
            name: '股関節の屈曲',
            description: '適切な深さまで屈曲できているか'
        },
        {
            id: 'spine_alignment',
            name: '脊柱のアライメント',
            description: '過度な前傾・後傾がないか'
        },
        {
            id: 'movement_smoothness',
            name: '動作の滑らかさ',
            description: 'スムーズに上下動できているか'
        }
    ],

    // 歩行動作
    gait: [
        {
            id: 'arm_swing',
            name: '腕振り',
            description: '自然な振り幅・リズムか'
        },
        {
            id: 'stride_length',
            name: '歩幅',
            description: '一定のリズムで歩けているか'
        },
        {
            id: 'foot_contact',
            name: '接地パターン',
            description: '踵接地→足底→蹴り出しの流れ'
        },
        {
            id: 'posture',
            name: '姿勢',
            description: '頭部・体幹のアライメント'
        }
    ]
};

/**
 * 点数の意味定義
 * ※優劣判定ではなく、自己比較・振り返りのための指標
 */
export const SCORE_DEFINITIONS = {
    1: '改善の余地が大きい - 基本的な動作パターンの習得が推奨される',
    2: '発展途上 - 意識的な練習で改善が期待できる',
    3: '標準的 - 基本は押さえられているが、さらなる洗練の余地あり',
    4: '良好 - 多くの観点で適切な動作が見られる',
    5: '優れている - 模範的な動作パターンが観察される'
};

/**
 * 総合スコアの解釈
 */
export const SCORE_INTERPRETATION = {
    '16-20': '動作の基本がしっかり身についています。継続して維持していきましょう。',
    '11-15': '良い基盤があります。いくつかの観点を意識することで、さらに向上できます。',
    '6-10': 'いくつかの観点で改善の機会があります。フィードバックを参考に練習してみてください。',
    '1-5': '基礎から丁寧に練習することをお勧めします。教員や専門家に相談してください。'
};

/**
 * 動作種別のラベル
 */
export const MOVEMENT_LABELS = {
    squat_front: 'スクワット（前方）',
    squat_side: 'スクワット（側方）',
    gait: '歩行動作'
};
