// Data
let prayerData = {
  subuh: false,
  dzuhur: false,
  ashar: false,
  maghrib: false,
  isya: false,
};
let quranData = { target: 20, read: 0, completed: false };
let puasaData = { days: Array(30).fill(false), today: false };
let dzikirData = {
  subhanallah: false,
  alhamdulillah: false,
  allahuakbar: false,
  astaghfirullah: false,
  sholawat: false,
};
let streakData = { count: 0, lastDate: null };
let prayerTimes = {
  Subuh: "04:40",
  Dzuhur: "12:04",
  Ashar: "15:07",
  Maghrib: "18:09",
  Isya: "19:19",
};
let nextPrayer = "Ashar";
let nextPrayerTime = "15:07";
let notificationsEnabled = true;
let quranReminderSent = false;
let lastNotificationMinute = -1;

// Calculate Ramadhan Day
function calculateRamadhanDay() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ramadhanStart = new Date(2025, 2, 1);
  ramadhanStart.setHours(0, 0, 0, 0);
  const diffTime = today - ramadhanStart;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  let day = diffDays + 1;
  if (day < 1) day = 1;
  if (day > 30) day = 30;
  return day;
}

let ramadhanDay = calculateRamadhanDay();

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  updateClock();
  updateGreetingIcon();
  setInterval(updateClock, 1000);
  generateRamadhanCalendar();
  loadPrayerTimes();
  loadFromStorage();
  updateShalatProgress();
  updateQuranProgress();
  updatePuasaProgress();
  updateDzikirProgress();
  updateOverallProgress();
  updateStreakDisplay();
  updateNextPrayer();
  updateNextPrayerInfo();
  setInterval(updateNextPrayer, 1000);
  setInterval(updateNextPrayerInfo, 60000);
  setInterval(checkPrayerNotifications, 60000);
  setInterval(checkQuranReminder, 60000);
  setInterval(updatePrayerChecklistAvailability, 60000);
  updatePrayerChecklistAvailability();
});

// Update Greeting Icon based on time
function updateGreetingIcon() {
  const hour = new Date().getHours();
  const iconEl = document.getElementById("greetingIcon");
  if (hour >= 4 && hour < 11) {
    iconEl.innerHTML = '<i class="bi bi-sunrise-fill icon-gold"></i>';
  } else if (hour >= 11 && hour < 15) {
    iconEl.innerHTML = '<i class="bi bi-sun-fill icon-gold"></i>';
  } else if (hour >= 15 && hour < 18) {
    iconEl.innerHTML = '<i class="bi bi-cloud-sun-fill icon-blue"></i>';
  } else {
    iconEl.innerHTML = '<i class="bi bi-moon-stars-fill icon-primary"></i>';
  }
}

// Clock
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  document.getElementById(
    "clockTime"
  ).textContent = `${hours}:${minutes}:${seconds}`;

  const hour = now.getHours();
  let greeting = "Selamat Malam";
  if (hour >= 4 && hour < 11) greeting = "Selamat Pagi";
  else if (hour >= 11 && hour < 15) greeting = "Selamat Siang";
  else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";

  document.getElementById("sidebarGreeting").textContent = `${greeting}!`;
}

// Theme Toggle
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  document.getElementById("themeIcon").className =
    next === "dark"
      ? "bi bi-sun-fill icon-white"
      : "bi bi-moon-fill icon-primary";
}

// Toggle Notifications
function toggleNotifications() {
  notificationsEnabled = !notificationsEnabled;
  document.getElementById("notifIcon").className = notificationsEnabled
    ? "bi bi-bell-fill icon-primary"
    : "bi bi-bell-slash-fill icon-primary";
  showNotification(
    notificationsEnabled ? "Notifikasi diaktifkan" : "Notifikasi dinonaktifkan",
    "bi-bell"
  );
}

