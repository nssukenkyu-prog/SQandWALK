/**
 * 評価観点定義（専門的バイオメカニクス観点）
 * 運動学・スポーツ科学の観点から動作を評価
 */

/**
 * 動作種別ごとの評価観点（専門的観点）
 */
export const CRITERIA = {
    // スクワット（前方視点）- 前額面分析
    squat_front: [
        {
            id: 'knee_valgus',
            name: '膝関節外反（Knee Valgus）',
            description: '下降相・上昇相での膝関節の内側偏位',
            detailedPoints: [
                '膝蓋骨が第2趾より内側に入っていないか',
                'Q角の増大傾向がないか',
                '股関節内転・内旋の代償がないか'
            ],
            relatedMuscles: ['中殿筋', '大殿筋', '外側広筋'],
            framePhase: '下降相中間〜最下点'
        },
        {
            id: 'weight_distribution',
            name: '荷重分布（Weight Distribution）',
            description: '両脚への均等な荷重配分',
            detailedPoints: [
                '骨盤の水平性が保たれているか',
                '肩のラインが傾いていないか',
                '片側への過度な重心移動がないか'
            ],
            relatedMuscles: ['体幹筋群', '股関節外転筋群'],
            framePhase: '全相を通して'
        },
        {
            id: 'trunk_lateral_shift',
            name: '体幹側方偏位（Lateral Trunk Shift）',
            description: '体幹の左右への傾斜・側屈',
            detailedPoints: [
                '脊柱の側屈がないか',
                '肩甲骨の高さに左右差がないか',
                '骨盤の挙上・下制がないか'
            ],
            relatedMuscles: ['腹斜筋群', '腰方形筋', '脊柱起立筋'],
            framePhase: '下降相〜上昇相'
        },
        {
            id: 'foot_arch_control',
            name: '足部アーチ制御（Foot Arch Control）',
            description: '足部内側縦アーチの維持',
            detailedPoints: [
                '過度な回内（pronation）がないか',
                '母趾球への過度な荷重がないか',
                '足部3点支持が維持されているか'
            ],
            relatedMuscles: ['後脛骨筋', '長腓骨筋', '足底筋群'],
            framePhase: '最下点付近'
        }
    ],

    // スクワット（側方視点）- 矢状面分析
    squat_side: [
        {
            id: 'hip_hinge',
            name: 'ヒップヒンジ（Hip Hinge）',
            description: '股関節屈曲と体幹前傾のバランス',
            detailedPoints: [
                '体幹と大腿の角度関係は適切か',
                '重心位置は足部上方に維持されているか',
                '臀部の後方移動は適切か'
            ],
            relatedMuscles: ['大殿筋', 'ハムストリングス', '脊柱起立筋'],
            framePhase: '下降相初期〜中間'
        },
        {
            id: 'knee_tracking',
            name: '膝関節軌道（Knee Tracking）',
            description: '膝関節の前方移動量と脛骨角度',
            detailedPoints: [
                '膝がつま先を過度に超えていないか',
                '脛骨の前傾角度は適切か（15-25度）',
                '膝関節屈曲角度は目標に達しているか'
            ],
            relatedMuscles: ['大腿四頭筋', '前脛骨筋'],
            framePhase: '最下点'
        },
        {
            id: 'spine_alignment',
            name: '脊柱アライメント（Spine Alignment）',
            description: '脊柱の自然な彎曲の維持',
            detailedPoints: [
                '腰椎前彎が維持されているか',
                '胸椎後彎の増大（丸背）がないか',
                '頸椎の過伸展・過屈曲がないか'
            ],
            relatedMuscles: ['多裂筋', '腹横筋', '脊柱起立筋'],
            framePhase: '最下点付近'
        },
        {
            id: 'depth_and_control',
            name: '深さと動作制御（Depth & Control）',
            description: '目標深度への到達と動作の滑らかさ',
            detailedPoints: [
                '大腿が床と平行以上の深さに達しているか',
                '下降・上昇の速度は一定か',
                '最下点での停止や動揺がないか'
            ],
            relatedMuscles: ['股関節屈筋群', '膝関節伸筋群'],
            framePhase: '全相を通して'
        }
    ],

    // 歩行動作 - 歩行分析
    gait: [
        {
            id: 'initial_contact',
            name: '初期接地（Initial Contact）',
            description: '踵接地パターンと下肢アライメント',
            detailedPoints: [
                '踵から接地しているか（heel strike）',
                '膝関節は軽度屈曲位か',
                '股関節伸展筋の遠心性収縮は見られるか'
            ],
            relatedMuscles: ['前脛骨筋', 'ハムストリングス', '大殿筋'],
            framePhase: '立脚初期'
        },
        {
            id: 'midstance_stability',
            name: '立脚中期安定性（Midstance Stability）',
            description: '単脚支持期の骨盤・体幹の安定性',
            detailedPoints: [
                '骨盤の水平性は保たれているか（トレンデレンブルグ徴候なし）',
                '体幹の側方動揺がないか',
                '支持脚の膝関節過伸展がないか'
            ],
            relatedMuscles: ['中殿筋', '大殿筋', '体幹筋群'],
            framePhase: '立脚中期'
        },
        {
            id: 'push_off',
            name: '蹴り出し（Push-off/Toe-off）',
            description: '推進力生成と足関節機能',
            detailedPoints: [
                '足関節底屈による推進力は十分か',
                '母趾での蹴り出しができているか',
                '股関節伸展は十分か'
            ],
            relatedMuscles: ['下腿三頭筋', '長母趾屈筋', '腸腰筋'],
            framePhase: '立脚後期〜遊脚初期'
        },
        {
            id: 'arm_swing_coordination',
            name: '腕振りと協調性（Arm Swing & Coordination）',
            description: '上下肢の協調的な運動パターン',
            detailedPoints: [
                '対側パターン（右脚前進時に左腕前方振り）があるか',
                '腕振りの振幅は適切か',
                '肩甲帯のリラックスした動きがあるか'
            ],
            relatedMuscles: ['三角筋', '広背筋', '体幹回旋筋群'],
            framePhase: '全相を通して'
        }
    ]
};

