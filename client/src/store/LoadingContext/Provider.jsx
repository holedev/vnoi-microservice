import { useState } from "react";
import Context from "./Context";

function LoadingProvider({ children }) {
    const [loading, setLoading] = useState(false);

    return (
        <Context.Provider value={[loading, setLoading]}>
            {children}
        </Context.Provider>
    );
}

export default LoadingProvider;
