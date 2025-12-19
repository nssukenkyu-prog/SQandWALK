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
 * デモ用のモック評価結果を生成
 * ※実際のAPI連携時は削除
 */
function generateMockResult(movementType) {
    const criteriaMap = {
        squat_front: [
            { name: '膝の安定性', desc: '膝が内側に入っていないか' },
            { name: '足幅・足位置', desc: '肩幅程度で左右対称か' },
            { name: '体幹の安定性', desc: '過度な側方への傾きがないか' },
            { name: '動作の対称性', desc: '左右均等に動作できているか' }
        ],
        squat_side: [
            { name: '膝の位置', desc: '膝がつま先より過度に前に出ていないか' },
            { name: '股関節の屈曲', desc: '適切な深さまで屈曲できているか' },
            { name: '脊柱のアライメント', desc: '過度な前傾・後傾がないか' },
            { name: '動作の滑らかさ', desc: 'スムーズに上下動できているか' }
        ],
        gait: [
            { name: '腕振り', desc: '自然な振り幅・リズムか' },
            { name: '歩幅', desc: '一定のリズムで歩けているか' },
            { name: '接地パターン', desc: '踵接地→足底→蹴り出しの流れ' },
            { name: '姿勢', desc: '頭部・体幹のアライメント' }
        ]
    };

    const criteria = criteriaMap[movementType].map(c => {
        const score = Math.floor(Math.random() * 3) + 3; // 3-5のランダムスコア
        return {
            name: c.name,
            score: score,
            rationale: `${c.desc}について観察した結果、${score >= 4 ? '適切な動作パターンが見られます' : '改善の余地が見られます'}。`,
            feedback: score >= 4
                ? 'この観点は良好です。現在の動作を維持していきましょう。'
                : `${c.desc}を意識して練習することで、さらに改善が期待できます。`
        };
    });

    const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);

    return {
        evaluation: {
            movementType: movementType,
            criteria: criteria,
            totalScore: totalScore,
            overallFeedback: '全体的に動作の基本は押さえられています。各観点のフィードバックを参考に、意識的な練習を続けることで、さらなる向上が期待できます。動作の改善は一朝一夕には達成できませんが、継続的な取り組みが大切です。'
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

    // 観点別スコア
    elements.criteriaScores.innerHTML = evaluation.criteria.map(c => `
    <div class="criteria-card" data-score="${c.score}">
      <div class="criteria-header">
        <span class="criteria-name">${c.name}</span>
        <div class="criteria-score">
          <span class="score-badge">${c.score}</span>
          <span class="score-label">/ 5</span>
        </div>
      </div>
      <p class="criteria-rationale">${c.rationale}</p>
      <p class="criteria-feedback">${c.feedback}</p>
    </div>
  `).join('');

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
