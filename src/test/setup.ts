import '@testing-library/jest-dom'

// Zustand persist 미들웨어가 localStorage를 사용하므로 jsdom의 localStorage를 초기화
beforeEach(() => {
  localStorage.clear()
})
