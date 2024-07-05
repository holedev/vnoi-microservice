import clsx from "clsx";
import useLoadingContext from "~/hook/useLoadingContext";
import styles from "./LoadingContext.module.css";

function LoadingSkeleton() {
  const [loading] = useLoadingContext();

  return (
    <div
      className={clsx("loading-skeleton", styles.wrapper, {
        [styles.hide]: !loading
      })}
    >
      <span className={styles.loading}></span>
    </div>
  );
}

export default LoadingSkeleton;
