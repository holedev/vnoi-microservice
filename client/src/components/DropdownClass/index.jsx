import { MenuItem, Select } from "@mui/material";
import { useEffect, useState } from "react";
import axiosAPI, { endpoints } from "~/configs/axiosAPI";
import useUserContext from "~/hook/useUserContext";

function DropdownClass({
  withoutOlympic = true,
  withoutAll = false,
  classCurr,
  handleFilter,
  ...props
}) {
  const [user] = useUserContext();

  const [classList, setClassList] = useState([]);

  const getClassList = async () => {
    let endpoint = `${endpoints.classes}`;
    if (withoutOlympic) endpoint += "/get-classes-without-olympic";
    await axiosAPI.get(endpoint).then((res) => {
      const classList = res.data?.data;
      withoutAll
        ? setClassList(classList)
        : setClassList([{ _id: "all", name: "ALL" }, ...classList]);
    });
  };

  useEffect(() => {
    getClassList();
  }, []);

  return (
    <>
      {classList.length > 0 && (
        <Select
          {...props}
          size="small"
          value={classCurr || user.classCurr?._id || "all"}
          onChange={(e) => handleFilter(e.target.value, "classCurr")}
        >
          {classList.map((item) => {
            return (
              <MenuItem key={item._id} value={item._id}>
                {item.name}
              </MenuItem>
            );
          })}
        </Select>
      )}
    </>
  );
}

export default DropdownClass;
