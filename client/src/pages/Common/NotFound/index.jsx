// const NotFound = () => {
//     return <h1>404 NotFound</h1>;
// };

// export default NotFound;

import { useState } from "react";
import axios from "axios";

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [inputParams, setInputParams] = useState("");
    const [result, setResult] = useState("");

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleExecute = async () => {
        const formData = new FormData();
        formData.append("cppFile", selectedFile);
        formData.append("inputParams", inputParams);

        try {
            const response = await axios.post(
                "http://localhost:8080/api/cplusplus",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setResult(response.data);
        } catch (error) {
            console.error("Error executing:", error);
        }
    };

    return (
        <div>
            <h1>Execute C++ Function</h1>
            <input type="file" onChange={handleFileChange} />
            <br />
            <input
                type="text"
                placeholder="Input parameters"
                value={inputParams}
                onChange={(e) => setInputParams(e.target.value)}
            />
            <br />
            <button onClick={handleExecute}>Execute</button>
            <div>
                <h2>Result:</h2>
                <pre>{result}</pre>
            </div>
        </div>
    );
}

export default App;
