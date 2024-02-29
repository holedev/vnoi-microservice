import axiosAPI, { endpoints } from "~/configs/axiosAPI";

function useAxiosAPI() {
    return { axiosAPI, endpoints };
}

export default useAxiosAPI;
