import React, { useEffect, useState, useRef } from "react";
import { SpotifyAuth, Scopes } from "react-spotify-auth";

import { SpotifyApiContext } from "react-spotify-api";

import Cookies from "js-cookie";

import HomePage from "./components/HomePage";
import "./App.css";
import InitialPopup from "./components/InitialPopup";
import NewSectionPopup from "./components/NewSectionPopup";

const App = () => {
  const [spotifyAuthToken, setSpotifyAuthToken] = useState();

  //state management
  const [inInitialState, setInInitialState] = useState(true);
  const [inNewSectionState, setInNewSectionState] = useState(false);
  const [loading, setLoading] = useState(true);

  // homepage things
  const [bpm, setBpm] = useState(0.0);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [likedGenres, setLikedGenres] = useState({});
  const [likedArtists, setLikedArtists] = useState({});
  const [sections, setSections] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState({});

  // handle hovering
  const [hoverSong, setHoverSong] = useState({});
  const audioRef = useRef(new Audio(""));

  // hovering for song
  const enterNodeHandler = (hoverSong) => {
    audioRef.current.pause();
    setHoverSong(hoverSong);
    audioRef.current = new Audio(hoverSong.preview_url);
    audioRef.current.play();

    //get and set extra info for bottom player
    fetch(hoverSong["artists"][0]["href"], {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // set bpm for rest
        setHoverSong({ ...hoverSong, artist_data: data });
      });
  };
  const exitNodeHandler = (song) => {
    audioRef.current.pause();
    setHoverSong({});
  };

  // handle first song clicked
  const initialSongClicked = (songObj) => {
    audioRef.current.pause();
    setInInitialState(false);
    setSelectedSongs([songObj]);
    setHoverSong({});

    getUserTopGenres();

    //get starting BPM
    fetch("https://api.spotify.com/v1/audio-features/" + songObj.id, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // set bpm for rest
        setBpm(parseFloat(data.tempo));
      });

    //get and set extra selected genres
    fetch(hoverSong["artists"][0]["href"], {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // set bpm for rest
        setSelectedGenres([...data["genres"]]);
      });
  };

  // when song is clicked within homepage section
  const onSectionSongClickedHandler = (songClicked) => {
    setSelectedSongs([...selectedSongs, songClicked]);

    //get and add new selected genres
    fetch(songClicked["artists"][0]["href"], {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // update genres
        let genresToAdd = [];
        for (var i = 0; i < data["genres"].length; i++) {
          let genreToCheck = data["genres"][i];
          console.log("💗", genreToCheck);
          if (genreToCheck in selectedGenres) {
          } else {
            genresToAdd.push(genreToCheck);
            console.log("🎆", genreToCheck);
          }
        }
        setSelectedGenres([...selectedGenres, ...genresToAdd]);
      });
  };

  // 💠 genre clicked
  const genreClickedHandler = (genreName) => {
    setLoading(true);

    setInNewSectionState(false);
    console.log("💠", genreName);

    let playlistName = "The Sound of " + genreName;
    let genreNameQuery = playlistName.replaceAll(" ", "%20");
    console.log(genreNameQuery);

    let genreSongObjs = [];

    // search for sound of genre
    fetch(
      "https://api.spotify.com/v1/search?type=playlist&q=" + genreNameQuery,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data["playlists"]["items"][0]);

        // get song objs from list
        fetch(data["playlists"]["items"][0]["tracks"]["href"], {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data["items"]);
            genreSongObjs = [...data["items"]];

            let genreSectionTitle = "GENRE: " + genreName;
            getCompatibleSongsAndMakeSection(
              genreSongObjs,
              genreSectionTitle,
              "#fe5d5c"
            );
          });
      });
  };

  // helper for getting playlist tracks
  const getPlaylistTracks = (href, sofar, playlistName) => {
    // get playlist tracks
    fetch(href, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.next !== null) {
          getPlaylistTracks(data.next, [...sofar, ...data.items], playlistName);
        } else {
          getCompatibleSongsAndMakeSection(
            [...sofar, ...data.items],
            "PLAYLIST: " + playlistName,
            "#FE97ca"
          );
        }
      });
  };

  // 💠 playlist clicked
  const playlistClickedHandler = (playlistId) => {
    setLoading(true);
    setInNewSectionState(false);
    console.log("💠", playlistId);

    // get playlist tracks
    fetch("https://api.spotify.com/v1/playlists/" + playlistId, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        getPlaylistTracks(data.tracks.href, [], data.name);
      });
  };

  // helper for getting artist objs
  const getArtistSongObjs = (albumObjs, sofar, ix, artistName) => {
    console.log("🐭getting", albumObjs[ix].id, sofar);
    fetch(
      "https://api.spotify.com/v1/albums/" +
        albumObjs[ix].id +
        "/tracks?market=US&limit=50",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        // get the song obs
        let idList = "";
        for (var i = 0; i < data.items.length; i++) {
          idList = idList + data.items[i]["id"] + ",";
        }
        idList = idList.substring(0, idList.length - 1);
        console.log("IDLIST", idList);

        fetch("https://api.spotify.com/v1/tracks?ids=" + idList, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("🐻‍❄️TRACKS; ", data);
            sofar.push(...data.tracks);

            // then make section if done with songs
            if (ix > albumObjs.length - 2) {
              console.log("BOOOOM");
              getCompatibleSongsAndMakeSection(
                sofar,
                "ARTIST: " + artistName,
                "#FF8239"
              );
            } else {
              getArtistSongObjs(albumObjs, [...sofar], ix + 1, artistName);
            }
          });
      });
  };

  // 💠 artist clicked
  const onArtistClickedHandler = (artistObj) => {
    setInNewSectionState(false);
    setLoading(true);
    // get artists albums
    fetch(
      "https://api.spotify.com/v1/artists/" +
        artistObj.id +
        "/albums?market=US",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("🐢 ARITST ALBUMS", data);

        // then get the song obs
        getArtistSongObjs(data.items, [], 0, artistObj.name);
      });
  };

  // 🐞 load list of song objs and title

  const compatibleHelper = (
    listOfSongObjs,
    title,
    offset,
    sofar,
    sectionColor
  ) => {
    // build id list
    let idList = "";
    for (var i = 0; i < 100; i++) {
      if (offset + i < listOfSongObjs.length) {
        if ("id" in listOfSongObjs[offset + i]) {
          idList = idList + listOfSongObjs[offset + i].id + ",";
        } else {
          idList = idList + listOfSongObjs[offset + i]["track"].id + ",";
        }
      }
    }
    idList = idList.substring(0, idList.length - 1);
    console.log("🐯IDLIST:", idList);

    fetch("https://api.spotify.com/v1/audio-features?ids=" + idList, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + spotifyAuthToken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("🦆DATA:", data);

        // only add correct bpm songs
        for (var j = 0; j < data["audio_features"].length; j++) {
          // console.log(parseFloat(data["audio_features"][i].tempo), bpm);
          if (
            (parseFloat(data["audio_features"][j].tempo) < bpm + 3 &&
              parseFloat(data["audio_features"][j].tempo) > bpm - 3) ||
            (parseFloat(data["audio_features"][j].tempo) / 2 < bpm + 3 &&
              parseFloat(data["audio_features"][j].tempo) / 2 > bpm - 3) ||
            (parseFloat(data["audio_features"][j].tempo) * 2 < bpm + 3 &&
              parseFloat(data["audio_features"][j].tempo) * 2 > bpm - 3)
          ) {
            console.log(
              "🦀COMPARTIBLE SONG OB",
              offset,
              data["audio_features"][j],
              listOfSongObjs,
              listOfSongObjs[offset + j]
            );
            if ("id" in listOfSongObjs[offset + j]) {
              sofar.push(listOfSongObjs[offset + j]);
            } else {
              sofar.push(listOfSongObjs[offset + j]["track"]);
            }
          }
        }

        if (offset > listOfSongObjs.length - 101) {
          console.log("🚙", sofar);
          let sectionObj = {
            sectionTitle: title,
            sectionImg: "TODO",
            sectionColor: sectionColor,
            songObjs: sofar,
          };
          setSections([...sections, sectionObj]);
          setLoading(false);
        } else {
          offset = offset + 100;
          compatibleHelper(listOfSongObjs, title, offset, sofar, sectionColor);
        }
      });
  };

  // adds new section
  const getCompatibleSongsAndMakeSection = (
    listOfSongObjs,
    title,
    sectionColor
  ) => {
    // create list of comma separated spotify ids
    // NOTE: max 100 ids in one request
    var idList = "";
    console.log("🐣 SONG OBJS FOR NEW SECTION", listOfSongObjs, sectionColor);

    compatibleHelper(listOfSongObjs, title, 0, [], sectionColor);
    setLoading(true);
  };

  // get users top genres
  const getUserTopGenres = () => {
    let currentGenres = {};
    fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=50&time_range=short_term",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + spotifyAuthToken,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        // iterate over artists and get artists genre
        for (var i = 0; i < data["items"].length; i++) {
          // get artist's genre
          fetch(data["items"][i]["href"], {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + spotifyAuthToken,
            },
          })
            .then((response) => response.json())
            .then((data) => {
              // add genre if not in liked genres
              for (var i = 0; i < data["genres"].length; i++) {
                let genreToCheck = data["genres"][i];
                if (genreToCheck in currentGenres) {
                  let newGenreObj = { ...currentGenres };
                  newGenreObj[genreToCheck] = newGenreObj[genreToCheck] + 1;
                  currentGenres = { ...newGenreObj };
                } else {
                  let newGenreObj = { ...currentGenres };
                  newGenreObj[genreToCheck] = 1;
                  currentGenres = { ...newGenreObj };
                }
              }
              setLikedGenres({ ...currentGenres });
              setLoading(false);
            });
        }
      });
  };

  // get spotify auth token
  useEffect(() => {
    setSpotifyAuthToken(Cookies.get("spotifyAuthToken"));
  }, [Cookies.get("spotifyAuthToken")]);

  return (
    <div className="app">
      {/* If there is a cookie named 'spotifyAuthToken' */}
      {Cookies.get("spotifyAuthToken") ? (
        <SpotifyApiContext.Provider token={spotifyAuthToken}>
          <HomePage
            exitNodeHandler={exitNodeHandler}
            enterNodeHandler={enterNodeHandler}
            setSelectedSongs={setSelectedSongs}
            onSectionSongClickedHandler={onSectionSongClickedHandler}
            setLikedArtists={setLikedArtists}
            hoverSong={hoverSong}
            token={spotifyAuthToken}
            bpm={bpm}
            sections={sections}
            setSections={setSections}
            selectedSongs={selectedSongs}
            setInNewSectionState={setInNewSectionState}
            setUserPlaylists={setUserPlaylists}
            userPlaylists={userPlaylists}
            loading={loading}
            setLoading={setLoading}
          />
          {inInitialState && (
            <InitialPopup
              exitNodeHandler={exitNodeHandler}
              enterNodeHandler={enterNodeHandler}
              onNodeClicked={initialSongClicked}
              token={spotifyAuthToken}
            />
          )}
          {inNewSectionState && (
            <NewSectionPopup
              exitNodeHandler={exitNodeHandler}
              enterNodeHandler={enterNodeHandler}
              onNodeClicked={initialSongClicked}
              genreClickedHandler={genreClickedHandler}
              playlistClickedHandler={playlistClickedHandler}
              token={spotifyAuthToken}
              setInNewSectionState={setInNewSectionState}
              sections={sections}
              setSections={setSections}
              selectedGenres={selectedGenres}
              likedGenres={likedGenres}
              userPlaylists={userPlaylists}
              likedArtists={likedArtists}
              onArtistClickedHandler={onArtistClickedHandler}
            />
          )}
        </SpotifyApiContext.Provider>
      ) : (
        <div className="loginDiv">
          SPOTIFY BPM EXPLORER
          <br></br>
          <SpotifyAuth
            className="spotifyButton"
            // redirectUri="https://spotify-bpm-explorer.netlify.app"
            redirectUri="http://localhost:3001/"
            clientID="9889f705281f4cd280769c43129189f7"
            scopes={[
              Scopes.userReadPrivate,
              "user-read-email",
              "user-top-read",
              "playlist-modify-private",
              "playlist-read-collaborative",
              "playlist-read-private",
              "playlist-modify-public",
            ]} // either style will work
          />
          <br></br>
          <br></br>
          by <a href="http://www.trudy.computer/">Trudy Painter</a>
        </div>
      )}
    </div>
  );
};

export default App;
