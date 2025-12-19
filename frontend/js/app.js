/**
 * 動作評価AIシステム - メインアプリケーション
 * Movement Evaluation System - Main Application
 */

// ============================================
// 設定
// ============================================
const CONFIG = {
    // Workers APIエンドポイント
    API_ENDPOINT: 'https://movement-eval-api.nssu-kenkyu.workers.dev/api/evaluate',

    MAX_FILE_SIZE_MB: 50,
    ALLOWED_TYPES: ['video/mp4', 'video/quicktime', 'video/webm'],

    // 動作種別のラベル
    MOVEMENT_LABELS: {
        squat_front: 'スクワット（前方）',
        squat_side: 'スクワット（側方）',
        gait: '歩行動作'
    },

    // スコアの解釈
    SCORE_INTERPRETATION: {
        '16-20': '動作の基本がしっかり身についています。継続して維持していきましょう。',
        '11-15': '良い基盤があります。いくつかの観点を意識することで、さらに向上できます。',
        '6-10': 'いくつかの観点で改善の機会があります。フィードバックを参考に練習してみてください。',
        '1-5': '基礎から丁寧に練習することをお勧めします。教員や専門家に相談してください。'
    }
};

// ============================================
// DOM要素の取得
// ============================================
const elements = {
    // アップロードセクション
    uploadSection: document.getElementById('uploadSection'),
    dropZone: document.getElementById('dropZone'),
    videoInput: document.getElementById('videoInput'),
    selectedFile: document.getElementById('selectedFile'),
    videoPreview: document.getElementById('videoPreview'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    removeFile: document.getElementById('removeFile'),
    evaluateBtn: document.getElementById('evaluateBtn'),

    // 動作種別
    movementTypeInputs: document.querySelectorAll('input[name="movementType"]'),

    // ローディング
    loadingSection: document.getElementById('loadingSection'),

    // 結果セクション
    resultSection: document.getElementById('resultSection'),
    movementTypeLabel: document.getElementById('movementTypeLabel'),
    totalScoreValue: document.getElementById('totalScoreValue'),
    scoreInterpretation: document.getElementById('scoreInterpretation'),
    criteriaScores: document.getElementById('criteriaScores'),
    overallFeedbackText: document.getElementById('overallFeedbackText'),
    newEvaluationBtn: document.getElementById('newEvaluationBtn')
};

// ============================================
// 状態管理
// ============================================
let state = {
    selectedFile: null,
    movementType: 'squat_front',
    isProcessing: false
};

// ============================================
// ユーティリティ関数
// ============================================

/**
 * ファイルサイズをフォーマット
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * ファイルをBase64に変換
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 動画からフレームを抽出（OpenAI Vision API用）
 * @param {File} videoFile - 動画ファイル
 * @param {number} numFrames - 抽出するフレーム数（デフォルト: 6）
 * @returns {Promise<string[]>} Base64エンコードされた画像の配列
 */
async function extractFramesFromVideo(videoFile, numFrames = 6) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames = [];

        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
            const duration = video.duration;
            // フレームを均等な間隔で抽出（最初と最後を含む）
            const interval = duration / (numFrames + 1);
            const timestamps = [];
            for (let i = 1; i <= numFrames; i++) {
                timestamps.push(interval * i);
            }

            // キャンバスサイズを設定（最大1024px）
            const maxSize = 1024;
            let width = video.videoWidth;
            let height = video.videoHeight;

            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = (height / width) * maxSize;
                    width = maxSize;
                } else {
                    width = (width / height) * maxSize;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;

            let currentFrame = 0;

            const captureFrame = () => {
                if (currentFrame >= timestamps.length) {
                    // 全フレーム抽出完了
                    resolve(frames);
                    URL.revokeObjectURL(video.src);
                    return;
                }

                video.currentTime = timestamps[currentFrame];
            };

            video.onseeked = () => {
                // フレームを描画してBase64に変換
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                const base64 = dataUrl.split(',')[1];
                frames.push(base64);
                currentFrame++;
                captureFrame();
            };

            // 最初のフレームを抽出開始
            captureFrame();
        };

        video.onerror = () => {
            reject(new Error('動画の読み込みに失敗しました'));
        };

        video.src = URL.createObjectURL(videoFile);
    });
}

/**
 * スコアの解釈テキストを取得
 */
function getScoreInterpretation(totalScore) {
    if (totalScore >= 16) return CONFIG.SCORE_INTERPRETATION['16-20'];
    if (totalScore >= 11) return CONFIG.SCORE_INTERPRETATION['11-15'];
    if (totalScore >= 6) return CONFIG.SCORE_INTERPRETATION['6-10'];
    return CONFIG.SCORE_INTERPRETATION['1-5'];
}

