import { useEffect, useState } from "react";
import "./BottomBar.css";

const BottomBar = (props) => {
  return (
    <div className="bottomBar">
      <div className="currentlyPlayingContainer">
        {Object.keys(props.hoverSong).length > 1 && (
          <div className="playingFlex">
            <img
              src={props.hoverSong.album["images"][2]["url"]}
              className="currentlyPlayingImg"
            ></img>
            <div className="currentlyPlayingInfo">
              <div className="song">{props.hoverSong["name"]}</div>

              <div className="artist">
                {props.hoverSong.album["artists"][0]["name"]}
              </div>
              <div className="album">{props.hoverSong.album["name"]}</div>
            </div>

            {props.hoverSong.hasOwnProperty("artist_data") && (
              <div className="currentlyPlayingInfo">
                {" "}
                Genres: {props.hoverSong["artist_data"]["genres"].join(", ")}
              </div>
            )}
          </div>
        )}
      </div>

      {props.userPlaylists.length > 1 && !props.loading ? (
        <div
          className="addSectionButton"
          onClick={() => {
            console.log("section clicked");
            console.log(props.setInNewSectionState);
            props.setInNewSectionState(true);
          }}
        >
          NEW SECTION
        </div>
      ) : (
        <div className="addSectionButton">loading...</div>
      )}
    </div>
  );
};
export default BottomBar;