// Page Switching
function switchPage(pageName, event) {
  if (event) event.preventDefault();
  document
    .querySelectorAll(".page-section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".header-nav-link")
    .forEach((l) => l.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  document.getElementById(pageName + "-page").classList.add("active");

  const headerLinks = document.querySelectorAll(".header-nav-link");
  headerLinks.forEach((link) => {
    if (link.getAttribute("onclick").includes(pageName)) {
      link.classList.add("active");
    }
  });

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    if (link.getAttribute("onclick").includes(pageName)) {
      link.classList.add("active");
    }
  });

  if (window.innerWidth <= 1024) {
    toggleSidebar();
  }
  updateOverallProgress();
}

// Toggle Sidebar with overlay
function toggleSidebar() {
  const sidebar = document.getElementById("leftSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

// Check if prayer time has passed
function canCheckPrayer(prayerName) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [h, m] = prayerTimes[
    prayerName.charAt(0).toUpperCase() + prayerName.slice(1)
  ]
    .split(":")
    .map(Number);
  const prayerTime = h * 60 + m;
  return current >= prayerTime;
}

// Prayer Toggle with Warning
function togglePrayer(name, el) {
  if (el.classList.contains("completed")) {
    if (confirm("Apakah Anda yakin ingin membatalkan checklist shalat ini?")) {
      el.classList.remove("completed");
      el.classList.remove("early-warning");
      prayerData[name] = false;
      updateShalatProgress();
      updateOverallProgress();
      updatePrayerRow(name, false);
      updateTimeBadge(name, false);
    }
    return;
  }

  if (!canCheckPrayer(name)) {
    const prayerNameDisplay = name.charAt(0).toUpperCase() + name.slice(1);
    const confirmed = confirm(
      `PERINGATAN:\nBelum masuk waktu shalat ${prayerNameDisplay}.\n\nApakah Anda yakin ingin tetap menceklis?\n\nYa - Tetap ceklis\nTidak - Batal`
    );
    if (!confirmed) {
      showNotification("Checklist dibatalkan", "bi-x-circle");
      return;
    }
    showNotification(
      "Shalat diceklis sebelum waktunya",
      "bi-exclamation-triangle"
    );
  }

  el.classList.add("completed");
  prayerData[name] = true;
  updateShalatProgress();
  updateOverallProgress();
  updatePrayerRow(name, true);
  updateTimeBadge(name, true);
  checkStreakUpdate();
}

// Update Prayer Row
function updatePrayerRow(name, completed) {
  const row = document.getElementById(
    `prayerRow${name.charAt(0).toUpperCase() + name.slice(1)}`
  );
  if (row) {
    if (completed) row.classList.add("completed");
    else row.classList.remove("completed");
  }
}

// Update Time Badge
function updateTimeBadge(name, completed) {
  const timeBadge = document.getElementById(`time-${name}`);
  if (timeBadge) {
    if (completed) {
      timeBadge.classList.add("early");
    }
  }
}

// Update Prayer Checklist Availability
function updatePrayerChecklistAvailability() {
  const prayers = ["subuh", "dzuhur", "ashar", "maghrib", "isya"];
  prayers.forEach((prayer) => {
    const el = document.getElementById(`checklist-${prayer}`);
    const timeEl = document.getElementById(`time-${prayer}`);
    if (el && timeEl) {
      timeEl.textContent =
        prayerTimes[prayer.charAt(0).toUpperCase() + prayer.slice(1)];
      if (!canCheckPrayer(prayer) && !el.classList.contains("completed")) {
        el.classList.add("early-warning");
        timeEl.classList.add("early");
      } else {
        el.classList.remove("early-warning");
        timeEl.classList.remove("early");
      }
    }
  });
}

// Quran Increment/Decrement Functions
function incrementTarget() {
  const input = document.getElementById("quranTarget");
  input.value = parseInt(input.value) + 1;
  updateQuranProgress();
}

function decrementTarget() {
  const input = document.getElementById("quranTarget");
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
    updateQuranProgress();
  }
}

