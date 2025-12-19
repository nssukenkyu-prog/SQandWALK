/**
 * 入力バリデーション
 */

const VALID_MOVEMENT_TYPES = ['squat_front', 'squat_side', 'gait'];
const MAX_FRAMES = 10;

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

    if (!body.frames || !Array.isArray(body.frames) || body.frames.length === 0) {
        return {
            valid: false,
            message: 'フレーム画像データが含まれていません'
        };
    }

    if (body.frames.length > MAX_FRAMES) {
        return {
            valid: false,
            message: `フレーム数が多すぎます。最大${MAX_FRAMES}フレームまで対応しています`
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

    return {
        valid: true,
        message: null
    };
}
