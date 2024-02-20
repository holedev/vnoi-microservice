import ExampleItem from "./ExampleItem";

function ExampleList({ data }) {
    return (
        <div
            style={{
                marginBottom: "12px",
            }}
        >
            {data.map((item, index) => {
                return <ExampleItem key={index} data={item} id={index + 1} />;
            })}
        </div>
    );
}

export default ExampleList;
