import React from 'react';
import { VersioningModal } from './VersioningModal'
import Button from '@mui/material/Button';
import {Box} from "@mui/material";

interface VersionHtmlProps {
  versions: any[];
  isAutoVersioning: boolean;
  hasChanges: boolean;
  commitDescription: string;
  provider: any;
  versioningModalOpen: boolean;
  editor: any;
  handleVersioningClose: () => void;
  handleRevert: (version : number, versionData: any) => void;
  handleCommitDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNewVersion: (e: React.FormEvent) => void;
  showVersioningModal: () => void;
}

// @ts-ignore
const VersionHtml: React.FC<VersionHtmlProps> = ({
                                                   versions,
                                                   isAutoVersioning,
                                                   hasChanges,
                                                   commitDescription,
                                                   provider,
                                                   versioningModalOpen,
                                                   editor,
                                                   handleVersioningClose,
                                                   handleRevert,
                                                   handleCommitDescriptionChange,
                                                   handleNewVersion,
                                                   showVersioningModal,
                                                 }) => (
  <div>
    {/* Versioning Modal */}
    <VersioningModal
      versions={versions}
      isOpen={versioningModalOpen}
      onClose={handleVersioningClose}
      onRevert={handleRevert}
      provider={provider}
    />

    <div className="col-group">
      <div className="sidebar-options">
        {/* Auto Versioning Section */}
        <div className="option-group">
          <div className="label-large">Auto versioning</div>
          <div className="switch-group">
            <label>
              <input
                type="radio"
                name="auto-versioning"
                onChange={() =>
                  !isAutoVersioning && editor.commands.toggleVersioning()
                }
                checked={isAutoVersioning}
              />
              Enable
            </label>
            <label>
              <input
                type="radio"
                name="auto-versioning"
                onChange={() =>
                  isAutoVersioning && editor.commands.toggleVersioning()
                }
                checked={!isAutoVersioning}
              />
              Disable
            </label>
          </div>
        </div>

        <hr />

        {/* Manual Versioning Section */}
        <div className="option-group">
          <div className="label-large">Manual versioning</div>
          <div className="label-small">
            Make adjustments to the document to manually save a new version.
          </div>
          <form className="commit-panel" onSubmit={(e) => e.preventDefault()}>
            <Box>
                <input
                  type="text"
                  placeholder="Version name"
                  value={commitDescription}
                  onChange={handleCommitDescriptionChange}
                  disabled={!hasChanges}
                />
                <Box mt={1}>
                <Button
                  variant="outlined" size="small"
                  disabled={!hasChanges || commitDescription.length === 0}
                  onClick={handleNewVersion}
                >
                  Create
                </Button>
                </Box>
            </Box>
          </form>
        </div>

        <hr />

        {/* Show History Button */}
        <button
          className="primary"
          type="button"
          onClick={showVersioningModal}
        >
          Show history
        </button>
      </div>
    </div>
  </div>
);

export default VersionHtml;
