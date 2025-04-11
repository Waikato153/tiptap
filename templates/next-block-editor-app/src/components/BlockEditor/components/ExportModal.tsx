import React, { useEffect, useState } from 'react';
import API from "@/lib/api";

import { memo } from 'react';
import { Box, Button, Typography, Modal, Checkbox, FormControlLabel,AlertColor } from '@mui/material';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};



interface ExportModalProps {
    room?: string;
    isOpen: boolean;
    editor: any;
    showExportModal: (open: boolean) => void;
    tipsShow: (message: string, severity: AlertColor) => void;
}


export const ExportModal = memo<ExportModalProps>(
    ({
    tipsShow,
    room,
    isOpen,
    editor,
    showExportModal
    }) =>

    {

        const [coverRows, setCoverRows] = React.useState<{ cover_heading: string }[]>([]);

        useEffect(() => {
            // Fetch data when the dialog opens

            if (isOpen) {
            const fetchData = async () => {

                try {
                const response = await API.getSettings(room);

                if (typeof response['coverpage'] != undefined) {
                    setCoverRows(response['coverpage'] as { cover_heading: string }[]);
                }
            

                } catch (error) {
                console.error('Error fetching data:', error);
                } finally {

                }
            };
            fetchData();
            }
        }, [isOpen]);




    const handleOpen = () => {showExportModal(true)};
    const handleClose = () => {
        if (isLoading) return
        setCoverPage('')
        showExportModal(false)
    };

    const [isLoading, setIsLoading] = useState(false)

    const handleExport = async () => {

        const html = editor.getHTML();

        if (isLoading) return;

        setIsLoading(true)

        // @ts-ignore
        const result = await API.generatePDf(html, room, coverPage);
        setIsLoading(false)

        if (result == 0){
            tipsShow('Export failed', 'error');
        }else{
            tipsShow('Export success', 'success');
        }
    }

    const [coverPage, setCoverPage] = React.useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setCoverPage(event.target.value);
    };



    return (
        <div>

        <Modal open={isOpen} onClose={handleClose}>
            <Box sx={style}>

            <Typography variant="h6" component="h2" sx={{ color: 'black' }}>
                Export Settings
            </Typography>


            <FormControl sx={{ mt: 2, minWidth: 250  }}>
                <InputLabel id="demo-simple-select-helper-label">Cover Page</InputLabel>
                <Select
                    labelId="demo-simple-select-helper-label"
                    id="demo-simple-select-helper"
                    value={coverPage}
                    label="Cover Page"
                    onChange={handleChange}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {coverRows.map((option) => (
                    <MenuItem key={option.cover_heading} value={option.cover_heading}>
                        {option.cover_heading}
                    </MenuItem>
                ))}
                </Select>

            </FormControl>


            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                loading={isLoading}
                    loadingPosition="start"
                variant="contained" onClick={handleExport}>
                Export
            </Button>
            </Box>
    </Box>
        </Modal>
    </div>
    );
},
)

ExportModal.displayName = 'ExportModal'
