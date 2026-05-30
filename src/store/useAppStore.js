import { create } from 'zustand/react'

const getInitialTheme = () => {
  const stored = localStorage.getItem('pdfbee-theme')
  if (stored) return stored
  return 'dark'
}

const useAppStore = create((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('pdfbee-theme', next)
      return { theme: next }
    }),

  files: [],
  setFiles: (files) => set({ files }),
  clearFiles: () => set({ files: [] }),

  processing: false,
  setProcessing: (processing) => set({ processing }),

  progress: 0,
  setProgress: (progress) => set({ progress }),

  result: null,
  setResult: (result) => set({ result }),
}))

export default useAppStore
