import * as XLSX from "xlsx";

function downloadExcel(fileName, sheetName, data, mergeArr = []) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!merges"] = mergeArr;
    XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");
    XLSX.writeFile(wb, fileName);
}

export { downloadExcel };