function incrementRead() {
  const input = document.getElementById("quranRead");
  const target = parseInt(document.getElementById("quranTarget").value);
  if (parseInt(input.value) < target) {
    input.value = parseInt(input.value) + 1;
    updateQuranProgress();
  }
}

function decrementRead() {
  const input = document.getElementById("quranRead");
  if (parseInt(input.value) > 0) {
    input.value = parseInt(input.value) - 1;
    updateQuranProgress();
  }
}

// Mark Quran Complete
function markQuranComplete() {
  const target = parseInt(document.getElementById("quranTarget").value);
  document.getElementById("quranRead").value = target;
  quranData.completed = true;
  updateQuranProgress();
  showNotification(
    "Target Qur'an selesai! MasyaAllah!",
    "bi-check-circle-fill"
  );
  checkStreakUpdate();
}

// Dzikir Toggle
function toggleDzikir(name, el) {
  if (el.classList.contains("completed")) {
    if (confirm("Apakah Anda yakin ingin membatalkan checklist dzikir ini?")) {
      el.classList.remove("completed");
      dzikirData[name] = false;
      updateDzikirProgress();
      updateOverallProgress();
    }
    return;
  }
  if (!confirm("Apakah Anda yakin sudah melaksanakan dzikir ini?")) {
    return;
  }
  el.classList.add("completed");
  dzikirData[name] = true;
  updateDzikirProgress();
  updateOverallProgress();
  checkStreakUpdate();
}

// Today Fast Toggle
function toggleTodayFast(el) {
  if (el.classList.contains("completed")) {
    if (
      confirm("Apakah Anda yakin ingin membatalkan checklist puasa hari ini?")
    ) {
      el.classList.remove("completed");
      puasaData.today = false;
      const today = ramadhanDay - 1;
      if (today >= 0 && today < 30) {
        puasaData.days[today] = false;
      }
      updatePuasaProgress();
      updateOverallProgress();
      generateRamadhanCalendar();
    }
    return;
  }
  if (!confirm("Apakah Anda yakin sudah puasa hari ini?")) {
    return;
  }
  el.classList.add("completed");
  puasaData.today = true;
  const today = ramadhanDay - 1;
  if (today >= 0 && today < 30) {
    puasaData.days[today] = true;
  }
  updatePuasaProgress();
  updateOverallProgress();
  generateRamadhanCalendar();
  checkStreakUpdate();
}

// Ramadhan Calendar
function toggleRamadhanDay(dayIndex, el) {
  if (dayIndex >= ramadhanDay) {
    showNotification("Hari ini baru hari ke-" + ramadhanDay, "bi-clock");
    return;
  }
  puasaData.days[dayIndex] = !puasaData.days[dayIndex];
  if (dayIndex === ramadhanDay - 1) {
    puasaData.today = puasaData.days[dayIndex];
  }
  updatePuasaProgress();
  updateOverallProgress();
  generateRamadhanCalendar();
}

function generateRamadhanCalendar() {
  const container = document.getElementById("ramadhanCalendar");
  container.innerHTML = "";
  for (let i = 0; i < 30; i++) {
    const day = document.createElement("div");
    day.className = "calendar-day";
    if (puasaData.days[i]) day.classList.add("fasted");
    if (i === ramadhanDay - 1) day.classList.add("today");
    if (i >= ramadhanDay) day.style.opacity = "0.5";
    day.innerHTML = `<span class="calendar-day-number">${
      i + 1
    }</span><span class="calendar-day-icon"><i class="bi bi-check-lg icon-green"></i></span>`;
    day.onclick = () => toggleRamadhanDay(i, day);
    container.appendChild(day);
  }
}

// Status Functions
function getStatusClass(percent, type) {
  if (type === "shalat" || type === "dzikir") {
    if (percent < 40) return "low";
    else if (percent < 80) return "medium";
    else return "high";
  } else if (type === "quran") {
    if (percent < 50) return "low";
    else if (percent < 100) return "medium";
    else return "high";
  } else {
    if (percent < 40) return "low";
    else if (percent < 80) return "medium";
    else return "high";
  }
}

