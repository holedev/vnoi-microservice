export const steps = [
    {
        content: <h2>Welcome to problem page! Let see what we can do! 😁</h2>,
        placement: "center",
        target: "body",
    },
    {
        target: `[data-tour="problem-title"]`,
        content: "This is the problem's TITLE!",
    },
    {
        target: `[data-tour="problem-level"]`,
        content:
            "This is the problem's LEVEL! We have EASY, MEDIUM, HARD! The default is EASY!",
    },
    {
        target: `[data-tour="problem-time"]`,
        content:
            "Set your problem's starting and testing times! The starting time should be either now or later. The minimum duration for the testing time is 15 minutes. If you wish for the problem to be always open, select the 'ALWAYS OPEN' option below.",
    },
    {
        target: `[data-tour="problem-desc"]`,
        content:
            "This is the problem's DESCRIPTION! Use Markdown in the left box to format your text, and view the results in the Preview on the right. Markdown lets you stylize text, insert images, make lists, and more. If you need more infomation, check out https://www.markdownguide.org",
    },
    {
        target: `[data-tour="problem-solution"]`,
        content: (
            <p>
                This is the {"problem's"} SOLUTION section! Ensure your code is
                enclosed within three backticks (```) to designate the start and
                end of the code block. Currently, we only support C++ solutions.
                More languages will be added in our next update! You can see an
                example solution{" "}
                <a
                    rel="noreferrer"
                    href="https://github.com/anvyidol/vnoi-hcmc/tree/master/example"
                    target="_blank"
                >
                    here
                </a>
                .
            </p>
        ),
        placement: "top",
    },
    {
        target: `[data-tour="upload-btn"]`,
        content:
            "You can also upload your solution from a file. We support .cpp, .c, and .txt files.",
    },
    {
        target: `[data-tour="problem-testcase"]`,
        content: (
            <p>
                This is the {"problem's"} TESTCASE! You must write a script
                Javascript to generate testcases for your problem. The script
                must be a function that returns a string contain value concat
                with `\\n`. The script must be enclosed within three backticks
                (```). You can see an example script{" "}
                <a
                    rel="noreferrer"
                    href="https://github.com/anvyidol/vnoi-hcmc/tree/master/example"
                    target="_blank"
                >
                    here
                </a>
                .
            </p>
        ),
        placement: "top",
    },
    {
        target: `[data-tour="testcase-btn"]`,
        content:
            "You can test your script by clicking this button. The result demo will be displayed.",
    },
    {
        target: `[data-tour="testcase-with-file"]`,
        content: (
            <p>
                You can also upload your input testcase from a file. We support
                .txt files. In the first line, please specify the number of test
                cases and the number of lines in each test case. You can see an
                example file{" "}
                <a
                    rel="noreferrer"
                    href="https://github.com/anvyidol/vnoi-hcmc/tree/master/example"
                    target="_blank"
                >
                    here
                </a>
                .
            </p>
        ),
        placement: "left",
    },
    {
        target: `[data-tour="problem-init"]`,
        content:
            "This is the problem's INIT SOLUTION! This contain the code that will be added to the top of the solution code when the problem is created. This is useful for importing libraries, defining macros, etc. The code must be enclosed within three backticks (```).",
    },
    {
        target: `[data-tour="action-alway-open"]`,
        content:
            "Checked it and problem will not end! When it enable, time start and time test will disabled .The default is false.",
    },

    {
        target: `[data-tour="action-class"]`,
        content:
            "Don't forget to choose class available! The default is your class. If class is not available, contact to admin!",
        placement: "left",
    },
    {
        target: `[data-tour="action-submit"]`,
        content: "Click and create or update problem now! Good luck!",
        placement: "left",
    },
    {
        target: `[data-tour="action-tutorial"]`,
        content: "And if you need tutorial again, click here!",
    },
];
