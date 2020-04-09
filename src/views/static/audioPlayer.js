/*
   音频播放控制器
   G711 G726走AudioContext播放
   AAC走audio播放，通过mse控制
   音视频同步通过bufferAudio函数控制，目前还没搞清楚，所以音视频存在几百毫秒的不同步问题
 */

"use strict";
function AudioPlayerAAC() {
    var MAXTIMEGAP_LIMIT = 200;
    var MAX_VOLUME = 1;
    var mimeCodec = null;
    var mediaSource = null;
    var audio = null;
    var sourceBuffer = null;
    var saveVol = 0;
    var segmentBuffer = new Uint8Array;
    var preTimeStamp = 0;
    var initVideoTimeStamp = 0;
    var videoDiffTime = null;
    var bufferingFlag = false;
    var startPosArray = null;
    var startPos = 0;

    function appendBuffer(buffer1, buffer2) {
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
        return tmp
    }

    function createAudio() {
        if (/Apple Computer/.test(navigator.vendor) && /Safari/.test(navigator.userAgent)) {
            mimeCodec = "audio/x-aac"
        } else {
            mimeCodec = "audio/aac"
        }
        audio = document.createElement("audio");
        document.body.appendChild(audio);
        audio.addEventListener("error", audioErrorCallback)
    }

    function createMediaSource() {
        var availablePlay = false;
        if (!window.MediaSource) {
            debug.error("MediaSource API is not supported!")
        } else if (window.MediaSource.isTypeSupported(mimeCodec)) {
            mediaSource = new MediaSource;
            mediaSource.addEventListener("sourceopen", sourceOpenedCallback);
            mediaSource.addEventListener("sourceclose", sourceCloseCallback);
            mediaSource.addEventListener("sourceended", sourceEndedCallback);
            mediaSource.addEventListener("error", sourceErrorCallback);
            mediaSource.addEventListener("abort", sourceAbortCallback);
            availablePlay = true
        } else {
            debug.error("Unsupported MIME type or codec: ", mimeCodec)
        }
        return availablePlay
    }

    function audioErrorCallback(evt) {
        debug.error(evt);
        switch (evt.target.error.code) {
            case evt.target.error.MEDIA_ERR_ABORTED:
                debug.error("audio tag error : You aborted the media playback.");
                break;
            case evt.target.error.MEDIA_ERR_NETWORK:
                debug.error("audio tag error : A network error caused the media download to fail.");
                break;
            case evt.target.error.MEDIA_ERR_DECODE:
                debug.error("audio tag error : The media playback was aborted due to a corruption problem or because the media used features your browser did not support.");
                break;
            case evt.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                debug.error("audio tag error : The media could not be loaded, either because the server or network failed or because the format is not supported.");
                break;
            default:
                debug.error("audio tag error : An unknown media error occurred.");
                break
        }
    }

    function sourceOpenedCallback() {
        debug.info("sourceopened");
        if (sourceBuffer === null) {
            try {
                sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
                sourceBuffer.addEventListener("updateend", sourceUpdatedCallback)
            } catch (exception) {
                debug.error("Exception calling addSourceBuffer : " + exception);
                return
            }
        }
    }

    function sourceUpdatedCallback() {
        if (audio.paused) {
            audio.play()
        }
    }

    function sourceCloseCallback() {
        debug.info("sourceclose")
    }

    function sourceEndedCallback() {
        debug.info("sourceended")
    }

    function sourceErrorCallback() {
        debug.info("error")
    }

    function sourceAbortCallback() {
        debug.info("abort")
    }

    function  removeEventListener() {
        mediaSource.removeEventListener("sourceopen", sourceOpenedCallback);
        mediaSource.removeEventListener("sourceclose", sourceCloseCallback);
        mediaSource.removeEventListener("sourceended", sourceEndedCallback);
        mediaSource.removeEventListener("error", sourceErrorCallback);
        mediaSource.removeEventListener("abort", sourceAbortCallback);

        sourceBuffer.removeEventListener("updateend", sourceUpdatedCallback);

        audio.removeEventListener("error", audioErrorCallback);
    }

    function Constructor() {
    }

    Constructor.prototype = {
        audioInit: function (volume) {
            createAudio();
            var availablePlay = createMediaSource();
            if (availablePlay) {
                if (audio !== null) {
                    audio.src = window.URL.createObjectURL(mediaSource);
                    this.controlVolumn(volume);
                    audio.play()
                }
            }
            return availablePlay
        }, play: function () {
            this.controlVolumn(saveVol)
        }, stop: function () {
            audio.volume = 0;
            saveVol = 0
        }, bufferAudio: function (data, rtpTimestamp) {
            var timegap = rtpTimestamp - preTimeStamp;
            if (timegap > MAXTIMEGAP_LIMIT || timegap < 0) {
                segmentBuffer = new Uint8Array;
                startPosArray = new Array;
                bufferingFlag = true
            }
            if (bufferingFlag) {
                startPosArray.push(startPos);
                startPos += data.length
            }
            preTimeStamp = rtpTimestamp;
            segmentBuffer = appendBuffer(segmentBuffer, data);
            if (sourceBuffer !== null && !bufferingFlag) {
                if (!sourceBuffer.updating) {
                    try {
                        if (startPosArray !== null) {
                            if (videoDiffTime !== null) {
                                if (parseInt(startPosArray.length / 16) - parseInt(videoDiffTime) >= 2) {
                                    videoDiffTime += 1
                                }
                                startPos = parseInt(videoDiffTime * 16, 10); //计算音频数据起始位置，以视频开始时间为基准
                                if (startPos < startPosArray.length) {
                                    sourceBuffer.appendBuffer(segmentBuffer.subarray(startPosArray[startPos], segmentBuffer.length));
                                    if (sourceBuffer.buffered.length > 0) {
                                        audio.currentTime = sourceBuffer.buffered.end(0)
                                    }
                                } else {
                                    if (sourceBuffer.buffered.length > 0) {
                                        audio.currentTime = sourceBuffer.buffered.end(0) - .3
                                    }
                                }
                            }
                        } else {
                            sourceBuffer.appendBuffer(segmentBuffer)
                        }
                        segmentBuffer = new Uint8Array;
                        startPosArray = null;
                        startPos = 0
                    } catch (exception) {
                        //debug.error("Exception while appending : " + exception)
                    }
                }
            }
        }, controlVolumn: function (vol) {
            saveVol = vol;
            //if (audio !== null) {
            //    var tVol = vol / MAX_VOLUME;
            //    if (tVol <= 0) {
            //        audio.volume = 0
            //    } else {
            //        if (tVol >= 1) {
            //            audio.volume = 1
            //        } else {
            //            audio.volume = tVol
            //        }
            //    }
            //}
            if (audio !== null) {
                if (vol <= 0) {
                    audio.volume = 0
                } else {
                    if (vol >= 1) {
                        audio.volume = 1
                    } else {
                        audio.volume = vol
                    }
                }
                saveVol = vol;
            }
			
        }, getVolume: function () {
            return saveVol
        }, terminate: function () {
            removeEventListener();
            if (mediaSource.readyState === "open") {
                mediaSource.removeSourceBuffer(sourceBuffer);

            }
            mediaSource.endOfStream();
            sourceBuffer = null;
            mediaSource = null;
            audio.parentElement.removeChild(audio);
            audio = null;
        }, setBufferingFlag: function (videoTime, videoStatus) {
            if (videoStatus === "init") {
                initVideoTimeStamp = videoTime
            } else {
                if (bufferingFlag) {
                    if (videoTime === 0 || typeof videoTime === "undefined" || videoTime === null) {
                        videoDiffTime = null
                    } else {
                        videoDiffTime = videoTime - initVideoTimeStamp;  //视频播放时间
                        initVideoTimeStamp = 0
                    }
                    bufferingFlag = false
                }
            }
        }, getBufferingFlag: function () {
            return bufferingFlag
        }, setInitVideoTimeStamp: function (time) {
            initVideoTimeStamp = time
        }, getInitVideoTimeStamp: function () {
            return initVideoTimeStamp
        },
        setSamplingRate: function (samplingRate) {
        }
    };
    return new Constructor
}
"use strict";
function AudioPlayerGxx() {
    var MAXBUFFERSIZE = 8e4;
    var MAXTIMEGAP_LIMIT = 200;
    var SAMPLINGRATE = 8000;
    var MAX_VOLUME = 1;
    var audioContext = null;
    var gainInNode = null;
    var biquadFilter = null;
    var saveVol = 0;
    var codecInfo = {type: "G.711", samplingRate: SAMPLINGRATE, bitrate: "8000"};
    var nextStartTime = 0;
    var isRunning = false;
    var preTimeStamp = 0;
    var initVideoTimeStamp = 0;
    var videoDiffTime = null;
    var bufferingFlag = false;
    var playBuffer = new Float32Array(MAXBUFFERSIZE);
    var readLength = 0;
    var sourceNode = null;

    function playAudioIn(data, rtpTimestamp) {
        var timegap = rtpTimestamp - preTimeStamp;
        if (timegap > MAXTIMEGAP_LIMIT || timegap < 0) {
            nextStartTime = 0;
            readLength = 0;
            bufferingFlag = true;
            if (sourceNode !== null) {
                sourceNode.stop()
            }
        }
        if (nextStartTime - audioContext.currentTime < 0) {
            nextStartTime = 0
        }
        //debug.log('data1:   ' + data)
        //data = test(data)
        //debug.log('data2:   ' + data)
        preTimeStamp = rtpTimestamp;
        playBuffer = appendBufferFloat32(playBuffer, data, readLength);
        readLength += data.length;
        if (!bufferingFlag) {
            var startPos = 0;
            if (readLength / data.length > 1) {
                if (videoDiffTime !== null) {
                    startPos = videoDiffTime * SAMPLINGRATE
                }
                if (startPos >= readLength || videoDiffTime === null) {
                    readLength = 0;
                    return
                }
            }
            var audioBuffer = null;
            //if (/Apple Computer/.test(navigator.vendor) && /Safari/.test(navigator.userAgent)) {
            //    playBuffer = Upsampling8Kto32K(playBuffer.subarray(startPos, readLength));
            //    codecInfo.samplingRate = 32e3;
            //    audioBuffer = audioContext.createBuffer(1, playBuffer.length, codecInfo.samplingRate);
            //    audioBuffer.getChannelData(0).set(playBuffer)
            //} else {
                audioBuffer = audioContext.createBuffer(1, readLength - startPos, codecInfo.samplingRate);
                audioBuffer.getChannelData(0).set(playBuffer.subarray(startPos, readLength))
            //}
            readLength = 0;
            sourceNode = audioContext.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(biquadFilter);
            //sourceNode.connect(audioContext.destination);
            if (!nextStartTime) {
                nextStartTime = audioContext.currentTime + .1
            }
            sourceNode.start(nextStartTime);
            nextStartTime += audioBuffer.duration
        }
    }

    function appendBufferFloat32(_currentBuffer, newBuffer, readLength) {
        var BUFFER_SIZE = 8e4;
        var currentBuffer = _currentBuffer;
        if (readLength + newBuffer.length >= currentBuffer.length) {
            currentBuffer = new Float32Array(currentBuffer.length + BUFFER_SIZE);
            currentBuffer.set(currentBuffer, 0)
        }
        currentBuffer.set(newBuffer, readLength);
        return currentBuffer
    }


    function Upsampling8Kto32K(inputBuffer) {
        var point1 = 0, point2 = 0, point3 = 0, point4 = 0, mu = .2, mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
        var buf = new Float32Array(inputBuffer.length * 4);
        for (var i = 0, j = 0; i < inputBuffer.length; i++) {
            j = i * 4;
            point1 = inputBuffer[i];
            point2 = i < inputBuffer.length - 1 ? inputBuffer[i + 1] : point1;
            point3 = i < inputBuffer.length - 2 ? inputBuffer[i + 2] : point1;
            point4 = i < inputBuffer.length - 3 ? inputBuffer[i + 3] : point1;
            point2 = point1 * (1 - mu2) + point2 * mu2;
            point3 = point2 * (1 - mu2) + point3 * mu2;
            point4 = point3 * (1 - mu2) + point4 * mu2;
            buf[j] = point1;
            buf[j + 1] = point2;
            buf[j + 2] = point3;
            buf[j + 3] = point4
        }
        return buf
    }

    function Constructor() {
    }

    Constructor.prototype = {
        audioInit: function (volume) {
            nextStartTime = 0;
            if (audioContext !== null) {
                debug.info("Audio context already defined!")
            } else {
                try {
                    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext;
                    audioContext = new AudioContext;
                    audioContext.onstatechange = function () {
                        debug.info("Audio Context State changed :: " + audioContext.state);
                        if (audioContext.state === "running") {
                            isRunning = true
                        }
                    };
                    gainInNode = audioContext.createGain();
                    biquadFilter = audioContext.createBiquadFilter();
                    biquadFilter.connect(gainInNode);
                    biquadFilter.type = 'lowpass'; //低通滤波
                    biquadFilter.frequency.value = 4e3;
                    biquadFilter.gain.value = 40;
                    gainInNode.connect(audioContext.destination);
                    this.controlVolumn(volume);
                    return true
                } catch (error) {
                    debug.error("Web Audio API is not supported in this web browser! : " + error);
                    return false
                }
            }
        }, play: function () {
            this.controlVolumn(saveVol)
        }, stop: function () {
            saveVol = 0;
            gainInNode.gain.value = 0;
            nextStartTime = 0
        }, bufferAudio: function (data, rtpTimestamp) {
            if (isRunning) {
                playAudioIn(data, rtpTimestamp)
            }
        }, controlVolumn: function (vol) {
            saveVol = vol;
            var tVol = vol / MAX_VOLUME;
            if (tVol <= 0) {
                gainInNode.gain.value = 0;
                nextStartTime = 0
            } else {
                if (tVol >= 1) {
                    gainInNode.gain.value = 1
                } else {
                    gainInNode.gain.value = tVol
                }
            }
			audioContext.resume();
        }, getVolume: function () {
            return saveVol
        }, terminate: function () {
            if (audioContext.state !== "closed") {
                nextStartTime = 0;
                isRunning = false;
                audioContext.close()
            }
        }, setBufferingFlag: function (videoTime, videoStatus) {
            if (videoStatus === "init") {
                initVideoTimeStamp = videoTime
            } else {
                if (bufferingFlag) {
                    if (videoTime === 0 || typeof videoTime === "undefined" || videoTime === null) {
                        videoDiffTime = null
                    } else {
                        videoDiffTime = videoTime - initVideoTimeStamp;
                        initVideoTimeStamp = 0
                    }
                    bufferingFlag = false
                }
            }
        }, getBufferingFlag: function () {
            return bufferingFlag
        }, setInitVideoTimeStamp: function (time) {
            initVideoTimeStamp = time
        }, getInitVideoTimeStamp: function () {
            return initVideoTimeStamp
        },
        setSamplingRate: function (samplingRate) {
            codecInfo.samplingRate = samplingRate;
        }
    };
    return new Constructor
}