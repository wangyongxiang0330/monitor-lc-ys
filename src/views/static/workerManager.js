var WorkerManager = function () {
    function a() {
        O = !0, o = this
    }

    function b() {
        return X
    }

    function c() {
        null !== z && z(!1)
    }

    function d(b) {
        var c = b.data;
        switch (c.type) {
            case"WorkerReady":
                yb && yb();
                break;
            case"canvasRender":
                k(0, "currentTime"), i(c.data), ub++, 0 === tb && (tb = performance.now());
                break;
            case"initSegment":
                X = c.data, j();
                break;
            case"mediaSample":
                null === Z.samples && (Z.samples = new Array(jb)), null === c.data.frame_time_stamp && (c.data.frameDuration = Math.round(pb / L)), 1 !== ib && (c.data.frameDuration = pb / Math.abs(ib)), Z.samples[$++] = c.data, nb += c.data.frameDuration, ob += c.data.frameDuration, kb = jb;
                break;
            case"videoRender":
                var d = new Uint8Array(c.data.length + _);
                if (0 !== _ && d.set(ab), d.set(c.data, _), ab = d, _ = ab.length, $ % jb === 0 && 0 !== $) {
                    if (null !== Z.samples[0].frameDuration ? (Z.baseMediaDecodeTime = 1 === bb ? 0 : mb, mb = nb) : Z.baseMediaDecodeTime = Math.round(pb / L) * jb * (bb - 1), "chrome" == I && 1 === ib) for (var e = Z.samples.length, f = ob / jb, g = 0; e > g; g++) Z.samples[g].frameDuration = f;
                    ob = 0, Y = mp4Remux.mediaSegment(bb, Z, ab, Z.baseMediaDecodeTime), bb++, $ = 0, ab = null, _ = 0, null !== W ? W.setMediaSegment(Y) : lb === !1 && (debug.log("workerManager::videoMS error!! recreate videoMS"), j()), null !== p && p.stopRendering()
                }
                break;
            case"mediasegmentData":
                W.setMediaSegment(c.data), lb === !1 && (debug.log("videoMS error!! recreate videoMS"), j());
                break;
            case"videoInfo":
                J = c.data;
                break;
            case"time":
                break;
            case"videoTimeStamp":
                if (eb = c.data, null !== W && null !== eb && (W.setvideoTimeStamp(eb), W.getNoWaitFlag() && (W.getDuration() || 0 === W.getDuration()))) {
                    var h = eb.timestamp - parseInt(W.getDuration());
                    C({timestamp: h})
                }
                break;
            case"firstFrame":
                p.startRendering(), "undefined" != typeof p.setFPS && p.setFPS(L);
                break;
            case"drop":
                break;
            case"codecInfo":
                cb = c.data, null !== W && W.setCodecInfo(cb);
                break;
            case"stepPlay":
                switch (c.data) {
                    case"needBuffering":
                        R = !0, w("request", T);
                        break;
                    case"BufferFull":
                        if (R = !1, w("complete"), Bb) {
                            var m = {type: "stepPlay", data: "findIFrame"};
                            l.postMessage(m), p.startRendering(), Bb = !1
                        }
                }
                break;
            case"setVideoTagMode":
                a.prototype.setLiveMode(c.data);
                break;
            case"playbackFlag":
                Ab.type = c.data === !0 ? "playback" : "live", null !== W && W.setPlaybackFlag(c.data);
                break;
            case"error":
                null !== A && A(c.data);
                break;
            case"MSEResolutionChanged":
                E(c.data);
                break;
            case"DecodeStart":
                var n = c.data.width - 0, o = c.data.height - 0;
                S.setAttribute("width", n), S.setAttribute("height", o), a.prototype.setLiveMode(c.data.decodeMode), B(c.data);
                break;
            case"ivsDraw":
                var q = c.data.ivsDraw, r = "canvas" === P ? J.timeStamp : eb;
                r = 1e3 * r.timestamp + r.timestamp_usec;
                var s = "canvas" === P ? r : r - parseInt(1e3 * W.getDuration());
                null !== G && (H.setCallback(G), H.draw(q, s, r));
                break;
            default:
                debug.log("workerManager::videoWorker unknown data = " + c.data)
        }
    }

    function e(a) {
        var b = a.data;
        switch (b.type) {
            case"render":
                if (V === !0) break;
                qb !== b.codec && (null !== q && (rb = q.getVolume(), sb = q.getInitVideoTimeStamp(), q.terminate()), "AAC" === b.codec ? "edge" === I || "firefox" === I ? (q = null, null !== A && A({errorCode: 201})) : q = new AudioPlayerAAC : (q = new AudioPlayerGxx, q.setSamplingRate(b.samplingRate)), null !== q && (q.setInitVideoTimeStamp(sb), q.audioInit(rb) || (q = null)), qb = b.codec), null !== q && (null === J || "undefined" == typeof J ? q.bufferAudio(b.data, b.rtpTimeStamp, null) : q.bufferAudio(b.data, b.rtpTimeStamp, J.codecType))
        }
    }

    function f(a) {
        var b = a.data;
        switch (b.type) {
            case"rtpData":
                v(b.data)
        }
    }

    function g(a) {
        var b = {type: "getRtpData", data: a};
        n.postMessage(b)
    }

    function h(a) {
        null !== W && (W.close(), W = null), jb = a === !1 ? hb : Math.abs(ib), Z.samples = new Array(jb), lb = !1, bb = 1, Y = null, $ = 0, ab = null, _ = 0
    }

    function i(a) {
        null !== a && null !== p && ("mjpeg" === J.codecType ? p.drawMJPEG(a, J.width, J.height, J.codecType, J.frameType, J.timeStamp) : p.draw(a, J.width, J.height, J.codecType, J.frameType, J.timeStamp))
    }

    function j() {
        lb = !0, null === W ? (W = VideoMediaSource(o), W.setCodecInfo(cb), W.setInitSegmentFunc(b), W.setVideoSizeCallback(c), W.setBeginDrawCallback(t), W.init(db), W.setSpeedPlay(ib)) : (W.getVideoElement(), W.setInitSegment()), W.setAudioStartCallback(k)
    }

    function k(a, b) {
        null !== q && q.setBufferingFlag(a, b)
    }

    var l = null, m = null, n = null, o = null, p = null, q = null, r = null, s = null, t = null, u = null, v = null,
        w = null, x = null, y = null, z = null, A = null, B = null, C = null, D = null, E = null, F = null, G = null,
        H = null, I = BrowserDetect(), J = null, K = null, L = 0, M = null, N = !1, O = !0, P = "", Q = !0, R = !1,
        S = null, T = null, U = null, V = !1, W = null, X = null, Y = null,
        Z = {id: 1, samples: null, baseMediaDecodeTime: 0}, $ = 0, _ = 0, ab = null, bb = 1, cb = "", db = null,
        eb = null, fb = 2, gb = 4, hb = "chrome" !== I ? gb : fb, ib = 1, jb = hb, kb = jb, lb = !1, mb = 0, nb = 0,
        ob = 0, pb = 1e3, qb = null, rb = 0, sb = 0, tb = 0, ub = 0, vb = 1e3, wb = null, xb = null, yb = null, zb = 0,
        Ab = {type: "live", codec: "", width: 0, height: 0, isLimitSpeed: null}, Bb = !1, Cb = null, Db = null,
        Eb = null, Fb = {5: "MJPEG", 8: "H264", 12: "H265"}, Gb = {
            1: 4e3,
            2: 8e3,
            3: 11025,
            4: 16e3,
            5: 2e4,
            6: 22050,
            7: 32e3,
            8: 44100,
            9: 48e3,
            10: 96e3,
            11: 128e3,
            12: 192e3,
            13: 64e3
        };
    a.prototype = {
        init: function (a, b) {
            zb = 0, S = a, db = b;
            window.navigator.userAgent;
            l = new Worker("./static/videoWorker.js"), m = new Worker("./static/audioWorker.js"), l.onmessage = d, m.onmessage = e, p = new StreamDrawer(zb, this, S), H = IvsDraw(), p.setResizeCallback(s), xb = document.getElementById("count-fps"), wb = document.getElementById("span-fps")
        }, sendSdpInfo: function (a, b, c) {
            var d = {type: "sdpInfo", data: {sdpInfo: a, aacCodecInfo: b, decodeMode: P, govLength: M, checkDelay: Q}};
            if (N = c, l.postMessage(d), m.postMessage(d), N) try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext, n = new Worker("./media/ump/Workers/audioTalkWorker.js"), n.onmessage = f, null === r && (r = new Talk, r.init(), r.setSendAudioTalkBufferCallback(g));
                var e = r.initAudioOut();
                n.postMessage(d), d = {type: "sampleRate", data: e}, n.postMessage(d)
            } catch (h) {
                return N = !1, void debug.error("Web Audio API is not supported in this web browser! : " + h)
            }
            qb = null, lb = !1, K = a
        }, parseRTPData: function (a, b) {
            function c() {
                for (var a = b[22] + 24, c = 24; a > c;) if (g == b[c]) {
                    if (c + 4 > a) return debug.log("i: " + c), -1;
                    M.width = b[c + 2] << 3, M.height = b[c + 3] << 3, c += 4
                } else if (h == b[c]) {
                    if (c + 4 > b.length) return debug.log("i: " + c), -1;
                    M.I_frame_interval = b[c + 1], M.encode_type = b[c + 2], M.frame_rate = b[c + 3], c += 4
                } else if (i == b[c]) M.width = (b[c + 5] << 8) + b[c + 4], M.height = (b[c + 7] << 8) + b[c + 6], c += 8; else if (j == b[c]) c += 4; else if (o == b[c]) c += 8; else if (k == b[c]) {
                    if (c + 4 > a) return debug.log("i: " + c), -1;
                    var d = (b[c + 2] << 8) + b[c + 3];
                    c += d
                } else if (x == b[c]) M.h264_svc_flag = !0, M.svc = b[c + 2], c += 4; else if (q == b[c]) c += 8; else if (u == b[c]) c += 8; else if (C == b[c]) {
                    var e = b[c + 1], f = b[c + 2];
                    c += 8, c += e * f * 16
                } else if (E == b[c]) c += 8; else if (G == b[c]) c += 8; else if (v == b[c]) c += 8; else if (w == b[c]) c += 8; else if (y == b[c]) c += 8; else if (I <= b[c] && b[c] < J) M.timeStampmsw = (b[c + 3] << 8) + b[c + 2], c += 4; else if (J <= b[c] && b[c] < K) c += b[c + 1]; else if (n == b[c]) c += 4; else if (p == b[c]) c += 4; else if (r == b[c]) c += 4; else if (t == b[c]) c += 8; else if (A == b[c]) {
                    var e = b[c + 1];
                    c += 8, c += 16 * e
                } else if (B == b[c]) c += 4; else {
                    if (H != b[c]) return debug.log("parseVideoInfo error ext_type:0x" + b[c]), debug.log("i: " + c), -1;
                    var a = (b[c + 5] << 8) + b[c + 4];
                    c += 8, c += a
                }
            }

            function d() {
                M.ChannelCount = 0;
                for (var a = b[22] + 24, c = 24; a > c;) if (g == b[c]) c += 4; else if (h == b[c]) c += 4; else if (i == b[c]) c += 8; else if (j == b[c]) c += 4; else if (s == b[c]) c += b[c + 1]; else if (o == b[c]) c += 8; else if (k == b[c]) {
                    var d = b[c + 2] << 8 + b[c + 3];
                    c += d
                } else if (z == b[c]) M.ChannelCount = b[c + 1], M.channel = b[c + 2], c += 4; else if (y == b[c]) c += 8; else {
                    if (I != b[c]) return debug.log("parseAudioInfo error ext_type:0x" + b[c]), debug.log("i: " + c), -1;
                    M.timeStampmsw = (b[c + 3] << 8) + b[c + 2], c += 4
                }
                0 == M.ChannelCount && (M.ChannelCount = 1, M.channel = 0);
                for (var a = b[22] + 24, c = 24; a > c;) if (b[c] == g) c += 4; else if (b[c] == h) c += 4; else if (b[c] == i) c += 8; else if (b[c] == j) M.audio_type = b[c + 2], M.samplingRate = Gb[b[c + 3]], c += 4; else if (b[c] == s) c += b[c + 1]; else if (b[c] == o) c += 8; else if (b[c] == k) {
                    var d = b[c + 2] << 8 + b[c + 3];
                    c += d
                } else if (b[c] == z) c += 4; else if (b[c] == y) c += 8; else {
                    if (I != b[c]) return debug.log("parseAudioInfo error ext_type:0x" + b[c]), debug.log("i: " + c), -1;
                    c += 4
                }
            }

            function e() {
                for (var a = b[22] + 24, c = 24; a > c;) if (I <= b[c] && b[c] < J) M.timeStampmsw = (b[c + 3] << 8) + b[c + 2], c += 4; else if (k == b[c]) {
                    if (c + 4 > a) return debug.log("i: " + c), -1;
                    debug.log("智能扩展");
                    var d = (b[c + 2] << 8) + b[c + 3];
                    c += d
                } else c++
            }

            var f = b[4], g = 128, h = 129, i = 130, j = 131, k = 132, n = 133, o = 136, p = 137, q = 138, r = 139,
                s = 140, t = 144, u = 145, v = 146, w = 147, x = 148, y = 149, z = 150, A = 151, B = 152, C = 153,
                E = 154, G = 155, H = 156, I = 160, J = 176, K = 255,
                L = {type: "MediaData", data: {rtspInterleave: a, payload: b}, info: null}, M = {};
            if (253 == f || 254 == f || 252 == f || 251 == f) {
                if (c(), null != Cb) {
                    if (Cb != M.encode_type) return Cb = M.encode_type, void D(Fb[M.encode_type])
                } else Cb = M.encode_type;
                switch (M.encode_type + "") {
                    case"5":
                    case"8":
                    case"12":
                        l && (L.info = M, l.postMessage(L));
                        break;
                    default:
                        debug.log("encode_type: " + encode_type)
                }
            } else if (240 == f) {
                if (d(), null != Eb) {
                    if (Eb != M.audio_type) return Eb = M.audio_type, void F("audioType")
                } else Eb = M.audio_type;
                if (null != Db) {
                    if (Db != M.samplingRate) return Db = M.samplingRate, void F("samplingRate")
                } else Db = M.samplingRate;
                switch (M.audio_type + "") {
                    case"10":
                    case"14":
                    case"26":
                    case"27":
                    case"28":
                    case"29":
                    case"30":
                        m && (L.info = M, m.postMessage(L))
                }
            } else 241 == f ? (e(), l && (L.info = M, l.postMessage(L))) : debug.log("mediaType:   " + f)
        }, setCallback: function (a, b) {
            switch (a) {
                case"timeStamp":
                    u = b;
                    break;
                case"ResolutionChanged":
                    s = b, null !== p && p.setResizeCallback(s);
                    break;
                case"audioTalk":
                    v = b;
                    break;
                case"stepRequest":
                    w = b;
                    break;
                case"metaEvent":
                    x = b;
                    break;
                case"videoMode":
                    y = b;
                    break;
                case"loadingBar":
                    z = b;
                    break;
                case"Error":
                    A = b;
                    break;
                case"PlayStart":
                    t = b, null !== p && p.setBeginDrawCallback(t);
                    break;
                case"DecodeStart":
                    B = b;
                    break;
                case"UpdateCanvas":
                    C = b, null !== p && p.setupdateCanvasCallback(C);
                    break;
                case"FrameTypeChange":
                    D = b;
                    break;
                case"MSEResolutionChanged":
                    E = b;
                    break;
                case"audioChange":
                    F = b;
                    break;
                case"WorkerReady":
                    yb = b;
                    break;
                case"IvsDraw":
                    G = b;
                    break;
                default:
                    debug.log(a), debug.log("workerManager::setCallback() : type is unknown")
            }
        }, capture: function (a) {
            "canvas" === P ? p.capture(a) : W.capture(a)
        }, setDeviceInfo: function (a) {
            U = a.mode
        }, setFPS: function (a) {
            var b = 30;
            L = 0 === a ? b : a, h(1 !== ib)
        }, setGovLength: function (a) {
            M = a
        }, setLiveMode: function (a) {
            if (a === 'canvas') S.style.display = 'block';
            else if (a === 'video') db.style.display = 'block';
            null !== y && y(a), P = null === a ? "canvas" : a, "video" === P ? null !== p && p.renewCanvas() : "canvas" === P && h(!1);

        }, controlAudio: function (a, b) {
            switch (debug.log(a + " " + b), a) {
                case"audioPlay":
                    "start" === b ? null !== q && q.play() : (rb = 0, null !== q && q.stop());
                    break;
                case"volumn":
                    rb = b, null !== q && q.controlVolumn(b);
                    break;
                case"audioSamplingRate":
                    null !== q && q.setSamplingRate(b)
            }
        }, controlAudioTalk: function (a, b) {
            if (null !== r) switch (a) {
                case"onOff":
                    "on" === b || r.stopAudioOut();
                    break;
                case"volumn":
                    r.controlVolumnOut(b)
            }
        }, reassignCanvas: function () {
            null !== p && p.reassignCanvas()
        }, digitalZoom: function (a) {
            null !== p && p.digitalZoom(a)
        }, playbackSpeed: function (a) {
            ib = a, p.setFrameInterval(ib)
        }, timeStamp: function () {
        }, initVideo: function (a) {
            h(a)
        }, setFpsFrame: function (a) {
            vb = a, ub = 0, tb = 0
        }, setCheckDelay: function (a) {
            Q = a
        }, initStartTime: function () {
            var a = {type: "initStartTime"};
            l.postMessage(a), p.stopRendering(), p.startRendering()
        }, terminate: function () {
            "backup" !== U && (l && (l.terminate(), l = null), m && (m.terminate(), m = null)), n && n.terminate(), r && (r.terminate(), r = null), p && p.terminate(), q && q.terminate(), W && W.terminate(), yb && (yb = null), p = null, O = !0
        }
    };
    return new a
};