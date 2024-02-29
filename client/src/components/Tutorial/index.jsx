import ReactJoyride from "react-joyride";

function Tutorial({ setRun, steps, run, ...props }) {
    return (
        <ReactJoyride
            callback={(data) => {
                if (
                    data.status === "finished" ||
                    data.status === "skipped" ||
                    data.action === "close" ||
                    data.action === "skip"
                )
                    setRun(false);
            }}
            showProgress
            continuous
            showSkipButton
            scrollToFirstStep
            steps={steps}
            run={run}
            {...props}
        />
    );
}

export default Tutorial;
