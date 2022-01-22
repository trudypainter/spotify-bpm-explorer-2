import "./PlaylistItem.css";

const PlaylistItem = (props) => {
  return (
    <div
      className="playlistDiv"
      //   onMouseEnter={() => {
      //     props.enterNodeHandler(props.songObj);
      //   }}
      //   onMouseLeave={() => {
      //     props.exitNodeHandler({});
      //   }}
      onClick={() => {
        props.playlistClickedHandler(props.playlist.id);
      }}
    >
      {props.playlist.name}
    </div>
  );
};

export default PlaylistItem;