function getStatusText(percent, type) {
  if (type === "shalat" || type === "dzikir") {
    if (percent < 40)
      return '<i class="bi bi-exclamation-circle-fill icon-gold"></i> Belum optimal';
    else if (percent < 80)
      return '<i class="bi bi-check-circle-fill icon-blue"></i> Cukup baik';
    else return '<i class="bi bi-award-fill icon-green"></i> MasyaAllah!';
  } else if (type === "quran") {
    if (percent < 50)
      return '<i class="bi bi-arrow-up-circle-fill icon-blue"></i> Masih bisa ditambah';
    else if (percent < 100)
      return '<i class="bi bi-hourglass-split icon-gold"></i> Hampir selesai';
    else return '<i class="bi bi-trophy-fill icon-gold"></i> Target tercapai';
  } else {
    if (percent < 40)
      return '<i class="bi bi-lightning-fill icon-gold"></i> Semangat!';
    else if (percent < 80)
      return '<i class="bi bi-fire icon-gold"></i> Luar biasa!';
    else return '<i class="bi bi-award-fill icon-green"></i> Alhamdulillah!';
  }
}

function getMotivationText(percent) {
  if (percent >= 80) return "Ibadah Anda luar biasa!";
  else if (percent >= 40) return "Progress yang baik!";
  else return "Ayo lengkapi ibadah!";
}

// Progress Updates
function updateShalatProgress() {
  const completed = Object.values(prayerData).filter((v) => v).length;
  const percent = (completed / 5) * 100;
  const statusClass = getStatusClass(percent, "shalat");
  const statusText = getStatusText(percent, "shalat");

  document.getElementById("dashStatShalat").textContent = `${completed}/5`;
  document.getElementById("dashStatShalatBar").style.width = percent + "%";
  document.getElementById("shalatProgressPercent").textContent = `${Math.round(
    percent
  )}%`;
  document.getElementById("shalatProgressBar").style.width = percent + "%";
  document.getElementById(
    "shalatStatus"
  ).className = `status-badge ${statusClass}`;
  document.getElementById("shalatStatus").innerHTML = statusText;
  document.getElementById(
    "shalatPageProgressPercent"
  ).textContent = `${Math.round(percent)}%`;
}

function updateQuranProgress() {
  const target = parseInt(document.getElementById("quranTarget").value) || 20;
  const read = parseInt(document.getElementById("quranRead").value) || 0;
  const percent = target > 0 ? (read / target) * 100 : 0;
  const clampedPercent = Math.min(percent, 100);
  const statusClass = getStatusClass(clampedPercent, "quran");
  const statusText = getStatusText(clampedPercent, "quran");

  document.getElementById("dashStatQuran").textContent = `${Math.round(
    clampedPercent
  )}%`;
  document.getElementById("dashStatQuranBar").style.width =
    clampedPercent + "%";
  document.getElementById(
    "planningQuranTarget"
  ).textContent = `Target: ${target}`;
  document.getElementById("quranProgressPercent").textContent = `${Math.round(
    clampedPercent
  )}%`;
  document.getElementById("quranProgressBar").style.width =
    clampedPercent + "%";
  document.getElementById(
    "quranStatus"
  ).className = `status-badge ${statusClass}`;
  document.getElementById("quranStatus").innerHTML = statusText;
  document.getElementById(
    "quranPageProgressPercent"
  ).textContent = `${Math.round(clampedPercent)}%`;

  // Update Mark Complete button
  const btnComplete = document.getElementById("btnMarkComplete");
  if (clampedPercent >= 100) {
    btnComplete.classList.add("completed");
    btnComplete.innerHTML =
      '<i class="bi bi-check-circle-fill"></i><span>Target Selesai!</span>';
  } else {
    btnComplete.classList.remove("completed");
    btnComplete.innerHTML =
      '<i class="bi bi-check-circle-fill"></i><span>Tandai Target Selesai</span>';
  }
}

