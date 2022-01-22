import "./SongItem.css";

const songItem = (props) => {
  return (
    <div
      className="songItem"
      onMouseEnter={() => {
        props.enterNodeHandler(props.songObj);
      }}
      onMouseLeave={() => {
        props.exitNodeHandler({});
      }}
      onClick={() => {
        props.onSongClickedHandler(props.songObj);
      }}
    >
      <img
        className="songItemImg"
        src={props.songObj.album.images[2].url}
      ></img>
    </div>
  );
};

export default songItem;