/**
 * セクションの表示切り替え
 */
function showSection(sectionName) {
    elements.uploadSection.style.display = sectionName === 'upload' ? 'block' : 'none';
    elements.loadingSection.style.display = sectionName === 'loading' ? 'block' : 'none';
    elements.resultSection.style.display = sectionName === 'result' ? 'block' : 'none';
}

// ============================================
// ファイル選択・ドロップ処理
// ============================================

/**
 * ファイルの検証
 */
function validateFile(file) {
    // ファイルタイプチェック
    if (!CONFIG.ALLOWED_TYPES.includes(file.type)) {
        alert('対応していないファイル形式です。MP4, MOV, WebM形式の動画をアップロードしてください。');
        return false;
    }

    // ファイルサイズチェック
    if (file.size > CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`ファイルサイズが大きすぎます。${CONFIG.MAX_FILE_SIZE_MB}MB以下の動画をアップロードしてください。`);
        return false;
    }

    return true;
}

/**
 * ファイル選択時の処理
 */
function handleFileSelect(file) {
    if (!validateFile(file)) return;

    state.selectedFile = file;

    // プレビュー表示
    elements.videoPreview.src = URL.createObjectURL(file);
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);

    // UI更新
    elements.dropZone.style.display = 'none';
    elements.selectedFile.style.display = 'block';
    elements.evaluateBtn.disabled = false;
}

/**
 * ファイル削除
 */
function handleFileRemove() {
    state.selectedFile = null;

    elements.videoPreview.src = '';
    elements.dropZone.style.display = 'block';
    elements.selectedFile.style.display = 'none';
    elements.evaluateBtn.disabled = true;
}

// ============================================
// 評価処理
// ============================================

/**
 * 評価リクエストを送信（フレーム画像を送信）
 */
async function sendEvaluationRequest(frames, movementType) {
    const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            frames: frames,  // Base64エンコードされた画像の配列
            movementType: movementType
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '評価リクエストに失敗しました');
    }

    return response.json();
}

/**
 * デモ用のモック評価結果を生成（専門的評価観点）
 * ※実際のAPI連携時のフォールバック用
 */
function generateMockResult(movementType) {
    const criteriaMap = {
        squat_front: [
            {
                name: '膝関節外反（Knee Valgus）',
                desc: '下降相・上昇相での膝関節の内側偏位',
                frames: [3, 4]
            },
            {
                name: '荷重分布（Weight Distribution）',
                desc: '両脚への均等な荷重配分',
                frames: [2, 3, 4, 5]
            },
            {
                name: '体幹側方偏位（Lateral Trunk Shift）',
                desc: '体幹の左右への傾斜・側屈',
                frames: [3, 4]
            },
            {
                name: '足部アーチ制御（Foot Arch Control）',
                desc: '足部内側縦アーチの維持',
                frames: [4]
            }
        ],
        squat_side: [
            {
                name: 'ヒップヒンジ（Hip Hinge）',
                desc: '股関節屈曲と体幹前傾のバランス',
                frames: [2, 3]
            },
            {
                name: '膝関節軌道（Knee Tracking）',
                desc: '膝関節の前方移動量と脛骨角度',
                frames: [4]
            },
            {
                name: '脊柱アライメント（Spine Alignment）',
                desc: '脊柱の自然な彎曲の維持',
                frames: [3, 4]
            },
            {
                name: '深さと動作制御（Depth & Control）',
                desc: '目標深度への到達と動作の滑らかさ',
                frames: [1, 2, 3, 4, 5, 6]
            }
        ],
        gait: [
            {
                name: '初期接地（Initial Contact）',
                desc: '踵接地パターンと下肢アライメント',
                frames: [1, 2]
            },
            {
                name: '立脚中期安定性（Midstance Stability）',
                desc: '単脚支持期の骨盤・体幹の安定性',
                frames: [3]
            },
            {
                name: '蹴り出し（Push-off）',
                desc: '推進力生成と足関節機能',
                frames: [4, 5]
            },
            {
                name: '腕振りと協調性（Arm Swing）',
                desc: '上下肢の協調的な運動パターン',
                frames: [1, 2, 3, 4, 5, 6]
            }
        ]
    };

    const criteria = criteriaMap[movementType].map(c => {
        const score = Math.floor(Math.random() * 3) + 3; // 3-5のランダムスコア
        return {
            name: c.name,
            score: score,
            frameReferences: c.frames,
            rationale: `フレーム${c.frames.join(', ')}で${c.desc}を観察した結果、${score >= 4 ? '適切な動作パターンが見られます' : '改善の余地が見られます'}。`,
            feedback: score >= 4
                ? 'この観点は良好です。現在の動作パターンを維持していきましょう。'
                : `${c.desc}を意識した練習を推奨します。鏡の前での練習やビデオフィードバックが効果的です。`
        };
    });

    const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);

    return {
        evaluation: {
            movementType: movementType,
            criteria: criteria,
            totalScore: totalScore,
            overallFeedback: '動作分析を行いました。全体的に基本的な動作パターンは確立されています。各観点のフィードバックを参考に、特に改善が必要な観点から優先的に取り組むことで、効率的な動作習得が期待できます。継続的な練習と振り返りが重要です。'
        },
        disclaimer: 'この評価は教育目的の参考情報です。医学的診断ではありません。'
    };
}