function updatePuasaProgress() {
  const completed = puasaData.days.filter((v) => v).length;
  const percent = (completed / 30) * 100;
  const statusClass = getStatusClass(percent, "puasa");
  const statusText = getStatusText(percent, "puasa");

  // Dashboard shows 30-day count
  document.getElementById("dashStatPuasa").textContent = `${completed}/30`;
  document.getElementById("dashStatPuasaBar").style.width = percent + "%";

  // Daily progress shows 100% if today is completed
  const dailyPercent = puasaData.today ? 100 : 0;
  document.getElementById("puasaPageProgressPercent").textContent =
    puasaData.today ? "100%" : "0%";

  // 30-day progress bar shows actual count
  document.getElementById(
    "puasaProgressPercent"
  ).textContent = `${completed}/30`;
  document.getElementById("puasaProgressBar").style.width = percent + "%";
  document.getElementById(
    "puasaStatus"
  ).className = `status-badge ${statusClass}`;
  document.getElementById("puasaStatus").innerHTML = statusText;

  document.getElementById("ramadhanDayDisplay").textContent = ramadhanDay;
  document.getElementById("ramadhanProgressBar").style.width = `${
    (ramadhanDay / 30) * 100
  }%`;
  document.getElementById(
    "ramadhanProgressText"
  ).textContent = `Hari ke-${ramadhanDay}`;
  document.getElementById("ramadhanDay").textContent = ramadhanDay;
}

function updateDzikirProgress() {
  const completed = Object.values(dzikirData).filter((v) => v).length;
  const percent = (completed / 5) * 100;
  const statusClass = getStatusClass(percent, "dzikir");
  const statusText = getStatusText(percent, "dzikir");

  document.getElementById("dashStatDzikir").textContent = `${completed}/5`;
  document.getElementById("dashStatDzikirBar").style.width = percent + "%";
  document.getElementById("dzikirProgressPercent").textContent = `${Math.round(
    percent
  )}%`;
  document.getElementById("dzikirProgressBar").style.width = percent + "%";
  document.getElementById(
    "dzikirStatus"
  ).className = `status-badge ${statusClass}`;
  document.getElementById("dzikirStatus").innerHTML = statusText;
  document.getElementById(
    "dzikirPageProgressPercent"
  ).textContent = `${Math.round(percent)}%`;
}

function updateOverallProgress() {
  const shalatPercent =
    (Object.values(prayerData).filter((v) => v).length / 5) * 100;
  const quranTarget =
    parseInt(document.getElementById("quranTarget").value) || 20;
  const quranRead = parseInt(document.getElementById("quranRead").value) || 0;
  const quranPercent = quranTarget > 0 ? (quranRead / quranTarget) * 100 : 0;
  const puasaToday = puasaData.today ? 100 : 0;
  const dzikirPercent =
    (Object.values(dzikirData).filter((v) => v).length / 5) * 100;

  const overallPercent =
    (shalatPercent + quranPercent + puasaToday + dzikirPercent) / 4;
  const roundedOverall = Math.round(overallPercent);
  const statusClass = getStatusClass(roundedOverall, "shalat");
  const statusText = getStatusText(roundedOverall, "shalat");
  const motivationText = getMotivationText(roundedOverall);

  document.getElementById("sidebarProgress").textContent = `${roundedOverall}%`;
  document.getElementById(
    "dashboardProgressPercent"
  ).textContent = `${roundedOverall}%`;
  document.getElementById("sidebarMotivationStatus").innerHTML = statusText;
  document.getElementById("motivationText").textContent = motivationText;
  document.getElementById(
    "dashboardMotivationBadge"
  ).className = `motivation-badge ${statusClass}`;
  document.getElementById("dashboardMotivationBadge").innerHTML = statusText;
}

