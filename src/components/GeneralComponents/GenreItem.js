import "./GenreItem.css";

const GenreItem = (props) => {
  return (
    <div
      className="textDiv"
      //   onMouseEnter={() => {
      //     props.enterNodeHandler(props.songObj);
      //   }}
      //   onMouseLeave={() => {
      //     props.exitNodeHandler({});
      //   }}
      onClick={() => {
        props.genreClickedHandler(props.genreName);
      }}
    >
      {props.genreName}
    </div>
  );
};

export default GenreItem;
