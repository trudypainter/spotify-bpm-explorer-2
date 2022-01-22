import { useEffect, useState } from "react";
import SongItem from "../components/GeneralComponents/SongItem";
import "./RecentSongs.css";

const RecentSongs = (props) => {
  const [userTopSongs, setUserTopSongs] = useState([]);

  // get recent songs
  useEffect(() => {
    fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term",
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
        console.log("🌽 TOP SONGS SHORT TERM", data);
        // CREATE FIRST SECTION WITH THE TOP SONGS
        const shortItems = [...data.items];

        fetch(
          "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term",
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
            console.log("🌽 TOP SONGS MEDIUM TERM", data);
            // CREATE FIRST SECTION WITH THE TOP SONGS
            setUserTopSongs([...shortItems, ...data.items]);
          });
      });
  }, [props.token]);

  return (
    <div className="recentSongsInitPopup">
      {userTopSongs.map((songObj) => (
        <SongItem
          enterNodeHandler={props.enterNodeHandler}
          exitNodeHandler={props.exitNodeHandler}
          onSongClickedHandler={props.onNodeClicked}
          songObj={songObj}
        />
      ))}
    </div>
  );
};
export default RecentSongs;
