import { useEffect, useSyncExternalStore } from 'react'
import { loadQuizWeek, quizVersion, quizWeek, quizWeekFailed, quizWeekSettled, subscribeQuizzes } from '../content/catalog.ts'

/** Re-render when a week's quiz bank finishes downloading. */
export const useQuizzesLoaded = () => useSyncExternalStore(subscribeQuizzes, quizVersion)

/** The week's quiz bank, downloading it the first time it's needed. */
export function useQuizWeek(slug: string, week: number) {
  useQuizzesLoaded()
  useEffect(() => { void loadQuizWeek(slug, week) }, [slug, week])
  return { quiz: quizWeek(slug, week), settled: quizWeekSettled(slug, week), failed: quizWeekFailed(slug, week) }
}
