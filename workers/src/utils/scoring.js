/**
 * スコア算出ユーティリティ
 */

import { SCORE_INTERPRETATION } from '../constants/criteria.js';

/**
 * 総合スコアを計算
 */
export function calculateTotalScore(criteria) {
    if (!Array.isArray(criteria) || criteria.length === 0) {
        return 0;
    }

    return criteria.reduce((sum, c) => sum + (c.score || 0), 0);
}

/**
 * スコアの解釈テキストを取得
 */
export function interpretScore(totalScore) {
    if (totalScore >= 16) return SCORE_INTERPRETATION['16-20'];
    if (totalScore >= 11) return SCORE_INTERPRETATION['11-15'];
    if (totalScore >= 6) return SCORE_INTERPRETATION['6-10'];
    return SCORE_INTERPRETATION['1-5'];
}

/**
 * 個別スコアの妥当性チェック
 */
export function validateScore(score) {
    const numScore = Number(score);
    return Number.isInteger(numScore) && numScore >= 1 && numScore <= 5;
}

/**
 * スコアを正規化（範囲外の場合は修正）
 */
export function normalizeScore(score) {
    const numScore = Number(score);
    if (isNaN(numScore)) return 3; // デフォルト値
    return Math.max(1, Math.min(5, Math.round(numScore)));
}
