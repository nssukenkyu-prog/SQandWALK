/**
 * 入力バリデーション
 */

const VALID_MOVEMENT_TYPES = ['squat_front', 'squat_side', 'gait'];
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * 評価リクエストのバリデーション
 */
export function validateRequest(body) {
    // 必須フィールドチェック
    if (!body) {
        return {
            valid: false,
            message: 'リクエストボディが空です'
        };
    }

    if (!body.video) {
        return {
            valid: false,
            message: '動画データが含まれていません'
        };
    }

    if (!body.movementType) {
        return {
            valid: false,
            message: '動作種別が指定されていません'
        };
    }

    // 動作種別チェック
    if (!VALID_MOVEMENT_TYPES.includes(body.movementType)) {
        return {
            valid: false,
            message: `無効な動作種別です。有効な値: ${VALID_MOVEMENT_TYPES.join(', ')}`
        };
    }

    // 動画サイズチェック（Base64の概算サイズ）
    const estimatedSize = (body.video.length * 3) / 4;
    if (estimatedSize > MAX_VIDEO_SIZE_BYTES) {
        return {
            valid: false,
            message: `動画サイズが大きすぎます。50MB以下のファイルをアップロードしてください`
        };
    }

    return {
        valid: true,
        message: null
    };
}

/**
 * Base64文字列の検証
 */
export function isValidBase64(str) {
    try {
        return btoa(atob(str)) === str;
    } catch (e) {
        return false;
    }
}