// Streak
function checkStreakUpdate() {
  const shalatPercent =
    (Object.values(prayerData).filter((v) => v).length / 5) * 100;
  const quranTarget =
    parseInt(document.getElementById("quranTarget").value) || 20;
  const quranRead = parseInt(document.getElementById("quranRead").value) || 0;
  const quranPercent = quranTarget > 0 ? (quranRead / quranTarget) * 100 : 0;
  const puasaToday = puasaData.today ? 100 : 0;
  const dzikirPercent =
    (Object.values(dzikirData).filter((v) => v).length / 5) * 100;

  const overallPercent =
    (shalatPercent + quranPercent + puasaToday + dzikirPercent) / 4;
  const today = new Date().toDateString();

  if (overallPercent >= 80) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (streakData.lastDate === yesterday.toDateString()) {
      streakData.count++;
      streakData.lastDate = today;
      updateStreakDisplay();
      saveToStorage();
      showNotification(
        "Streak bertambah! " + streakData.count + " hari",
        "bi-fire"
      );
    } else if (streakData.lastDate !== today) {
      streakData.lastDate = today;
      saveToStorage();
    }
  }
}

function updateStreakDisplay() {
  document.getElementById("streakValue").textContent = streakData.count;
}

// Prayer Countdown
function updateNextPrayer() {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();
  let targetPrayer = nextPrayer;
  let targetPrayerTime = null;

  if (targetPrayer && prayerTimes[targetPrayer]) {
    const [hours, minutes] = prayerTimes[targetPrayer].split(":").map(Number);
    targetPrayerTime = hours * 60 + minutes;
  }

  if (!targetPrayerTime) {
    targetPrayer = "Subuh";
    targetPrayerTime = 4 * 60 + 40;
  }

  const totalSeconds = (targetPrayerTime - currentTime) * 60 - currentSeconds;
  let adjustedSeconds = totalSeconds;
  if (adjustedSeconds < 0) adjustedSeconds += 24 * 60 * 60;

  const hoursLeft = Math.floor(adjustedSeconds / 3600);
  const minutesLeft = Math.floor((adjustedSeconds % 3600) / 60);
  const secondsLeft = adjustedSeconds % 60;

  document.getElementById("nextPrayerCountdown").textContent = `${String(
    hoursLeft
  ).padStart(2, "0")}:${String(minutesLeft).padStart(2, "0")}:${String(
    secondsLeft
  ).padStart(2, "0")}`;
}

function updateNextPrayerInfo() {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const prayerOrder = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];
  let nextP = null;

  prayerOrder.forEach((prayer) => {
    if (!prayerTimes[prayer]) return;
    const [hours, minutes] = prayerTimes[prayer].split(":").map(Number);
    const prayerTime = hours * 60 + minutes;
    if (prayerTime > currentTime && !nextP) {
      nextP = prayer;
    }
  });

  if (!nextP) nextP = "Subuh";
  nextPrayer = nextP;
  nextPrayerTime = prayerTimes[nextP];

  document.getElementById("nextPrayerName").textContent = nextP;
  document.getElementById("nextPrayerTime").textContent = nextPrayerTime;

  prayerOrder.forEach((prayer) => {
    const row = document.getElementById(`prayerRow${prayer}`);
    if (row) row.classList.remove("next");
  });

  const nextRow = document.getElementById(`prayerRow${nextP}`);
  if (nextRow) nextRow.classList.add("next");
}

// Notifications
function checkPrayerNotifications() {
  if (!notificationsEnabled) return;
  const now = new Date();
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  if (currentMinute === lastNotificationMinute) return;

  Object.keys(prayerTimes).forEach((prayer) => {
    const [h, m] = prayerTimes[prayer].split(":").map(Number);
    const prayerMinute = h * 60 + m;
    if (currentMinute === prayerMinute) {
      lastNotificationMinute = currentMinute;
      if (prayer === "Maghrib") {
        showNotification(
          "Selamat berbuka! Waktu Maghrib tiba.",
          "bi-moon-stars"
        );
      } else {
        showNotification(`Waktu shalat ${prayer} telah tiba.`, "bi-bell");
      }
    }
  });
}

