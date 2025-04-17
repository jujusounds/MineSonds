# MineSonds
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Enregistre ton son</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 2rem; }
    button { margin: 0.5rem; padding: 0.5rem 1rem; }
    audio { margin-top: 1rem; }
  </style>
</head>
<body>

  <h1>🎤 Enregistre ton son Minecraft</h1>
  <input type="text" id="soundLabel" placeholder="Nom du son (ex: creeper_hurt)" />
  <br>
  <button id="startBtn">Démarrer</button>
  <button id="stopBtn" disabled>Stop</button>
  <br>
  <audio id="audioPlayback" controls></audio>
  <br>
  <button id="uploadBtn" disabled>Envoyer vers UploadThing</button>
  <p id="status"></p>

  <script>
    let mediaRecorder;
    let audioChunks = [];

    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const audioPlayback = document.getElementById('audioPlayback');
    const status = document.getElementById('status');

    startBtn.onclick = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        audioPlayback.src = URL.createObjectURL(blob);
        uploadBtn.disabled = false;

        uploadBtn.onclick = () => uploadToUploadThing(blob);
      };

      mediaRecorder.start();
      startBtn.disabled = true;
      stopBtn.disabled = false;
      status.textContent = "🎙️ Enregistrement...";
    };

    stopBtn.onclick = () => {
      mediaRecorder.stop();
      startBtn.disabled = false;
      stopBtn.disabled = true;
      status.textContent = "✅ Enregistrement terminé.";
    };

    async function uploadToUploadThing(blob) {
      const fileName = document.getElementById('soundLabel').value || "sound";
      const file = new File([blob], `${fileName}.webm`, { type: 'audio/webm' });

      status.textContent = "📤 Envoi en cours...";

      const formData = new FormData();
      formData.append("files", file);

      try {
        const res = await fetch("https://uploadthing.com/api/uploadFiles", {
          method: "POST",
          headers: {
            "x-uploadthing-api-key": "TA_CLE_API_ICI",  // UPLOADTHING_TOKEN='eyJhcGlLZXkiOiJza19saXZlXzhjOTQ0MWQ1ZTYwOWIwM2VlZWI0NmQ4OGZmOTMzNmYxOGU3ZDE5YTMxNTI2MTc3YTk3NGMyZTc3ZTBhYjViOWEiLCJhcHBJZCI6ImEwcWYyNXhmZzAiLCJyZWdpb25zIjpbInNlYTEiXX0='
            "x-uploadthing-upload-type": "upload-son"   // MineSounds
          },
          body: formData
        });

        const data = await res.json();
        if (data[0]?.url) {
          status.textContent = "✅ Fichier envoyé ! 🔗 " + data[0].url;
          console.log("Téléchargeable ici :", data[0].url);
        } else {
          throw new Error("Erreur UploadThing");
        }
      } catch (err) {
        console.error(err);
        status.textContent = "❌ Erreur lors de l’envoi.";
      }
    }
  </script>
</body>
</html>
