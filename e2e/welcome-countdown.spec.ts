import { test, expect, type Page } from '@playwright/test'
import { WELCOME_COUNTDOWN_CONFIG } from '../src/config/countdown'

const targetTimeMs = new Date(WELCOME_COUNTDOWN_CONFIG.targetTimeIso).getTime()

async function openWelcomeAt(page: Page, nowMs: number) {
  await page.clock.install({ time: new Date(nowMs - 60000) })
  await page.goto('/')
  await page.getByRole('button', { name: /A08/ }).first().click()
  await page.clock.pauseAt(new Date(nowMs))
}

test.describe('欢迎页倒计时', () => {
  test('COUNTDOWN-001: 目标时间前展示天时分秒并每秒更新', async ({ page }) => {
    await openWelcomeAt(page, targetTimeMs - (((1 * 24 + 2) * 60 + 3) * 60 + 5) * 1000)

    await expect(page.getByTestId('countdown-days')).toHaveText('01')
    await expect(page.getByTestId('countdown-hours')).toHaveText('02')
    await expect(page.getByTestId('countdown-minutes')).toHaveText('03')
    await expect(page.getByTestId('countdown-seconds')).toHaveText('05')

    await page.clock.fastForward(1000)
    await expect(page.getByTestId('countdown-seconds')).toHaveText('04')
  })

  test('COUNTDOWN-002: 到达或超过目标时间后展示结束态且无负数', async ({ page }) => {
    await openWelcomeAt(page, targetTimeMs + 1000)

    await expect(page.getByText('活动已开始，欢迎直接入座点餐。')).toBeVisible()
    await expect(page.getByRole('timer')).not.toBeVisible()
    await expect(page.getByTestId('welcome-countdown')).not.toContainText('-')
  })

  test('COUNTDOWN-003: 刷新后基于当前时间重新计算', async ({ page }) => {
    await openWelcomeAt(page, targetTimeMs - 8000)

    await expect(page.getByTestId('countdown-seconds')).toHaveText('08')
    await page.clock.fastForward(2000)
    await page.reload()

    await expect(page.getByTestId('countdown-seconds')).toHaveText('06')
  })

  test('COUNTDOWN-004: 移动端视口下倒计时布局可读', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await openWelcomeAt(page, targetTimeMs - (((12 * 60 + 34) * 60 + 56) * 1000))

    await expect(page.getByTestId('welcome-countdown')).toBeVisible()
    await expect(page.getByRole('timer')).toBeVisible()
    await expect(page.getByTestId('countdown-days')).toBeVisible()
    await expect(page.getByTestId('countdown-hours')).toBeVisible()
    await expect(page.getByTestId('countdown-minutes')).toBeVisible()
    await expect(page.getByTestId('countdown-seconds')).toBeVisible()
    await expect(page.getByRole('button', { name: /进入点餐|Enter/ })).toBeVisible()
  })
})
