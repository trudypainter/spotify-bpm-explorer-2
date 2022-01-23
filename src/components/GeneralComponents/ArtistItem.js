import "./ArtistItem.css";

const ArtistItem = (props) => {
  return (
    <div className="artistItem">
      <div
        className="artistName"
        onMouseEnter={() => {
          //get artist's top tracks then set song obj
          fetch(
            "https://api.spotify.com/v1/artists/" +
              props.artistObj.id +
              "/top-tracks?market=US&limit=3",
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + props.token,
              },
            }
          )
            .then((response) => response.json())
            .then((data) => {
              console.log("🕹 ARTIST SONGS", data);
              props.enterNodeHandler(data.tracks[0]);
            });

          console.log(props.artistObj);
        }}
        onMouseLeave={() => {
          props.exitNodeHandler({});
        }}
        onClick={() => {
          props.onArtistClickedHandler(props.artistObj);
        }}
      >
        {props.artistObj.name}
      </div>
    </div>
  );
};

export default ArtistItem;
