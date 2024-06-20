import { MenuItem, Select } from "@mui/material";
import { _LANG } from "../../../utils/compiler/data.js";
import styles from "./DropdownLanguage.module.css";

function DropdownLanguage({ value, handleChangeLanguage, availableListId = null, ...props }) {
  return (
    <Select
      {...props}
      className={styles.language}
      size='small'
      value={value || 54}
      label='Language'
      onChange={(e) => {
        handleChangeLanguage(e.target.value);
      }}
    >
      {_LANG.map((lang) => {
        if (!availableListId || availableListId.includes(lang.id)) {
          return (
            <MenuItem key={lang.id} value={lang.id}>
              {lang.name}
            </MenuItem>
          );
        }
        return null;
      })}
    </Select>
  );
}

export default DropdownLanguage;