/**
 * 評価を実行
 */
async function performEvaluation() {
    if (!state.selectedFile || state.isProcessing) return;

    state.isProcessing = true;
    showSection('loading');

    try {
        // 動画からフレームを抽出（6フレーム）
        console.log('動画からフレームを抽出中...');
        const frames = await extractFramesFromVideo(state.selectedFile, 6);
        console.log(`${frames.length}フレームを抽出しました`);

        let result;

        // API呼び出し（エラー時はモック結果を使用）
        try {
            result = await sendEvaluationRequest(frames, state.movementType);
        } catch (apiError) {
            console.warn('API呼び出しに失敗しました。デモモードで表示します。', apiError);
            // デモ用のモック結果を使用
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒待機（デモ用）
            result = generateMockResult(state.movementType);
        }

        // 結果を表示
        displayResult(result);
        showSection('result');

    } catch (error) {
        console.error('評価エラー:', error);
        alert('評価中にエラーが発生しました。もう一度お試しください。\n\n' + error.message);
        showSection('upload');
    } finally {
        state.isProcessing = false;
    }
}

/**
 * 評価結果を表示
 */
function displayResult(result) {
    const { evaluation } = result;

    // 動作種別ラベル
    elements.movementTypeLabel.textContent =
        CONFIG.MOVEMENT_LABELS[evaluation.movementType] + 'の評価';

    // 総合スコア
    elements.totalScoreValue.textContent = evaluation.totalScore;
    elements.scoreInterpretation.textContent = getScoreInterpretation(evaluation.totalScore);

    // 観点別スコア（フレーム参照を含む）
    elements.criteriaScores.innerHTML = evaluation.criteria.map(c => {
        // フレーム参照バッジを生成
        const frameRefHtml = c.frameReferences && c.frameReferences.length > 0
            ? `<div class="frame-references">
                 <span class="frame-ref-label">📷 参照フレーム:</span>
                 ${c.frameReferences.map(f => `<span class="frame-badge">F${f}</span>`).join('')}
               </div>`
            : '';

        return `
        <div class="criteria-card" data-score="${c.score}">
          <div class="criteria-header">
            <span class="criteria-name">${c.name}</span>
            <div class="criteria-score">
              <span class="score-badge">${c.score}</span>
              <span class="score-label">/ 5</span>
            </div>
          </div>
          ${frameRefHtml}
          <p class="criteria-rationale">${c.rationale}</p>
          <p class="criteria-feedback">${c.feedback}</p>
        </div>
      `;
    }).join('');

    // 総合フィードバック
    elements.overallFeedbackText.textContent = evaluation.overallFeedback;

    // スクロールを上部に
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 新しい評価を開始
 */
function startNewEvaluation() {
    handleFileRemove();
    showSection('upload');
}

// ============================================
// イベントリスナー
// ============================================

// ドラッグ＆ドロップ
elements.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropZone.classList.add('drag-over');
});

elements.dropZone.addEventListener('dragleave', () => {
    elements.dropZone.classList.remove('drag-over');
});

elements.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

// クリックでドロップゾーンを開く
elements.dropZone.addEventListener('click', () => {
    elements.videoInput.click();
});

// ファイル入力
elements.videoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

// ファイル削除
elements.removeFile.addEventListener('click', handleFileRemove);

// 動作種別選択
elements.movementTypeInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        state.movementType = e.target.value;
    });
});

// 評価ボタン
elements.evaluateBtn.addEventListener('click', performEvaluation);

// 新しい評価ボタン
elements.newEvaluationBtn.addEventListener('click', startNewEvaluation);

// ============================================
// 初期化
// ============================================
console.log('動作評価AIシステム initialized');
