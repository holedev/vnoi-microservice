import { _PROCESS_ENV } from "../../../configs/env/index.js";

export const handleCodeFromClient = (code) => {
  const libFstream = "#include <fstream>\n";

  const _ = "";
  const initFstream = `std::ifstream iFile("/app/input.txt");\nstd::ofstream oFile("/app/output.txt")${_};`;

  const file =
    `main()
    {\n
    if (!iFile) {
        std::cerr << "Failed to open input.txt" << std::endl;
        return 1;
    }
    if (!oFile) {
        std::cerr << "Failed to open output.txt" << std::endl;
        return 1;
    }
    
    int quantity, line_per_testcase;
    iFile >> quantity >> line_per_testcase; 
    while (quantity--) {` + "\n";

  code = code.replace(/cin\s*>>/g, "iFile >>");
  code = code.replace(/cout\s*<</g, "oFile <<");

  const part1 = code.split("main()")[0];
  const [part1_1, part1_2] = part1.split("using namespace std;");

  let part2 = code.split("main()")[1].trim().slice(1);
  part2 = part2.slice(0, part2.length - 1);

  return (
    libFstream +
    part1_1 +
    initFstream +
    "using namespace std;\n" +
    part1_2 +
    file +
    part2 +
    `oFile << "${_PROCESS_ENV.STRING_SPLIT_TESTCASE}";` +
    "\n}" +
    "\n}"
  );
};
