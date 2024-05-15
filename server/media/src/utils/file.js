import fs from "fs";

const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    console.log("delete");
    fs.unlinkSync(filePath);
  }
};

export { deleteFile };