/**
 * 点数の意味定義（専門的解釈）
 */
export const SCORE_DEFINITIONS = {
    1: '要改善 - 明らかな代償動作や逸脱パターンが観察される。基礎的な動作学習が必要',
    2: '不十分 - 代償動作が見られ、意識的な修正練習が必要。筋力・柔軟性の評価も推奨',
    3: '許容範囲 - 軽度の逸脱はあるが機能的には許容範囲。継続的な練習で改善可能',
    4: '良好 - 目立った逸脱なく効率的な動作パターン。さらなる洗練の余地あり',
    5: '優秀 - 模範的な動作パターン。効率的で安定した運動制御が観察される'
};

/**
 * 総合スコアの解釈（専門的）
 */
export const SCORE_INTERPRETATION = {
    '16-20': '効率的な動作パターンが確立されています。現在の動作質を維持しながら、負荷漸増や応用動作への発展を検討できます。',
    '11-15': '基本的な動作パターンは習得されています。特定の観点で改善を意識した練習を行うことで、より効率的な動作に近づけます。',
    '6-10': '動作パターンに改善の余地があります。低負荷での基礎練習や、鏡を使ったフィードバック練習が効果的です。',
    '1-5': '基礎的な動作学習から開始することを推奨します。必要に応じて柔軟性・筋力の評価も検討してください。'
};

/**
 * 動作種別のラベル
 */
export const MOVEMENT_LABELS = {
    squat_front: 'スクワット（前方・前額面）',
    squat_side: 'スクワット（側方・矢状面）',
    gait: '歩行動作分析'
};

/**
 * フレームフェーズの説明
 */
export const FRAME_PHASE_DESCRIPTIONS = {
    squat: {
        1: '開始姿勢',
        2: '下降相初期',
        3: '下降相中間',
        4: '最下点',
        5: '上昇相中間',
        6: '終了姿勢'
    },
    gait: {
        1: '立脚初期（Initial Contact）',
        2: '荷重応答期（Loading Response）',
        3: '立脚中期（Midstance）',
        4: '立脚後期（Terminal Stance）',
        5: '遊脚前期（Pre-swing）',
        6: '遊脚期（Swing）'
    }
};
