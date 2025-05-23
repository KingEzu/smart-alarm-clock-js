const hours = document.getElementById('hour');
const minutes = document.getElementById('minutes');
const seconds = document.getElementById('seconds');
const ampm = document.getElementById('ampm');
const alarmStatus = document.getElementById('alarm-status');
const stopBtn = document.getElementById('stop-btn');
const alarmSound = document.getElementById('alarm-sound');
const alarmList = document.getElementById('alarm-list');

let savedAlarms = JSON.parse(localStorage.getItem('alarms')) || [];
let alarmTriggered = false;
let currentRingingAlarm = null;

renderSavedAlarms();

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  let s = now.getSeconds();
  let period = h >= 12 ? 'PM' : 'AM';

  if (h === 0) h = 12;
  else if (h > 12) h -= 12;

  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');

  hours.textContent = hh;
  minutes.textContent = mm;
  seconds.textContent = ss;
  ampm.textContent = period;

  const currentTime = `${hh}:${mm} ${period}`;
  if (savedAlarms.includes(currentTime) && !alarmTriggered) {
    alarmTriggered = true;
    currentRingingAlarm = currentTime;
    alarmSound.loop = true;
    alarmSound.play();
    stopBtn.style.display = 'inline-block';
    alarmStatus.textContent = "🔔 Alarm ringing!";
  }
}

function populateTimeOptions(selectHour = 'alarm-hour', selectMinute = 'alarm-minute') {
  const hourSelect = document.getElementById(selectHour);
  const minuteSelect = document.getElementById(selectMinute);
  hourSelect.innerHTML = '';
  minuteSelect.innerHTML = '';
  for (let i = 1; i <= 12; i++) {
    hourSelect.innerHTML += `<option value="${String(i).padStart(2, '0')}">${String(i).padStart(2, '0')}</option>`;
  }
  for (let i = 0; i < 60; i++) {
    minuteSelect.innerHTML += `<option value="${String(i).padStart(2, '0')}">${String(i).padStart(2, '0')}</option>`;
  }
}

function setAlarm() {
  const h = document.getElementById('alarm-hour').value;
  const m = document.getElementById('alarm-minute').value;
  const period = document.getElementById('alarm-ampm').value;
  const time = `${h}:${m} ${period}`;

  if (h && m && period) {
    if (savedAlarms.length < 5 && !savedAlarms.includes(time)) {
      savedAlarms.push(time);
      localStorage.setItem('alarms', JSON.stringify(savedAlarms));
      alarmStatus.textContent = `✅ Alarm set for ${time}`;
      alarmTriggered = false;
      stopBtn.style.display = 'none';
      renderSavedAlarms();
    } else {
      alarmStatus.textContent = "⚠️ Alarm list full or already exists.";
    }
  } else {
    alarmStatus.textContent = "⚠️ Please select valid time.";
  }
}

function renderSavedAlarms() {
  alarmList.innerHTML = '';
  savedAlarms.forEach((time, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${index + 1}. ${time}
      <span style="float:right;">
        <button onclick="editAlarm(${index})" style="margin-left:5px;">✏️</button>
        <button onclick="deleteAlarm(${index})">🗑️</button>
      </span>
    `;
    alarmList.appendChild(li);
  });
}

function deleteAlarm(index) {
  savedAlarms.splice(index, 1);
  localStorage.setItem('alarms', JSON.stringify(savedAlarms));
  renderSavedAlarms();
  alarmStatus.textContent = "⛔ Alarm deleted.";
}

function editAlarm(index) {
  const current = savedAlarms[index];
  const [timePart, period] = current.split(' ');
  const [h, m] = timePart.split(':');

  const li = document.createElement('li');
  li.innerHTML = `
    ${index + 1}.
    <select id="edit-hour-${index}"></select> :
    <select id="edit-minute-${index}"></select>
    <select id="edit-ampm-${index}">
      <option ${period === 'AM' ? 'selected' : ''}>AM</option>
      <option ${period === 'PM' ? 'selected' : ''}>PM</option>
    </select>
    <button onclick="saveEdit(${index})">💾</button>
    <button onclick="renderSavedAlarms()">❌</button>
  `;

  alarmList.replaceChild(li, alarmList.children[index]);

  populateTimeOptions(`edit-hour-${index}`, `edit-minute-${index}`);
  document.getElementById(`edit-hour-${index}`).value = h;
  document.getElementById(`edit-minute-${index}`).value = m;
}

function saveEdit(index) {
  const h = document.getElementById(`edit-hour-${index}`).value;
  const m = document.getElementById(`edit-minute-${index}`).value;
  const period = document.getElementById(`edit-ampm-${index}`).value;
  const time = `${h}:${m} ${period}`;

  if (!savedAlarms.includes(time)) {
    savedAlarms[index] = time;
    localStorage.setItem('alarms', JSON.stringify(savedAlarms));
    renderSavedAlarms();
    alarmStatus.textContent = `✏️ Alarm updated to ${time}`;
  } else {
    alarmStatus.textContent = "⚠️ This alarm already exists.";
  }
}

function stopAlarm() {
  alarmSound.pause();
  alarmSound.currentTime = 0;
  alarmTriggered = false;
  alarmStatus.textContent = "Alarm stopped.";
  stopBtn.style.display = 'none';

  if (currentRingingAlarm) {
    const index = savedAlarms.indexOf(currentRingingAlarm);
    if (index !== -1) {
      savedAlarms.splice(index, 1);
      localStorage.setItem('alarms', JSON.stringify(savedAlarms));
      renderSavedAlarms();
    }
    currentRingingAlarm = null;
  }
}

populateTimeOptions();
setInterval(updateClock, 1000);