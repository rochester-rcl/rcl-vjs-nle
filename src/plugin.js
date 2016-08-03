/* @flow */

// Video JS
import videojs from 'video.js';

// Default options for the plugin.
const defaults = {};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 * @param    {Object} options
 */
const onPlayerReady = function(player: Object, options: Object) {
  player.addClass('vjs-nle-controls');
  let framerate: number = options.framerate ? options.framerate : 29.97;
  if(options.frameControls) {
    initControls(player, framerate);
  }
  if(options.smpteTimecode) {
    initSMPTE(player, framerate);
  }
};

/**
 * Function to handle non-linear editor style keyboard events
 *
 *
 *@function initControls
 *@param     {Player} player
 *@param     {number} framerate
 */
const initControls = function(player: Object, framerate: number) {
    let keyDown = function keyDown(event){
      const keyName: string = event.keyCode;
      const frame: number = 1 / framerate;
      switch(keyName){
        case 37:
          frameReverse(player, frame);
          break;
        case 39:
          frameForward(player, frame);
          break;
      }
    }
    player.on('keydown', keyDown);
}

/**
 * Function to scrub frame by frame in reverse
 *
 *@function frameReverse
 *@param {Player} player
 *@param {number} frame
 */
 const frameReverse = function(player: Object, frame: number) {
   let currentTime: number = player.currentTime();
   if(currentTime > 0) {
     let decrement: number = currentTime - frame;
     player.currentTime(decrement);
   }
 }

/**
* Function to scrub frame by frame in reverse
*
*@function frameForward
*@param {Player} player
*@param {number} frame
*/
const frameForward = function(player: Object, frame: number) {
  let currentTime: number = player.currentTime();
  let duration: number = player.duration();
  if(currentTime < duration) {
    let increment: number = Math.min(duration, currentTime + frame);
    player.currentTime(increment);
  }
}

/**
* Function to convert milliseconds to SMPTE (HH:MM:SS:FF) timecode
*
*@function toSMPTE
*@param {number} time
*@param {number} framerate
*/
const toSMPTE = function(currentTime: number, framerate: number) {
  let currentFrame: number = currentTime * framerate;
  let hours: number = Math.floor(currentTime / 3600);
  let minutes: number = Math.floor(currentTime / 60);
  let seconds: number = parseInt(currentTime - (hours * 3600) - (minutes * 60));
  let frames: number = parseInt(currentFrame % framerate);

  let timecodeArray: Array<number> = [hours, minutes, seconds, frames];
  let processedTimecodeArray: Array<string> = [];

  timecodeArray.forEach((time: number) => {
    if(time < 10){
      let timeString: string = "0" + time;
      processedTimecodeArray.push(timeString);
    } else {
      let timeString: string = time.toString();
      processedTimecodeArray.push(timeString);
    }
  });
  return(processedTimecodeArray.join(':'));
}

/**
* Function to display current time as SMPTE (HH:MM:SS:FF) timecode
*
*@function initSMPTE
*@param {Player} player
*/

const initSMPTE = function(player: Object, framerate: number) {
    const setCurrentTimeDisplay = () => {
      let currentTimeDisplay: HTMLCollection<HTMLElement> = player.controlBar.progressControl.seekBar.playProgressBar.el();
      let currentTime: number = player.currentTime();
      currentTimeDisplay.dataset.currentTime = toSMPTE(currentTime, framerate);
    };
    const setRemainingTimeDisplay = () => {
      let currentTime: number = player.currentTime();
      let duration: number = player.duration();
      let remainingTimeDisplay: HTMLCollection<HTMLElement> = player.controlBar.remainingTimeDisplay.el();
      remainingTimeDisplay.innerHTML = '<div class="vjs-remaining-time-display" aria-live="off"><span class="vjs-control-text">Remaining Time</span>'
                                           + toSMPTE(currentTime, framerate) + ' / ' + toSMPTE(duration, framerate) + '</div>'
    }
    player.on('timeupdate', setCurrentTimeDisplay);
    player.on('timeupdate', setRemainingTimeDisplay);
}

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function nleControls
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const nleControls = function(options: Object) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
videojs.plugin('nleControls', nleControls);

// Include the version number.
nleControls.VERSION = '__VERSION__';

export default nleControls;
