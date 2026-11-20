
(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  const canvas = $("stage");
  const ctx = canvas.getContext("2d");
  const audio = $("songAudio");

  const state = {
    playing: true,
    selected: "kiko",
    scene: "concert",
    analyser: null,
    audioContext: null,
    audioSource: null,
    level: 0,
    characters: {
      kiko: {
        name: "Kiko",
        type: "fox",
        color: "#ff854d",
        x: 0.25
      },
      milo: {
        name: "Milo",
        type: "rabbit",
        color: "#8496c8",
        x: 0.50
      },
      teddy: {
        name: "Teddy",
        type: "bear",
        color: "#9b684b",
        x: 0.75
      }
    }
  };

  let recorder = null;
  let recordedChunks = [];
  let recording = false;
  let recordingTimer = null;

  // CANVAS SIZE

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // BACKGROUND

  function drawBackground(width, height, time) {
    const scenes = {
      concert: ["#21175b", "#673c9f", "#e85c9b"],
      sunset: ["#40245e", "#e47b78", "#f6bd78"],
      mint: ["#143f4a", "#52a99c", "#b3e8c7"],
      space: ["#090d2b", "#34246e", "#a05bd4"]
    };

    const colors = scenes[state.scene] || scenes.concert;

    const gradient = ctx.createLinearGradient(
      0, 0, width, height
    );

    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.6, colors[1]);
    gradient.addColorStop(1, colors[2]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Stage lights

    if (state.scene === "concert") {
      for (let i = 0; i < 7; i++) {
        const x = width * (0.08 + i * 0.14);

        ctx.fillStyle = "rgba(255,255,255,0.07)";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 55, height * 0.75);
        ctx.lineTo(x + 65, height * 0.75);
        ctx.fill();
      }
    }

    // Stars

    for (let i = 0; i < 45; i++) {
      const x = (i * 83 + Math.sin(time / 900 + i) * 15) % width;
      const y = (i * 47) % Math.max(1, height * 0.65);

      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stage floor

    ctx.fillStyle = "rgba(15,8,45,0.28)";
    ctx.fillRect(0, height * 0.79, width, height * 0.21);
  }

  // DRAW CARTOON CHARACTERS

  function drawCharacter(character, time, width, height, index) {
    const scale = Math.min(width / 720, height / 430);

    const bounce = state.playing
      ? Math.abs(Math.sin(time / 220 + index)) * 12
      : 0;

    const x = width * character.x;
    const y = height * 0.59 - bounce;

    const head = 45 * scale;
    const bodyW = 72 * scale;
    const bodyH = 105 * scale;

    ctx.save();
    ctx.translate(x, y);

    // Shadow

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(0, bodyH * 0.75, bodyW * 0.75, 9 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears

    ctx.fillStyle = character.color;

    if (character.type === "rabbit") {
      ctx.beginPath();
      ctx.ellipse(-19 * scale, -head * 1.35, 10 * scale, 29 * scale, -0.1, 0, Math.PI * 2);
      ctx.ellipse(19 * scale, -head * 1.35, 10 * scale, 29 * scale, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    if (character.type === "fox") {
      ctx.beginPath();
      ctx.moveTo(-head * 0.8, -head * 0.3);
      ctx.lineTo(-head * 0.75, -head * 1.5);
      ctx.lineTo(-head * 0.05, -head * 0.8);

      ctx.moveTo(head * 0.8, -head * 0.3);
      ctx.lineTo(head * 0.75, -head * 1.5);
      ctx.lineTo(head * 0.05, -head * 0.8);
      ctx.fill();
    }

    if (character.type === "bear") {
      ctx.beginPath();
      ctx.arc(-head * 0.8, -head * 0.7, head * 0.3, 0, Math.PI * 2);
      ctx.arc(head * 0.8, -head * 0.7, head * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body

    ctx.fillStyle = character.color;
    ctx.beginPath();
    ctx.roundRect(-bodyW / 2, 0, bodyW, bodyH, bodyW * 0.4);
    ctx.fill();

    // Head

    ctx.beginPath();
    ctx.arc(0, -head * 0.55, head, 0, Math.PI * 2);
    ctx.fill();

    // Face

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(0, -head * 0.25, head * 0.58, head * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes

    ctx.fillStyle = "#241b3b";

    ctx.beginPath();
    ctx.arc(-head * 0.34, -head * 0.65, 4 * scale, 0, Math.PI * 2);
    ctx.arc(head * 0.34, -head * 0.65, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Animated mouth

    const mouthHeight = (3 + state.level * 20) * scale;

    ctx.fillStyle = "#51253d";
    ctx.beginPath();
    ctx.ellipse(
      0,
      -head * 0.13,
      7 * scale,
      Math.max(2, mouthHeight),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Arms

    const swing = state.playing
      ? Math.sin(time / 180 + index) * 0.5
      : 0;

    ctx.strokeStyle = character.color;
    ctx.lineWidth = 15 * scale;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.42, bodyH * 0.24);
    ctx.lineTo(-bodyW * 0.9, bodyH * 0.47 + swing * 15 * scale);

    ctx.moveTo(bodyW * 0.42, bodyH * 0.24);
    ctx.lineTo(bodyW * 0.9, bodyH * 0.47 - swing * 15 * scale);
    ctx.stroke();

    // Feet

    ctx.fillStyle = "#33204f";

    ctx.beginPath();
    ctx.ellipse(-bodyW * 0.25, bodyH, 15 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(bodyW * 0.25, bodyH, 15 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Character name

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.max(11, 13 * scale)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(character.name, 0, bodyH + 28 * scale);

    ctx.restore();
  }

  // MAIN ANIMATION LOOP

  function animate(time) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (!width || !height) {
      requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    drawBackground(width, height, time);

    Object.values(state.characters).forEach((character, index) => {
      drawCharacter(character, time, width, height, index);
    });

    if (recording) {
      ctx.fillStyle = "#ff426f";
      ctx.beginPath();
      ctx.arc(width - 25, 25, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "11px Arial";
      ctx.textAlign = "right";
      ctx.fillText("REC", width - 38, 29);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // CHARACTER SELECTION

  function selectCharacter(id) {
    if (!state.characters[id]) return;

    state.selected = id;

    document.querySelectorAll(".character-chip").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.character === id
      );
    });
  }

  document.querySelectorAll(".character-chip").forEach(button => {
    button.addEventListener("click", () => {
      selectCharacter(button.dataset.character);
    });
  });

  // STAGE BACKGROUNDS

  $("sceneSelect").addEventListener("change", event => {
    state.scene = event.target.value;
  });

  // PLAYBACK CONTROLS

  $("playBtn").addEventListener("click", () => {
    state.playing = true;

    if (audio.src) {
      setupAudioAnalyser();
      audio.play().catch(() => {});
    }
  });

  $("pauseBtn").addEventListener("click", () => {
    state.playing = false;
    audio.pause();
  });

  $("resetBtn").addEventListener("click", () => {
    audio.pause();
    audio.currentTime = 0;
    state.playing = false;
    state.level = 0;
  });

  audio.addEventListener("play", () => {
    state.playing = true;
    setupAudioAnalyser();
  });

  audio.addEventListener("pause", () => {
    if (!recording) state.playing = false;
  });

  // AUDIO ANALYSER

  function setupAudioAnalyser() {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!state.audioContext) {
        state.audioContext = new AudioContextClass();

        state.analyser = state.audioContext.createAnalyser();
        state.analyser.fftSize = 256;

        state.audioSource =
          state.audioContext.createMediaElementSource(audio);

        state.audioSource.connect(state.analyser);
        state.analyser.connect(state.audioContext.destination);
      }

      if (state.audioContext.state === "suspended") {
        state.audioContext.resume();
      }
    } catch (error) {
      console.warn("Audio analyser unavailable:", error);
    }
  }

  function updateAudioLevel() {
    if (!state.analyser) {
      state.level = 0;
      requestAnimationFrame(updateAudioLevel);
      return;
    }

    const data = new Uint8Array(
      state.analyser.frequencyBinCount
    );

    state.analyser.getByteFrequencyData(data);

    let total = 0;

    for (const value of data) {
      total += value;
    }

    state.level = Math.min(
      1,
      (total / data.length) / 115
    );

    requestAnimationFrame(updateAudioLevel);
  }

  requestAnimationFrame(updateAudioLevel);

  // UPLOAD MUSIC

  $("audioFile").addEventListener("change", event => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert("Please select a valid audio file.");
      return;
    }

    if (audio.dataset.objectUrl) {
      URL.revokeObjectURL(audio.dataset.objectUrl);
    }

    const objectUrl = URL.createObjectURL(file);

    audio.dataset.objectUrl = objectUrl;
    audio.src = objectUrl;
    audio.load();

    $("audioName").textContent = file.name;

    $("renderStatus").textContent =
      "Music uploaded successfully. Press play to preview.";

    setupAudioAnalyser();
  });

  // INSERT LYRICS TAG

  $("assignBtn").addEventListener("click", () => {
    const singer = $("singerSelect").value.toUpperCase();
    const textarea = $("lyrics");

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const tag = `[${singer}]\n`;

    textarea.value =
      textarea.value.slice(0, start) +
      tag +
      textarea.value.slice(end);

    textarea.focus();

    textarea.selectionStart =
      textarea.selectionEnd = start + tag.length;
  });

  // CUSTOM CHARACTER CREATOR

  $("createCharacterBtn").addEventListener("click", () => {
    const name = $("customName").value.trim();

    if (!name) {
      alert("Please enter a character name.");
      $("customName").focus();
      return;
    }

    const id = "custom_" + Date.now();

    const character = {
      name,
      type: $("customType").value,
      color: $("customColor").value,
      x: 0.5
    };

    state.characters[id] = character;

    const button = document.createElement("button");
    button.className = "character-chip";
    button.dataset.character = id;

    const avatar = document.createElement("span");
    avatar.className = "avatar " + character.type;
    avatar.textContent = name.charAt(0).toUpperCase();
    avatar.style.background = character.color;

    const details = document.createElement("span");

    const title = document.createElement("b");
    title.textContent = name;

    const description = document.createElement("small");
    description.textContent = "Custom character";

    details.append(title, description);
    button.append(avatar, details);

    button.addEventListener("click", () => {
      selectCustomCharacter(id, button);
    });

    document.querySelector(".character-strip").append(button);

    const item = document.createElement("div");
    item.className = "custom-item";
    item.textContent = name + " · " + character.type;

    if ($("customCharacterList").querySelector(".microcopy")) {
      $("customCharacterList").replaceChildren();
    }

    $("customCharacterList").append(item);

    $("customName").value = "";
  });

  function selectCustomCharacter(id, button) {
    state.selected = id;

    document.querySelectorAll(".character-chip").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
  }

  // BACKEND SETTINGS

  function getBackendUrl() {
    return localStorage.getItem("aidelBackend") || "";
  }

  $("backendUrl").value = getBackendUrl();

  $("saveBackendBtn").addEventListener("click", () => {
    const url = $("backendUrl").value.trim().replace(/\/+$/, "");

    if (url && !/^https?:\/\//i.test(url)) {
      alert("Enter a complete URL beginning with https://");
      return;
    }

    localStorage.setItem("aidelBackend", url);

    $("renderStatus").textContent = url
      ? "Backend address saved."
      : "Backend address cleared.";
  });

  // AI BACKEND REQUESTS

  async function requestBackend(path, payload) {
    const backend = getBackendUrl();

    if (!backend) {
      alert(
        "AI generation is not connected yet. " +
        "A secure backend must be deployed first."
      );
      return;
    }

    const button = path.includes("music")
      ? $("generateMusicBtn")
      : $("generateVideoBtn");

    button.disabled = true;
    button.textContent = "Sending request...";

    try {
      const response = await fetch(backend + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "The server rejected the request."
        );
      }

      $("renderStatus").textContent =
        result.message || "Your request was accepted.";

      if (result.audioUrl) {
        audio.src = result.audioUrl;
        audio.load();
        $("audioName").textContent = "AI-generated audio";
        setupAudioAnalyser();
      }

      if (result.videoUrl) {
        const link = document.createElement("a");

        link.href = result.videoUrl;
        link.download = "aidel-toons-video";
        link.textContent = " Download your video";

        $("renderStatus").append(link);
      }

    } catch (error) {
      alert("AI request failed: " + error.message);
    } finally {
      button.disabled = false;

      button.textContent = path.includes("music")
        ? "✦ Generate AI Singing Vocals"
        : "✦ Generate AI Video Scenes";
    }
  }

  $("generateMusicBtn").addEventListener("click", () => {
    requestBackend("/api/generate-music", {
      title: $("songTitle").value,
      lyrics: $("lyrics").value
    });
  });

  $("generateVideoBtn").addEventListener("click", () => {
    requestBackend("/api/generate-video", {
      title: $("songTitle").value,
      lyrics: $("lyrics").value,
      aspectRatio: $("aspectSelect").value
    });
  });

  // VIDEO RECORDING

  $("renderBtn").addEventListener("click", async () => {
    if (recording) {
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      return;
    }

    if (!window.MediaRecorder || !canvas.captureStream) {
      alert("Your browser does not support video recording.");
      return;
    }

    const canvasStream = canvas.captureStream(30);

    if (audio.src && audio.captureStream) {
      try {
        setupAudioAnalyser();

        const audioStream = audio.captureStream();

        audioStream.getAudioTracks().forEach(track => {
          canvasStream.addTrack(track);
        });
      } catch (error) {
        console.warn("Audio recording unavailable:", error);
      }
    }

    const formats = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];

    const mimeType = formats.find(type =>
      MediaRecorder.isTypeSupported(type)
    );

    if (!mimeType) {
      alert("No supported WebM recording format was found.");
      return;
    }

    recordedChunks = [];

    try {
      recorder = new MediaRecorder(canvasStream, {
        mimeType
      });
    } catch (error) {
      alert("Could not start recording: " + error.message);
      return;
    }

    recorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    recorder.onerror = event => {
      $("renderStatus").textContent =
        "Recording error: " +
        (event.error?.message || "Unknown error");
    };

    recorder.onstop = () => {
      recording = false;
      state.playing = false;
      audio.pause();

      clearTimeout(recordingTimer);

      const blob = new Blob(recordedChunks, {
        type: mimeType
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      const filename = (
        $("songTitle").value || "aidel-toons"
      ).trim().replace(/[^\w-]+/g, "-");

      link.href = url;
      link.download = filename + ".webm";

      document.body.appendChild(link);
      link.click();
      link.remove();

      $("renderStatus").textContent =
        "Your video has been downloaded in WebM format.";

      $("renderBtn").textContent =
        "● Record & Download Cartoon";

      canvasStream.getTracks().forEach(track => track.stop());

      setTimeout(() => URL.revokeObjectURL(url), 60000);
    };

    recorder.start(250);

    recording = true;
    state.playing = true;

    if (audio.src) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    $("renderBtn").textContent = "■ Stop Recording";

    $("renderStatus").textContent =
      "Recording in progress. Keep this page open.";

    const duration = $("durationSelect").value;

    const seconds = duration === "audio"
      ? (Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : 60)
      : Number(duration);

    recordingTimer = setTimeout(() => {
      if (recording && recorder.state !== "inactive") {
        recorder.stop();
      }
    }, Math.min(seconds, 600) * 1000);
  });

  // PROJECT GALLERY

  function getProjects() {
    try {
      return JSON.parse(
        localStorage.getItem("aidelProjects") || "[]"
      );
    } catch {
      return [];
    }
  }

  function saveProjects(projects) {
    localStorage.setItem(
      "aidelProjects",
      JSON.stringify(projects.slice(-30))
    );
  }

  function renderGallery() {
    const gallery = $("gallery");
    const projects = getProjects();

    gallery.replaceChildren();

    if (!projects.length) {
      gallery.textContent = "No saved projects yet.";
      return;
    }

    projects.slice().reverse().forEach(project => {
      const item = document.createElement("div");
      item.className = "gallery-item";

      const title = document.createElement("strong");
      title.textContent = project.title || "Untitled project";

      const date = document.createElement("div");
      date.className = "microcopy";
      date.textContent = new Date(project.savedAt).toLocaleString();

      const load = document.createElement("button");
      load.className = "quiet";
      load.textContent = "Load project";

      load.addEventListener("click", () => {
        $("songTitle").value = project.title || "";
        $("lyrics").value = project.lyrics || "";
        $("aspectSelect").value = project.aspect || "16:9";

        state.scene = project.scene || "concert";
        $("sceneSelect").value = state.scene;

        selectCharacter(project.selected || "kiko");

        $("renderStatus").textContent =
          "Project loaded successfully.";
      });

      item.append(title, date, load);
      gallery.append(item);
    });
  }

  $("saveProjectBtn").addEventListener("click", () => {
    const projects = getProjects();

    projects.push({
      title: $("songTitle").value,
      lyrics: $("lyrics").value,
      scene: state.scene,
      selected: state.selected,
      aspect: $("aspectSelect").value,
      savedAt: new Date().toISOString()
    });

    try {
      saveProjects(projects);
      renderGallery();

      $("renderStatus").textContent =
        "Your project details have been saved in this browser.";
    } catch (error) {
      alert("Could not save your project. Browser storage may be full.");
    }
  });

  renderGallery();

  // HELP DIALOG

  $("helpBtn").addEventListener("click", () => {
    $("helpDialog").showModal();
  });

  $("closeHelp").addEventListener("click", () => {
    $("helpDialog").close();
  });

  $("helpDialog").addEventListener("click", event => {
    if (event.target === $("helpDialog")) {
      $("helpDialog").close();
    }
  });

})();
