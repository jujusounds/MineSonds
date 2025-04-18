// ⚠️ Remplace par TES infos Supabase
const supabaseUrl = 'https://TON_PROJECT_ID.supabase.co';
const supabaseKey = 'TON_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const uploadBtn = document.getElementById('uploadBtn');
const audioPlayback = document.getElementById('audioPlayback');
const clientNameInput = document.getElementById('clientName');

recordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  audioChunks = [];

  mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    audioPlayback.src = audioUrl;
    uploadBtn.disabled = false;

    uploadBtn.onclick = () => uploadAudio(audioBlob);
  };

  mediaRecorder.start();
  recordBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  recordBtn.disabled = false;
  stopBtn.disabled = true;
};

async function uploadAudio(blob) {
  const clientName = clientNameInput.value.trim();
  if (!clientName) {
    alert("❗ Merci de saisir un nom de client.");
    return;
  }

  const fileName = `${clientName}/audio_${Date.now()}.webm`;

  const { data, error } = await supabase.storage
    .from('audios') // ← ton bucket Supabase
    .upload(fileName, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'audio/webm'
    });

  if (error) {
    console.error(error);
    alert("❌ Upload échoué !");
  } else {
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/audios/${fileName}`;
    alert("✅ Fichier envoyé !\n" + publicUrl);
    console.log("URL publique :", publicUrl);
  }
}
