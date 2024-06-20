import { Context as UserContext } from "~/store/UserContext";
import { useContext } from "react";

function useUserContext() {
  const [user, dispatch] = useContext(UserContext);
  return [user, dispatch];
}

export default useUserContext;
