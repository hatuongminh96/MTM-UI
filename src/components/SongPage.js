import React from 'react';
import SongInfo from './SongInfo';
import SongRanking from './SongRanking';
import SongMedia from './SongMedia';
import MusicAPI from '../api/mtm.js';
import Song from '../entities/Song.js';
import SongRank from '../entities/SongRank.js';

/**
 * SongPage component shows information (details, chart history, and related media) of a song
 */
export default class SongPage extends React.Component {

  // Initial state
  state = {
    song: {},
    rankings: [],
    media: [],
    isLoadingInfo: false,
    isLoadingRankings: false,
    isLoadingMedia: false,
  };

  /**
   * Load information, rankings, and media about a song when the component mounts
   */
  componentDidMount() {
    // Set loading flags
    this.setState({
      isLoadingInfo: true,
      isLoadingRankings: true,
      isLoadingMedia: true,
    });

    let songId = this.props.match.params.id;

    this.loadSongInfo(songId);
    this.loadSongRankings(songId);
    this.loadSongMedia(songId);
  };

  /**
   * Loads song information
   * @param {string} songId Billboard id of the song
   */
  loadSongInfo(songId) {
    MusicAPI.getSongInfo(songId).then(function (data) {
      this.setState({
        song: data,
        isLoadingInfo: false
      });
    }.bind(this), function (e) {
      this.setState({
        isLoadingInfo: false
      });
      alert(e.message);
    }.bind(this));
  };

  /**
   * Loads song rankings
   * @param {string} songId Billboard id of the song
   */
  loadSongRankings(songId) {
    MusicAPI.getSongRankings(songId).then(function (data) {
      this.setState({
        rankings: data,
        isLoadingRankings: false
      });
    }.bind(this), function (e) {
      this.setState({
        isLoadingRankings: false
      });
      alert(e.message);
    }.bind(this));
  };

  /**
   * Loads related media of a song
   * @param {string} songId Billboard id of the song
   */
  loadSongMedia(songId) {
    MusicAPI.getSongMedia(songId).then(function (data) {
      this.setState({
        media: data,
        isLoadingMedia: false
      });
    }.bind(this), function (e) {
      this.setState({
        isLoadingMedia: false
      });
      alert(e.message);
    }.bind(this));
  };

  render() {
    let songId = this.props.match.params.id;

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-12 text-center">
            <div className="container">
              {
                (this.state.isLoadingInfo &&
                  this.state.isLoadingRankings &&
                  this.state.isLoadingMedia) ?
                  <p>Loading...</p> : <br />
              }
              <SongInfo song={this.state.song} />
              <SongRanking rankings={this.state.rankings} />
              <SongMedia media={this.state.media} />
            </div>
          </div>
        </div>
      </div>
    );
  }
};
