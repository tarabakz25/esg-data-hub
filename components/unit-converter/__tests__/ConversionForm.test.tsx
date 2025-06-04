import { test, expect } from '@playwright/test';

test.describe('ConversionForm', () => {
  test.beforeEach(async ({ page }) => {
    // テスト用にNext.jsアプリケーションが起動している前提
    await page.goto('/unit-converter');
  });

  test('CO2排出量の変換フロー: 1500kg → 1.5t', async ({ page }) => {
    // KPI選択
    await page.selectOption('#kpi-select', 'co2_emissions');
    
    // 値入力
    await page.fill('#value-input', '1500');
    
    // 単位入力
    await page.fill('#unit-input', 'kg');
    
    // 変換実行
    await page.click('button[type="submit"]');
    
    // ローディング状態の確認
    await expect(page.locator('text=変換中...')).toBeVisible();
    
    // 結果の確認
    await expect(page.locator('text=変換成功')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=1,500')).toBeVisible(); // 変換前
    await expect(page.locator('text=1.5')).toBeVisible(); // 変換後
    await expect(page.locator('text=t')).toBeVisible(); // 標準単位
    
    // 変換情報の確認
    await expect(page.locator('text=co2_emissions')).toBeVisible();
    await expect(page.locator('text=0.001')).toBeVisible(); // 変換係数
  });

  test('エネルギー消費量の変換フロー: 5000kJ → 5MJ', async ({ page }) => {
    // KPI選択
    await page.selectOption('#kpi-select', 'energy_consumption');
    
    // 値入力
    await page.fill('#value-input', '5000');
    
    // 単位入力
    await page.fill('#unit-input', 'kJ');
    
    // 変換実行
    await page.click('button[type="submit"]');
    
    // 結果の確認
    await expect(page.locator('text=変換成功')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=5,000')).toBeVisible(); // 変換前
    await expect(page.locator('text=5')).toBeVisible(); // 変換後
    await expect(page.locator('text=MJ')).toBeVisible(); // 標準単位
  });

  test('エラーケース: 互換性のない単位', async ({ page }) => {
    // KPI選択（質量系）
    await page.selectOption('#kpi-select', 'co2_emissions');
    
    // 値入力
    await page.fill('#value-input', '100');
    
    // 互換性のない単位（長さ系）
    await page.fill('#unit-input', 'm');
    
    // 変換実行
    await page.click('button[type="submit"]');
    
    // エラー結果の確認
    await expect(page.locator('text=変換失敗')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=単位変換不可')).toBeVisible();
  });

  test('バリデーション: 必須項目未入力', async ({ page }) => {
    // 何も入力せずに送信ボタンを確認
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
    
    // KPIのみ選択
    await page.selectOption('#kpi-select', 'co2_emissions');
    await expect(submitButton).toBeDisabled();
    
    // 値も入力
    await page.fill('#value-input', '1000');
    await expect(submitButton).toBeDisabled();
    
    // 単位も入力 → ボタンが有効になる
    await page.fill('#unit-input', 'kg');
    await expect(submitButton).toBeEnabled();
  });

  test('変換履歴の更新確認', async ({ page }) => {
    // 初期状態では履歴が空
    await expect(page.locator('text=変換ログがありません')).toBeVisible();
    
    // 変換実行
    await page.selectOption('#kpi-select', 'co2_emissions');
    await page.fill('#value-input', '1000');
    await page.fill('#unit-input', 'kg');
    await page.click('button[type="submit"]');
    
    // 変換成功確認
    await expect(page.locator('text=変換成功')).toBeVisible({ timeout: 10000 });
    
    // 履歴に反映されているか確認
    await expect(page.locator('text=1件の変換ログ')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('td:has-text("co2_emissions")')).toBeVisible();
    await expect(page.locator('td:has-text("1,000 kg")')).toBeVisible();
    await expect(page.locator('td:has-text("1 t")')).toBeVisible();
  });

  test('KPIフィルター機能', async ({ page }) => {
    // 複数のKPIで変換実行
    // CO2排出量
    await page.selectOption('#kpi-select', 'co2_emissions');
    await page.fill('#value-input', '1000');
    await page.fill('#unit-input', 'kg');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=変換成功')).toBeVisible({ timeout: 10000 });
    
    // エネルギー消費量
    await page.selectOption('#kpi-select', 'energy_consumption');
    await page.fill('#value-input', '2000');
    await page.fill('#unit-input', 'kJ');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=変換成功')).toBeVisible({ timeout: 10000 });
    
    // 全ログ確認
    await expect(page.locator('text=2件の変換ログ')).toBeVisible();
    
    // CO2排出量でフィルター
    await page.selectOption('#kpi-filter', 'co2_emissions');
    await expect(page.locator('text=1件の変換ログ')).toBeVisible();
    await expect(page.locator('text=(co2_emissionsでフィルター中)')).toBeVisible();
    
    // フィルタークリア
    await page.selectOption('#kpi-filter', '');
    await expect(page.locator('text=2件の変換ログ')).toBeVisible();
  });
}); 