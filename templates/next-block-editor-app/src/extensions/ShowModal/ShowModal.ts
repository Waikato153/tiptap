import { Attributes, Extension } from '@tiptap/core'
import '@tiptap/extension-text-style'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    showModal: {
      showModal: () => ReturnType
    }
  }
}

export const ShowModal = Extension.create({
  name: 'showModal',
  addCommands() {
    return {
      showModal: () => () => {
        // 自定义的模态框触发逻辑
        const event = new CustomEvent('show-modal')
        window.dispatchEvent(event)
        return true
      },
    }
  },
})

export default ShowModal
