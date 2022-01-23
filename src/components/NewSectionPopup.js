import { useEffect, useState } from "react";
import SongSearch from "../PopupComponents/SongSearch";
import GenreItem from "./GeneralComponents/GenreItem";
import PlaylistItem from "./GeneralComponents/PlaylistItem";
import ArtistItem from "./GeneralComponents/ArtistItem";
import ArtistSearch from "./GeneralComponents/ArtistSearch";
import "./NewSectionPopup.css";

const NewSectionPopup = (props) => {
  // sort list of liked songs
  const sortedLikedGenres = Object.fromEntries(
    Object.entries(props.likedGenres).sort(([, b], [, a]) => a - b)
  );
  // console.log("🐶", props);

  return (
    <div>
      <div
        onClick={() => props.setInNewSectionState(false)}
        className="newSectionPopupBackground"
      ></div>
      <div className="newSectionPopup">
        <div className="genreSection">
          <div className="popupSectionTitle">Genres in this mix</div>

          <div className="textList">
            {props.selectedGenres.map((genre) => (
              <GenreItem
                genreName={genre}
                //   onMouseEnter={props.onMouseEnterGenre}
                //   onMouseEnter={props.onMouseExitGenre}
                genreClickedHandler={props.genreClickedHandler}
              />
            ))}
          </div>
          <div className="popupSectionTitle">Genres you like</div>
          <div className="textList">
            {Object.keys(sortedLikedGenres).map((genre) => (
              <GenreItem
                genreName={genre}
                //   onMouseEnter={props.onMouseEnterGenre}
                //   onMouseEnter={props.onMouseExitGenre}
                genreClickedHandler={props.genreClickedHandler}
              />
            ))}
          </div>
        </div>

        <div className="playlistSection">
          <div className="popupSectionTitle">Your Playlists</div>
          <div className="playlistList">
            {props.userPlaylists.map((playlist) => (
              <PlaylistItem
                playlist={playlist}
                //   onMouseEnter={props.onMouseEnterGenre}
                //   onMouseEnter={props.onMouseExitGenre}
                playlistClickedHandler={props.playlistClickedHandler}
              />
            ))}
          </div>
        </div>

        <div className="artistSection">
          <div className="popupSectionTitle">Artists You Like</div>
          <div className="playlistList">
            {props.likedArtists.map((artistObj) => (
              <ArtistItem
                enterNodeHandler={props.enterNodeHandler}
                exitNodeHandler={props.exitNodeHandler}
                onArtistClickedHandler={props.onArtistClickedHandler}
                token={props.token}
                artistObj={artistObj}
              />
            ))}
          </div>

          <div className="popupSectionTitle">Search Artists</div>
          <ArtistSearch
            enterNodeHandler={props.enterNodeHandler}
            exitNodeHandler={props.exitNodeHandler}
            onArtistClickedHandler={props.onArtistClickedHandler}
            token={props.token}
          />
        </div>
        {/* <div className="songSection">
          <div className="popupSectionTitle">Recommended Compatible Songs</div>
          <SongSearch
            enterNodeHandler={props.enterNodeHandler}
            exitNodeHandler={props.exitNodeHandler}
            onNodeClicked={props.onNodeClicked}
            token={props.token}
          />
        </div> */}
      </div>
    </div>
  );
};
export default NewSectionPopup;