function checkQuranReminder() {
  if (!notificationsEnabled) return;
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  if (hour === 20 && minute === 0 && !quranReminderSent) {
    const target = parseInt(document.getElementById("quranTarget").value) || 20;
    const read = parseInt(document.getElementById("quranRead").value) || 0;
    if (read < target) {
      showNotification(
        `Target Qur'an belum tercapai (${read}/${target})`,
        "bi-book"
      );
      quranReminderSent = true;
    }
  }
  if (hour === 0 && minute === 0) quranReminderSent = false;
}

// Save Functions
function saveShalat() {
  saveToStorage();
  showNotification("Progress disimpan!", "bi-check-circle-fill");
}

function saveQuran() {
  quranData.target =
    parseInt(document.getElementById("quranTarget").value) || 20;
  quranData.read = parseInt(document.getElementById("quranRead").value) || 0;
  saveToStorage();
  updateQuranProgress();
  updateOverallProgress();
  showNotification("Progress disimpan!", "bi-book-fill");
}

function savePuasa() {
  saveToStorage();
  showNotification("Progress disimpan!", "bi-moon-fill");
}

function saveDzikir() {
  saveToStorage();
  showNotification("Progress disimpan!", "bi-hand-thumbs-up-fill");
}

// Prayer Times
function loadPrayerTimes() {
  document.getElementById("timeSubuhSide").textContent = prayerTimes.Subuh;
  document.getElementById("timeDzuhurSide").textContent = prayerTimes.Dzuhur;
  document.getElementById("timeAsharSide").textContent = prayerTimes.Ashar;
  document.getElementById("timeMaghribSide").textContent = prayerTimes.Maghrib;
  document.getElementById("timeIsyaSide").textContent = prayerTimes.Isya;
  updateNextPrayerInfo();
}

// Storage
function saveToStorage() {
  localStorage.setItem("ramadhanPrayer", JSON.stringify(prayerData));
  localStorage.setItem("ramadhanQuran", JSON.stringify(quranData));
  localStorage.setItem("ramadhanPuasa", JSON.stringify(puasaData));
  localStorage.setItem("ramadhanDzikir", JSON.stringify(dzikirData));
  localStorage.setItem("ramadhanStreak", JSON.stringify(streakData));
  localStorage.setItem("ramadhanDay", ramadhanDay.toString());
}

function loadFromStorage() {
  const savedPrayer = localStorage.getItem("ramadhanPrayer");
  const savedQuran = localStorage.getItem("ramadhanQuran");
  const savedPuasa = localStorage.getItem("ramadhanPuasa");
  const savedDzikir = localStorage.getItem("ramadhanDzikir");
  const savedStreak = localStorage.getItem("ramadhanStreak");
  const savedDay = localStorage.getItem("ramadhanDay");

  if (savedPrayer) prayerData = JSON.parse(savedPrayer);
  if (savedQuran) {
    quranData = JSON.parse(savedQuran);
    document.getElementById("quranTarget").value = quranData.target;
    document.getElementById("quranRead").value = quranData.read;
  }
  if (savedPuasa) puasaData = JSON.parse(savedPuasa);
  if (savedDzikir) dzikirData = JSON.parse(savedDzikir);
  if (savedStreak) streakData = JSON.parse(savedStreak);
  if (savedDay) ramadhanDay = parseInt(savedDay);
  else ramadhanDay = calculateRamadhanDay();
}

// Notification
function showNotification(message, icon) {
  const notif = document.createElement("div");
  notif.className = "notification";
  notif.innerHTML = `<i class="bi ${icon} icon-white"></i><span>${message}</span>`;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}
