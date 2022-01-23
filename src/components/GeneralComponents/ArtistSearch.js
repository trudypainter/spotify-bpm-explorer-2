import { useEffect, useState } from "react";
import ArtistItem from "../GeneralComponents/ArtistItem";
import "./ArtistSearch.css";

const ArtistSearch = (props) => {
  const [searchResults, setSearchResults] = useState([]);

  // function to search off of input
  const handleOnChange = (event) => {
    console.log(event.target.value);
    fetch(
      "https://api.spotify.com/v1/search?q=" +
        event.target.value +
        "&type=artist&limit=12",
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
        console.log("🌽 SEARCH RESULTS", data.artists.items);
        // CREATE FIRST SECTION WITH THE TOP SONGS
        setSearchResults([...data.artists["items"]]);
      });
  };

  return (
    <div className="artistSearchInitPopup">
      <div className="searchContainer">
        <input id="initialArtistSearchInput" onChange={handleOnChange}></input>
      </div>
      <div className="artistResultList">
        {searchResults.map((artistObj) => (
          <ArtistItem
            enterNodeHandler={props.enterNodeHandler}
            exitNodeHandler={props.exitNodeHandler}
            onArtistClickedHandler={props.onArtistClickedHandler}
            token={props.token}
            artistObj={artistObj}
          />
        ))}
      </div>
    </div>
  );
};
export default ArtistSearch;
