const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const state = {
  recipients: [],
  templates: [],
  schedules: [],
  logs: []
};

function token() {
  return localStorage.getItem('lineBotAdminToken') || '';
}

function setToast(message, isError = false) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.style.background = isError ? '#ef4444' : '#111827';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error(data?.error || text || res.statusText);
  return data;
}

function typeLabel(type) {
  return { group: '群組', user: '個人', room: '多人聊天室' }[type] || type;
}

function escapeHtml(input = '') {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadHealth() {
  try {
    const h = await api('/api/health');
    $('#statusCard').innerHTML = `
      <strong>系統狀態</strong><br />
      Web App：正常<br />
      LINE Token：${h.lineTokenReady ? '已設定' : '未設定'}<br />
      後台保護：${h.adminProtected ? '已開啟' : '未設定 ADMIN_TOKEN'}<br />
      時區：${h.timezone}
    `;
  } catch (err) {
    $('#statusCard').textContent = `讀取失敗：${err.message}`;
  }
}

async function loadAll() {
  const db = await api('/api/db');
  state.recipients = db.recipients || [];
  state.templates = db.templates || [];
  state.schedules = db.schedules || [];
  state.logs = db.logs || [];
  renderAll();
}

function renderAll() {
  renderTemplateSelects();
  renderRecipientCheckboxes();
  renderRecipientTable();
  renderTemplateList();
  renderScheduleList();
  renderLogs();
}

function renderTemplateSelects() {
  const options = ['<option value="">不使用罐頭訊息 / 自行輸入</option>']
    .concat(state.templates.map(t => `<option value="${t.id}">${escapeHtml(t.title)}</option>`))
    .join('');
  $('#sendTemplate').innerHTML = options;
  $('#scheduleTemplate').innerHTML = options;
}

function recipientCheckboxHtml(name, recipient) {
  return `
    <label title="${escapeHtml(recipient.lineId)}">
      <input type="checkbox" name="${name}" value="${recipient.id}" />
      <span>${escapeHtml(recipient.name)} <span class="meta">${typeLabel(recipient.type)}</span></span>
    </label>
  `;
}

function renderRecipientCheckboxes() {
  const html = state.recipients.length
    ? state.recipients.map(r => recipientCheckboxHtml('sendRecipient', r)).join('')
    : '<p class="meta">尚無收件對象。請先把 Bot 加入群組，或手動新增 groupId/userId。</p>';
  $('#sendRecipients').innerHTML = html;
  $('#scheduleRecipients').innerHTML = state.recipients.length
    ? state.recipients.map(r => recipientCheckboxHtml('scheduleRecipient', r)).join('')
    : '<p class="meta">尚無收件對象。</p>';
}

function renderRecipientTable() {
  $('#recipientTable').innerHTML = state.recipients.map(r => `
    <tr>
      <td><strong>${escapeHtml(r.name)}</strong><br><span class="meta">${escapeHtml(r.source || '')}</span></td>
      <td>${typeLabel(r.type)}</td>
      <td class="mono">${escapeHtml(r.lineId)}</td>
      <td>${escapeHtml(r.notes || '')}</td>
      <td>
        <div class="actions">
          <button class="small ghost" data-edit-recipient="${r.id}">編輯</button>
          <button class="small danger" data-delete-recipient="${r.id}">刪除</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="meta">尚無收件對象</td></tr>';
}

function renderTemplateList() {
  $('#templateList').innerHTML = state.templates.map(t => `
    <article class="item">
      <div class="item-header">
        <div>
          <p class="item-title">${escapeHtml(t.title)}</p>
          <p class="meta">${escapeHtml(t.id)}</p>
        </div>
        <div class="actions">
          <button class="small ghost" data-edit-template="${t.id}">編輯</button>
          <button class="small danger" data-delete-template="${t.id}">刪除</button>
        </div>
      </div>
      <p class="item-text">${escapeHtml(t.text)}</p>
    </article>
  `).join('') || '<p class="meta">尚無罐頭訊息</p>';
}

function renderScheduleList() {
  $('#scheduleList').innerHTML = state.schedules.map(s => {
    const template = state.templates.find(t => t.id === s.templateId);
    const names = (s.recipientIds || []).map(id => state.recipients.find(r => r.id === id)?.name || id).join('、');
    return `
      <article class="item">
        <div class="item-header">
          <div>
            <p class="item-title">${escapeHtml(s.name)} ${s.enabled ? '' : '<span class="meta">（停用）</span>'}</p>
            <p class="meta">cron：${escapeHtml(s.cron)}｜罐頭：${escapeHtml(template?.title || '自訂內容')}｜收件：${escapeHtml(names)}</p>
          </div>
          <div class="actions">
            <button class="small ghost" data-toggle-schedule="${s.id}">${s.enabled ? '停用' : '啟用'}</button>
            <button class="small danger" data-delete-schedule="${s.id}">刪除</button>
          </div>
        </div>
        ${s.text ? `<p class="item-text">${escapeHtml(s.text)}</p>` : ''}
      </article>
    `;
  }).join('') || '<p class="meta">尚無排程</p>';
}

function renderLogs() {
  $('#logList').innerHTML = state.logs.slice(0, 80).map(l => {
    const sourceLabel = l.sourceType ? `${typeLabel(l.sourceType)} / ${escapeHtml(l.sourceId || '')}` : '';
    return `
    <article class="item">
      <div class="item-header">
        <div>
          <p class="item-title">${escapeHtml(l.type)} / ${escapeHtml(l.status)}</p>
          <p class="meta">${escapeHtml(new Date(l.createdAt).toLocaleString())}</p>
          ${sourceLabel ? `<p class="meta">來源：${sourceLabel}</p>` : ''}
        </div>
      </div>
      <p class="item-text">${escapeHtml(l.messagePreview || l.reason || '')}</p>
    </article>
  `;
  }).join('') || '<p class="meta">尚無紀錄</p>';
}

function selectedValues(name) {
  return $$(`input[name="${name}"]:checked`).map(el => el.value);
}

function buildCronFromForm() {
  const time = $('#scheduleTime').value || '13:00';
  const [hour, minute] = time.split(':').map(Number);
  const days = $$('#scheduleDays input:checked').map(el => el.value);
  if (days.length === 0) throw new Error('請至少選擇一個星期');
  return `${minute} ${hour} * * ${days.join(',')}`;
}

function syncSendTextFromTemplate() {
  const id = $('#sendTemplate').value;
  const t = state.templates.find(t => t.id === id);
  $('#sendText').value = t?.text || '';
}

async function addRecipient() {
  await api('/api/recipients', {
    method: 'POST',
    body: JSON.stringify({
      type: $('#recipientType').value,
      name: $('#recipientName').value.trim(),
      lineId: $('#recipientLineId').value.trim(),
      notes: $('#recipientNotes').value.trim()
    })
  });
  $('#recipientName').value = '';
  $('#recipientLineId').value = '';
  $('#recipientNotes').value = '';
  setToast('收件對象已新增/更新');
  await loadAll();
}

async function addTemplate() {
  await api('/api/templates', {
    method: 'POST',
    body: JSON.stringify({
      title: $('#templateTitle').value.trim(),
      text: $('#templateText').value.trim()
    })
  });
  $('#templateTitle').value = '';
  $('#templateText').value = '';
  setToast('罐頭訊息已新增');
  await loadAll();
}

async function sendNow() {
  const recipientIds = selectedValues('sendRecipient');
  await api('/api/send-now', {
    method: 'POST',
    body: JSON.stringify({
      recipientIds,
      templateId: $('#sendTemplate').value || null,
      text: $('#sendText').value.trim(),
      notificationDisabled: $('#sendSilent').value === 'true'
    })
  });
  setToast('已送出 LINE 訊息');
  await loadAll();
}

async function addSchedule() {
  const cron = $('#scheduleCron').value.trim() || buildCronFromForm();
  await api('/api/schedules', {
    method: 'POST',
    body: JSON.stringify({
      name: $('#scheduleName').value.trim(),
      cron,
      recipientIds: selectedValues('scheduleRecipient'),
      templateId: $('#scheduleTemplate').value || null,
      text: $('#scheduleText').value.trim(),
      enabled: $('#scheduleEnabled').checked,
      notificationDisabled: $('#scheduleSilent').checked
    })
  });
  $('#scheduleName').value = '';
  $('#scheduleText').value = '';
  $('#scheduleCron').value = '';
  setToast('排程已新增');
  await loadAll();
}

async function editRecipient(id) {
  const r = state.recipients.find(x => x.id === id);
  if (!r) return;
  const name = prompt('名稱', r.name);
  if (name === null) return;
  const notes = prompt('備註', r.notes || '');
  if (notes === null) return;
  await api(`/api/recipients/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, notes })
  });
  setToast('收件對象已更新');
  await loadAll();
}

