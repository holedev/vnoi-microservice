import { Box, Chip, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { _LANG } from '~/utils/compiler/data.js';

function AutocompleteLanguage({ availableLangList, updateLangList }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'top',
        gap: '12px',
        mt: '12px',
      }}
    >
      <Autocomplete
        size="small"
        options={_LANG}
        sx={{ minWidth: 300 }}
        renderInput={(params) => <TextField {...params} label="Language" />}
        getOptionLabel={(option) => option.name}
        onChange={(e, value) => {
          updateLangList({
            type: 'PUSH_ID',
            value: value.id,
          });
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        {availableLangList?.map((langId) => (
          <Chip
            sx={{
              userSelect: 'none',
            }}
            key={langId}
            onDoubleClick={() => {
              updateLangList({
                type: 'REMOVE_ID',
                value: langId,
              });
            }}
            label={_LANG.find((lang) => lang.id === langId)?.name}
          />
        ))}
      </Box>
    </Box>
  );
}

export default AutocompleteLanguage;
