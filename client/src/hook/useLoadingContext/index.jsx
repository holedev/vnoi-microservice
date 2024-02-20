import { Context as LoadingContext } from "../../store/LoadingContext";
import { useContext } from "react";

function useLoadingContext() {
    const [loading, setLoading] = useContext(LoadingContext);
    return [loading, setLoading];
}

export default useLoadingContext;
