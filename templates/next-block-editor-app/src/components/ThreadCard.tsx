import { useCallback, useEffect, useRef } from 'react'

// @ts-ignore
export const ThreadCard = ({
                             id,
                             active,
                             open,
                             children,
                             onClick,
                             onClickOutside,
                           }) => {
  const cardRef = useRef()
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(id)
    }
  }, [id, onClick])

  useEffect(() => {
    if (!active) {
      return () => null
    }

    const clickHandler = onClickOutside ? event => {
      if (!cardRef.current) {
        return
      }

      if (!cardRef.current.contains(event.target)) {
        onClickOutside()
      }
    } : null

    if (clickHandler) {
      document.addEventListener('click', clickHandler)
    }

    return () => {
      if (clickHandler) {
        document.removeEventListener('click', clickHandler)
      }
    }
  }, [active, onClickOutside])

  return (
    <div
      ref={cardRef}
      className={`thread${open ? ' is-open' : ''}${active ? ' is-active' : ''}`}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}