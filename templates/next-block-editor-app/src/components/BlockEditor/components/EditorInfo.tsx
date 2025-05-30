import { WebSocketStatus } from '@hocuspocus/provider'
import React, { memo } from 'react'
import { EditorUser } from '../types'
import { cn } from '../../../lib/utils'
import { getConnectionText } from '../../../lib/utils/getConnectionText'
import Tooltip from '../../ui/Tooltip'
import { useReadOnly } from '@/hooks/useFileInfo'
import {Button} from "@mui/material";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

export type EditorInfoProps = {
  characters: number
  words: number
  collabState: WebSocketStatus
  users: EditorUser[]
}

export const EditorInfo = memo(({ characters, collabState, users, words }: EditorInfoProps) => {
  const isReadOnly = useReadOnly();

  return (
    <div className="flex items-center">
      <div className={`flex flex-col justify-center pr-4 ${!isReadOnly ? 'mr-4 text-right border-r border-neutral-200 dark:border-neutral-800' : ''}`}>
        <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          {words} {words === 1 ? 'word' : 'words'}
        </div>
        <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          {characters} {characters === 1 ? 'character' : 'characters'}
        </div>
      </div>
      {!isReadOnly && (
        <>
          <div className="flex items-center gap-2 mr-2">
            <div
              className={cn('w-2 h-2 rounded-full', {
                'bg-yellow-500 dark:bg-yellow-400': collabState === 'connecting',
                'bg-green-500 dark:bg-green-400': collabState === 'connected',
                'bg-red-500 dark:bg-red-400': collabState === 'disconnected',
              })}
            />
            <span className="max-w-[4rem] text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
              {getConnectionText(collabState)}
            </span>
          </div>
          {collabState === 'connected' && (
            <div className="flex flex-row items-center">
              <div className="relative flex flex-row items-center ml-3">
                {users.filter(user => user.name).slice(0, 3).map((user: EditorUser) => (
                  <div key={user.clientId} className="-ml-3">
                    <Tooltip title={user.name}>
                      <img
                        className="w-8 h-8 border border-white rounded-full dark:border-black"
                        src={`https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${
                          user.name
                        }&backgroundColor=${(user.color || '#FFA2A2').replace('#', '')}`}
                        alt="avatar"
                      />
                    </Tooltip>
                  </div>
                ))}
                {users.filter(user => user.name).length > 3 && (
                  <div className="-ml-3">
                    <div className="flex items-center justify-center w-8 h-8 font-bold text-xs leading-none border border-white dark:border-black bg-[#FFA2A2] rounded-full">
                      +{users.filter(user => user.name).length - 3}
                    </div>
                  </div>
                )}
              </div>

              <Button size="small"
                      variant="contained"
                      startIcon={<ExitToAppIcon />}
                      onClick={() => {
                        if (window.self !== window.top) {
                          window.parent.postMessage('closeEditor', '*');
                        } else {
                          window.close();
                        }
                      }}
                      style={{ marginLeft: '1rem' }}
                      color="error">
                Exit
              </Button>
            </div>

          )}
        </>
      )}

    </div>
  )
})

EditorInfo.displayName = 'EditorInfo'
