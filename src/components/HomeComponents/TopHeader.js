import { useEffect, useState } from "react";
import SongItem from "../GeneralComponents/SongItem";
import "./TopHeader.css";

const TopHeader = (props) => {
  // console.log("🟩", props.userInfo);
  useEffect(() => {}, []);
  const makePlaylistHandler = () => {
    fetch(
      "https://api.spotify.com/v1/users/" + props.userInfo.id + "/playlists",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + props.token,
        },
        body: JSON.stringify({
          name: `${parseInt(props.bpm)} BPM`,
          description: `with help from www.trudy.computer`,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("💗MADE PLAYLIST: ", data);

        // build list of uris for the playlist
        let uriList = [];
        for (var i = 0; i < props.selectedSongs.length; i++) {
          let songUri = props.selectedSongs[i].uri;
          uriList.push(songUri);
        }
        let uriString = uriList.join(",");
        console.log(uriString);
        console.log(data.href + "/tracks?uris=" + uriString);

        fetch(data.href + "/tracks?uris=" + uriString, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + props.token,
          },
          // body: JSON.stringify({
          //   uris: `${uriList}`,
          // }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("🅱️", data);
            alert("Made your playlist! Check in your Spotify library...");
          });
      });
  };

  return (
    <div className="topHeader">
      <div className="leftCorner">
        <div className="userImgWrapper">
          {/* {props.userInfo != undefined && (
            <img className="userImg" src={props.userInfo.images[0].url}></img>
          )} */}
        </div>
        <div className="bpmDisplay">{parseInt(props.bpm)} BPM</div>
      </div>
      <div className="selectedSongContainer">
        {props.selectedSongs.map((songObj) => (
          <div className="selectedSongFlex">
            <SongItem
              enterNodeHandler={props.enterNodeHandler}
              exitNodeHandler={props.exitNodeHandler}
              onSongClickedHandler={props.onSongClickedHandler}
              songObj={songObj}
            />
          </div>
        ))}
      </div>
      <div className="rightCorner">
        <div
          onClick={() => makePlaylistHandler()}
          className="makePlaylistButton"
        >
          MAKE PLAYLSIT
        </div>
        <div className="resetButton" onClick={() => window.location.reload()}>
          reset
        </div>
      </div>
    </div>
  );
};
export default TopHeader;
