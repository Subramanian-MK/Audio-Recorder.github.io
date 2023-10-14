let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioURL = '';
let stateIndex = 0;

const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioURL = URL.createObjectURL(audioBlob);
                document.getElementById('audio').src = audioURL;
                document.getElementById('uploadButton').style.display = 'block';
            };
            mediaRecorder.start();
            document.getElementById('startRecord').style.display = 'none';
            document.getElementById('stopRecord').style.display = 'block';
        });
};

const stopRecording = () => {
    mediaRecorder.stop();
    document.getElementById('startRecord').style.display = 'block';
    document.getElementById('stopRecord').style.display = 'none';
};

const uploadToGoogleDrive = () => {
    gapi.client.drive.files.create({
        resource: {
            name: 'audio.wav',
            parents: ['YOUR_PARENT_FOLDER_ID']
        },
        media: {
            mimeType: 'audio/wav',
            body: audioBlob
        }
    }).then((response) => {
        console.log('File ID: ' + response.result.id);
    });
};

const display = document.querySelector('.display');
const controllerWrapper = document.querySelector('.controllers');
const State = ['Initial', 'Record', 'Download'];

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (e) => {
                audioChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunks, { 'type': 'audio/ogg; codecs=opus' });
                audioChunks = [];
                audioURL = window.URL.createObjectURL(blob);
                document.querySelector('audio').src = audioURL;
            }
        })
        .catch(error => {
            console.log('Following error has occurred: ', error);
        });
} else {
    stateIndex = '';
    application(stateIndex);
}

const clearDisplay = () => {
    display.textContent = '';
};

const clearControls = () => {
    controllerWrapper.textContent = '';
};

const record = () => {
    stateIndex = 1;
    mediaRecorder.start();
    application(stateIndex);
};

const stopRecording = () => {
    stateIndex = 2;
    mediaRecorder.stop();
    application(stateIndex);
};

const downloadAudio = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = audioURL;
    downloadLink.setAttribute('download', 'audio');
    downloadLink.click();
};

const addButton = (id, funString, text) => {
    const btn = document.createElement('button');
    btn.id = id;
    btn.setAttribute('onclick', funString);
    btn.textContent = text;
    controllerWrapper.append(btn);
};

const addMessage = (text) => {
    const msg = document.createElement('p');
    msg.textContent = text;
    display.append(msg);
};

const addAudio = () => {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = audioURL;
    display.append(audio);
};

const application = (index) => {
    switch (State[index]) {
        case 'Initial':
            clearDisplay();
            clearControls();
            addButton('record', 'record()', 'Start Recording');
            break;

        case 'Record':
            clearDisplay();
            clearControls();
            addMessage('Recording...');
            addButton('stop', 'stopRecording()', 'Stop Recording');
            break;

        case 'Download':
            clearControls();
            clearDisplay();
            addAudio();
            addButton('record', 'record()', 'Record Again');
            addButton('download', 'downloadAudio()', 'Download Audio');
            break;

        default:
            clearControls();
            clearDisplay();
            addMessage('Your browser does not support mediaDevices');
            break;
    }
};

application(stateIndex);
