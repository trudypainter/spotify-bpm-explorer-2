import { useEffect, useState } from "react";
import SongItem from "../components/GeneralComponents/SongItem";
import "./SongSearch.css";

const SongSearch = (props) => {
  const [searchResults, setSearchResults] = useState([]);

  // function to search off of input
  const handleOnChange = (event) => {
    console.log(event.target.value);
    fetch(
      "https://api.spotify.com/v1/search?q=" +
        event.target.value +
        "&type=track&limit=12",
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
        console.log("🌽 SEARCH RESULTS", data);
        // CREATE FIRST SECTION WITH THE TOP SONGS
        setSearchResults([...data.tracks["items"]]);
      });
  };

  return (
    <div className="songSearchInitPopup">
      <div className="searchContainer">
        <input id="initialSongSearchInput" onChange={handleOnChange}></input>
      </div>
      <div className="resultsContainer">
        {searchResults.map((songObj) => (
          <SongItem
            enterNodeHandler={props.enterNodeHandler}
            exitNodeHandler={props.exitNodeHandler}
            onSongClickedHandler={props.onNodeClicked}
            songObj={songObj}
          />
        ))}
      </div>
    </div>
  );
};
export default SongSearch;