async function editTemplate(id) {
  const t = state.templates.find(x => x.id === id);
  if (!t) return;
  const title = prompt('標題', t.title);
  if (title === null) return;
  const text = prompt('內容', t.text);
  if (text === null) return;
  await api(`/api/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, text })
  });
  setToast('罐頭訊息已更新');
  await loadAll();
}

async function toggleSchedule(id) {
  const s = state.schedules.find(x => x.id === id);
  if (!s) return;
  await api(`/api/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled: !s.enabled })
  });
  setToast(s.enabled ? '排程已停用' : '排程已啟用');
  await loadAll();
}

async function deleteItem(kind, id) {
  if (!confirm('確定要刪除嗎？')) return;
  await api(`/api/${kind}/${id}`, { method: 'DELETE' });
  setToast('已刪除');
  await loadAll();
}

function bindEvents() {
  $('#adminToken').value = token();
  $('#saveTokenBtn').addEventListener('click', async () => {
    localStorage.setItem('lineBotAdminToken', $('#adminToken').value.trim());
    setToast('登入資訊已儲存');
    await safeLoadAll();
  });
  $('#clearTokenBtn').addEventListener('click', () => {
    localStorage.removeItem('lineBotAdminToken');
    $('#adminToken').value = '';
    setToast('已清除登入資訊');
  });
  $('#sendTemplate').addEventListener('change', syncSendTextFromTemplate);
  $('#addRecipientBtn').addEventListener('click', () => wrap(addRecipient));
  $('#addTemplateBtn').addEventListener('click', () => wrap(addTemplate));
  $('#sendNowBtn').addEventListener('click', () => wrap(sendNow));
  $('#addScheduleBtn').addEventListener('click', () => wrap(addSchedule));

  document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const er = target.dataset.editRecipient;
    const dr = target.dataset.deleteRecipient;
    const et = target.dataset.editTemplate;
    const dt = target.dataset.deleteTemplate;
    const ts = target.dataset.toggleSchedule;
    const ds = target.dataset.deleteSchedule;
    if (er) wrap(() => editRecipient(er));
    if (dr) wrap(() => deleteItem('recipients', dr));
    if (et) wrap(() => editTemplate(et));
    if (dt) wrap(() => deleteItem('templates', dt));
    if (ts) wrap(() => toggleSchedule(ts));
    if (ds) wrap(() => deleteItem('schedules', ds));
  });
}

async function wrap(fn) {
  try {
    await fn();
  } catch (err) {
    setToast(err.message || String(err), true);
  }
}

async function safeLoadAll() {
  try {
    await loadAll();
  } catch (err) {
    setToast(err.message || '讀取失敗，請確認 ADMIN_TOKEN', true);
  }
}

bindEvents();
loadHealth();
safeLoadAll();
setInterval(() => safeLoadAll(), 30000);
