import { useCallback, useState } from 'react'

export const CommentCard = ({
                              name,
                              createdAt,
                              content,
                              onEdit,
                              onDelete,
                              showActions = false,
                            }) => {
  const [isComposing, setIsComposing] = useState(false)
  const [composeValue, setComposeValue] = useState(content)

  const handleSubmit = useCallback(e => {
    e.preventDefault()

    if (onEdit) {
      setIsComposing(false)

      onEdit(composeValue)
    }
  }, [composeValue, onEdit])

  return (
    <div className="comment">
      <div className="label-group">
        <label>{name}</label>
        <label>{new Date(createdAt).toLocaleTimeString()}</label>
      </div>

      {!isComposing ? (
        <div className="comment-content">
          <p>{content}</p>
          {showActions ? (
            <div className="button-group">
              <button onClick={e => {
                e.preventDefault()
                e.stopPropagation()

                setIsComposing(true)
              }}>Edit</button>
              {onDelete ? <button onClick={e => {
                e.preventDefault()
                e.stopPropagation()

                onDelete()
              }}>Delete</button> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {isComposing ? (
        <div className="comment-edit">
          <form onSubmit={handleSubmit}>
            <textarea
              type="text"
              onChange={e => setComposeValue(e.currentTarget.value)}
              value={composeValue}
            />
            <div className="flex-row">
              <div className="button-group">
                <button type="reset" onClick={() => setIsComposing(false)}>Cancel</button>
                <button type="submit" className="primary" disabled={!composeValue.length || composeValue === content}>Accept</button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

    </div>
  )
}
