/**
 * Quest4You - Profile Page Logic
 * Gestão de perfil do utilizador
 */

// ================================
// STATE
// ================================
let currentUser = null;
let userData = null;

// ================================
// INITIALIZATION
// ================================
document.addEventListener("DOMContentLoaded", function() {
  // Check auth state
  if (typeof auth !== "undefined") {
    auth.onAuthStateChanged(handleAuthChange);
  } else {
    console.error("Firebase Auth not available");
    window.location.href = "auth.html";
  }

  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // Settings toggles
  document.getElementById("settingNotifications").addEventListener("change", saveSettings);
  document.getElementById("settingPublicProfile").addEventListener("change", saveSettings);
  document.getElementById("settingSmartMatch").addEventListener("change", saveSettings);
});

// ================================
// AUTH
// ================================
function handleAuthChange(user) {
  if (user) {
    currentUser = user;
    console.log("User logged in:", user.email);
    loadUserProfile();
  } else {
    console.log("User not logged in, redirecting...");
    window.location.href = "auth.html?redirect=" + encodeURIComponent(window.location.href);
  }
}

async function logout() {
  try {
    await auth.signOut();
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Erro ao terminar sessão. Tenta novamente.");
  }
}

// ================================
// LOAD PROFILE
// ================================
async function loadUserProfile() {
  // Update basic info from Firebase Auth
  updateProfileHeader();

  // Load full profile from Firestore
  if (typeof db !== "undefined") {
    try {
      const doc = await db.collection("quest4you_users").doc(currentUser.uid).get();
      
      if (doc.exists) {
        userData = doc.data();
        updateProfileFromFirestore();
        loadResults();
        loadBadges();
        updateStats();
        loadAllPhotos();
        initFriendsSystem();
      } else {
        // Create profile if doesn't exist
        await createUserProfile();
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  // Also load local results
  loadLocalResults();
}

function updateProfileHeader() {
  // Name
  document.getElementById("profileName").textContent = currentUser.displayName || "Utilizador";
  
  // Email
  document.getElementById("profileEmail").textContent = currentUser.email;
  
  // Avatar - Usar apenas foto pública do perfil Quest4You, NÃO usar foto do Google
  const avatarImg = document.getElementById("avatarImg");
  const avatarFallback = document.getElementById("avatarFallback");
  
  // Mostrar sempre as iniciais por defeito (não usar foto do Google)
  const name = currentUser.displayName || currentUser.email || "?";
  avatarFallback.textContent = name.charAt(0).toUpperCase();
  avatarImg.style.display = "none";
  avatarFallback.style.display = "flex";
  
  // Joined date
  const createdAt = currentUser.metadata?.creationTime;
  if (createdAt) {
    const date = new Date(createdAt);
    document.getElementById("profileJoined").textContent = `Membro desde ${formatDate(date)}`;
  }
}

function updateProfileFromFirestore() {
  if (!userData) return;

  // Update nickname display
  if (userData.nickname) {
    const nicknameDisplay = document.getElementById("profileNickname");
    if (nicknameDisplay) {
      nicknameDisplay.textContent = `${userData.nicknameEmoji || '👤'} ${userData.nickname}`;
    }
    // Also populate the form
    const nicknameInput = document.getElementById("nicknameInput");
    const emojiSelect = document.getElementById("nicknameEmoji");
    if (nicknameInput) nicknameInput.value = userData.nickname;
    if (emojiSelect) emojiSelect.value = userData.nicknameEmoji || '👤';
  } else {
    const nicknameDisplay = document.getElementById("profileNickname");
    if (nicknameDisplay) {
      nicknameDisplay.textContent = "Ainda não definiste um nickname";
      nicknameDisplay.style.color = '#999';
    }
  }

  // Update settings toggles
  if (userData.settings) {
    document.getElementById("settingNotifications").checked = userData.settings.notifications !== false;
    document.getElementById("settingPublicProfile").checked = userData.settings.publicProfile === true;
    document.getElementById("settingSmartMatch").checked = userData.settings.smartMatchEnabled !== false;
  }

  // Load personal info fields
  loadPersonalInfo();
  
  // Update profile completion
  updateProfileCompletion();
}

// ================================
// PERSONAL INFO (NEW)
// ================================

// Portugal districts and cities
const portugueseLocations = {
  districts: [
    { value: 'aveiro', label: 'Aveiro' },
    { value: 'beja', label: 'Beja' },
    { value: 'braga', label: 'Braga' },
    { value: 'braganca', label: 'Bragança' },
    { value: 'castelo-branco', label: 'Castelo Branco' },
    { value: 'coimbra', label: 'Coimbra' },
    { value: 'evora', label: 'Évora' },
    { value: 'faro', label: 'Faro' },
    { value: 'guarda', label: 'Guarda' },
    { value: 'leiria', label: 'Leiria' },
    { value: 'lisboa', label: 'Lisboa' },
    { value: 'portalegre', label: 'Portalegre' },
    { value: 'porto', label: 'Porto' },
    { value: 'santarem', label: 'Santarém' },
    { value: 'setubal', label: 'Setúbal' },
    { value: 'viana-castelo', label: 'Viana do Castelo' },
    { value: 'vila-real', label: 'Vila Real' },
    { value: 'viseu', label: 'Viseu' },
    { value: 'acores', label: 'Açores' },
    { value: 'madeira', label: 'Madeira' }
  ],
  cities: {
    'lisboa': ['Lisboa', 'Amadora', 'Cascais', 'Sintra', 'Loures', 'Oeiras', 'Almada', 'Vila Franca de Xira', 'Odivelas', 'Mafra'],
    'porto': ['Porto', 'Vila Nova de Gaia', 'Matosinhos', 'Maia', 'Gondomar', 'Valongo', 'Vila do Conde', 'Póvoa de Varzim', 'Trofa', 'Santo Tirso'],
    'braga': ['Braga', 'Guimarães', 'Vila Nova de Famalicão', 'Barcelos', 'Fafe', 'Vizela', 'Esposende'],
    'setubal': ['Setúbal', 'Almada', 'Seixal', 'Barreiro', 'Sesimbra', 'Montijo', 'Moita', 'Palmela'],
    'faro': ['Faro', 'Portimão', 'Albufeira', 'Loulé', 'Lagos', 'Olhão', 'Tavira', 'Silves'],
    'aveiro': ['Aveiro', 'Santa Maria da Feira', 'Ovar', 'Ílhavo', 'Oliveira de Azeméis', 'Espinho'],
    'coimbra': ['Coimbra', 'Figueira da Foz', 'Cantanhede', 'Lousã', 'Condeixa-a-Nova'],
    'leiria': ['Leiria', 'Caldas da Rainha', 'Marinha Grande', 'Peniche', 'Pombal', 'Alcobaça'],
    'santarem': ['Santarém', 'Tomar', 'Torres Novas', 'Entroncamento', 'Abrantes', 'Ourém'],
    'viseu': ['Viseu', 'Lamego', 'São Pedro do Sul', 'Mangualde', 'Tondela'],
    'viana-castelo': ['Viana do Castelo', 'Ponte de Lima', 'Arcos de Valdevez', 'Caminha'],
    'vila-real': ['Vila Real', 'Chaves', 'Peso da Régua', 'Mondim de Basto'],
    'braganca': ['Bragança', 'Mirandela', 'Macedo de Cavaleiros'],
    'guarda': ['Guarda', 'Seia', 'Gouveia', 'Trancoso'],
    'castelo-branco': ['Castelo Branco', 'Covilhã', 'Fundão'],
    'portalegre': ['Portalegre', 'Elvas', 'Campo Maior', 'Ponte de Sor'],
    'evora': ['Évora', 'Estremoz', 'Montemor-o-Novo', 'Vendas Novas'],
    'beja': ['Beja', 'Moura', 'Serpa', 'Castro Verde'],
    'acores': ['Ponta Delgada', 'Angra do Heroísmo', 'Horta', 'Ribeira Grande'],
    'madeira': ['Funchal', 'Câmara de Lobos', 'Santa Cruz', 'Machico']
  }
};

// Brazil states
const brazilLocations = {
  districts: [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ],
  cities: {
    'SP': ['São Paulo', 'Campinas', 'Santos', 'São Bernardo do Campo', 'Guarulhos', 'Osasco', 'Ribeirão Preto'],
    'RJ': ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Nova Iguaçu', 'Duque de Caxias', 'São Gonçalo'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'Foz do Iguaçu'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó', 'Balneário Camboriú'],
    'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde'],
    'DF': ['Brasília', 'Ceilândia', 'Taguatinga', 'Samambaia']
  }
};

function loadPersonalInfo() {
  if (!userData) return;

  // Load saved values into form fields
  const ageRange = document.getElementById('ageRange');
  const gender = document.getElementById('gender');
  const sexualOrientation = document.getElementById('sexualOrientation');
  const lookingFor = document.getElementById('lookingFor');
  const country = document.getElementById('country');
  const district = document.getElementById('district');
  const city = document.getElementById('city');

  if (userData.personalInfo) {
    const info = userData.personalInfo;
    
    if (ageRange && info.ageRange) {
      ageRange.value = info.ageRange;
      markFieldFilled(ageRange);
    }
    if (gender && info.gender) {
      gender.value = info.gender;
      markFieldFilled(gender);
    }
    if (sexualOrientation && info.sexualOrientation) {
      sexualOrientation.value = info.sexualOrientation;
      markFieldFilled(sexualOrientation);
    }
    if (lookingFor && info.lookingFor) {
      lookingFor.value = info.lookingFor;
      markFieldFilled(lookingFor);
    }
    if (country && info.country) {
      country.value = info.country;
      markFieldFilled(country);
      loadDistricts(); // Populate districts based on country
      
      // Wait for districts to load, then set value
      setTimeout(() => {
        if (district && info.district) {
          district.value = info.district;
          markFieldFilled(district);
          loadCities(); // Populate cities based on district
          
          setTimeout(() => {
            if (city && info.city) {
              city.value = info.city;
              markFieldFilled(city);
            }
          }, 100);
        }
      }, 100);
    }
  }

  // Add change listeners to mark fields as filled
  [ageRange, gender, sexualOrientation, lookingFor, country, district, city].forEach(field => {
    if (field) {
      field.addEventListener('change', function() {
        if (this.value) {
          markFieldFilled(this);
        } else {
          this.classList.remove('filled');
        }
      });
    }
  });
}

function markFieldFilled(field) {
  if (field && field.value) {
    field.classList.add('filled');
  }
}

function loadDistricts() {
  const country = document.getElementById('country').value;
  const districtSelect = document.getElementById('district');
  const citySelect = document.getElementById('city');

  // Reset
  districtSelect.innerHTML = '<option value="">Seleciona o distrito/estado</option>';
  citySelect.innerHTML = '<option value="">Seleciona primeiro o distrito</option>';
  districtSelect.classList.remove('filled');
  citySelect.classList.remove('filled');

  let districts = [];

  if (country === 'PT') {
    districts = portugueseLocations.districts;
  } else if (country === 'BR') {
    districts = brazilLocations.districts;
  } else if (country === 'ES') {
    districts = [
      { value: 'madrid', label: 'Madrid' },
      { value: 'barcelona', label: 'Barcelona' },
      { value: 'valencia', label: 'Valência' },
      { value: 'sevilla', label: 'Sevilha' },
      { value: 'andalucia', label: 'Andaluzia' },
      { value: 'galicia', label: 'Galiza' },
      { value: 'other-es', label: 'Outro' }
    ];
  } else if (country) {
    districts = [{ value: 'other', label: 'Não especificado' }];
  }

  districts.forEach(d => {
    const option = document.createElement('option');
    option.value = d.value;
    option.textContent = d.label;
    districtSelect.appendChild(option);
  });
}

function loadCities() {
  const country = document.getElementById('country').value;
  const district = document.getElementById('district').value;
  const citySelect = document.getElementById('city');

  // Reset
  citySelect.innerHTML = '<option value="">Seleciona a cidade</option>';
  citySelect.classList.remove('filled');

  let cities = [];

  if (country === 'PT' && portugueseLocations.cities[district]) {
    cities = portugueseLocations.cities[district];
  } else if (country === 'BR' && brazilLocations.cities[district]) {
    cities = brazilLocations.cities[district];
  } else if (district) {
    cities = ['Não especificado'];
  }

  cities.forEach(c => {
    const option = document.createElement('option');
    option.value = c.toLowerCase().replace(/\s+/g, '-');
    option.textContent = c;
    citySelect.appendChild(option);
  });
}

async function savePersonalInfo() {
  if (!currentUser || !db) {
    alert("Erro: Não estás autenticado.");
    return;
  }

  const ageRange = document.getElementById('ageRange').value;
  const gender = document.getElementById('gender').value;
  const sexualOrientation = document.getElementById('sexualOrientation').value;
  const lookingFor = document.getElementById('lookingFor').value;
  const country = document.getElementById('country').value;
  const district = document.getElementById('district').value;
  const city = document.getElementById('city').value;

  // Validate required fields
  const requiredFields = [
    { field: 'ageRange', value: ageRange, label: 'Faixa Etária' },
    { field: 'gender', value: gender, label: 'Género' },
    { field: 'sexualOrientation', value: sexualOrientation, label: 'Orientação Sexual' },
    { field: 'lookingFor', value: lookingFor, label: 'À Procura De' },
    { field: 'country', value: country, label: 'País' }
  ];

  let missingFields = [];
  requiredFields.forEach(f => {
    if (!f.value) {
      missingFields.push(f.label);
      document.getElementById(f.field).classList.add('error');
    } else {
      document.getElementById(f.field).classList.remove('error');
    }
  });

  if (missingFields.length > 0) {
    alert(`⚠️ Por favor preenche os campos obrigatórios:\n\n• ${missingFields.join('\n• ')}`);
    return;
  }

  // Disable button during save
  const saveBtn = document.getElementById('savePersonalInfoBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = '⏳ A guardar...';

  try {
    const personalInfo = {
      ageRange,
      gender,
      sexualOrientation,
      lookingFor,
      country,
      district: district || null,
      city: city || null,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Usar set com merge para criar documento se não existir
    await db.collection("quest4you_users").doc(currentUser.uid).set({
      personalInfo: personalInfo,
      profileComplete: true,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Update local data
    if (userData) {
      userData.personalInfo = personalInfo;
      userData.profileComplete = true;
    }

    // Update completion badge
    updateProfileCompletion();

    // Hide alert if shown
    const completionAlert = document.getElementById('profileCompletionAlert');
    if (completionAlert) completionAlert.style.display = 'none';

    alert('✅ Informações pessoais guardadas com sucesso!');
    console.log("Personal info saved:", personalInfo);

  } catch (error) {
    console.error("Error saving personal info:", error);
    alert("❌ Erro ao guardar informações. Tenta novamente.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Guardar Informações';
  }
}

function updateProfileCompletion() {
  const badge = document.getElementById('profileCompletionBadge');
  const alert = document.getElementById('profileCompletionAlert');
  
  if (!badge) return;

  // Calculate completion percentage
  let completed = 0;
  let total = 7; // Total required fields

  if (userData?.nickname) completed++;
  if (userData?.personalInfo?.ageRange) completed++;
  if (userData?.personalInfo?.gender) completed++;
  if (userData?.personalInfo?.sexualOrientation) completed++;
  if (userData?.personalInfo?.lookingFor) completed++;
  if (userData?.personalInfo?.country) completed++;
  if (userData?.photos?.public) completed++;

  const percent = Math.round((completed / total) * 100);

  // Update badge
  const percentSpan = badge.querySelector('.completion-percent');
  if (percentSpan) {
    percentSpan.textContent = percent + '%';
  }

  // Update badge color
  badge.classList.remove('incomplete', 'low');
  if (percent < 50) {
    badge.classList.add('low');
  } else if (percent < 100) {
    badge.classList.add('incomplete');
  }

  // Show/hide completion alert
  if (alert) {
    if (percent < 100 && !userData?.personalInfo?.ageRange) {
      alert.style.display = 'flex';
    } else {
      alert.style.display = 'none';
    }
  }
}

function scrollToPersonalInfo() {
  const section = document.getElementById('personalInfoSection');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Make functions globally available
window.loadDistricts = loadDistricts;
window.loadCities = loadCities;
window.savePersonalInfo = savePersonalInfo;
window.scrollToPersonalInfo = scrollToPersonalInfo;

async function createUserProfile() {
  try {
    await db.collection("quest4you_users").doc(currentUser.uid).set({
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || "Utilizador",
      photoURL: currentUser.photoURL || null,
      nickname: null,
      nicknameEmoji: '👤',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      quizResults: {},
      progress: {},      settings: {
        notifications: true,
        publicProfile: true,
        smartMatchEnabled: true
      }
    });
    console.log("Profile created");
  } catch (error) {
    console.error("Error creating profile:", error);
  }
}

// ================================
// NICKNAME
// ================================
async function saveNickname() {
  if (!currentUser || !db) {
    alert("Erro: Não estás autenticado.");
    return;
  }
  
  const nicknameInput = document.getElementById("nicknameInput");
  const emojiSelect = document.getElementById("nicknameEmoji");
  
  const nickname = nicknameInput.value.trim();
  const emoji = emojiSelect.value || '👤';
  
  if (!nickname) {
    alert("Por favor, insere um nickname.");
    return;
  }
  
  if (nickname.length < 3) {
    alert("O nickname deve ter pelo menos 3 caracteres.");
    return;
  }
  
  if (nickname.length > 20) {
    alert("O nickname não pode ter mais de 20 caracteres.");
    return;
  }
  
  // Check for inappropriate characters
  if (!/^[a-zA-Z0-9_\-\u00C0-\u017F ]+$/.test(nickname)) {
    alert("O nickname só pode conter letras, números, espaços, _ e -");
    return;
  }
  
  try {
    await db.collection("quest4you_users").doc(currentUser.uid).update({
      nickname: nickname,
      nicknameEmoji: emoji,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update local data
    if (userData) {
      userData.nickname = nickname;
      userData.nicknameEmoji = emoji;
    }
    
    // Update display
    const nicknameDisplay = document.getElementById("profileNickname");
    if (nicknameDisplay) {
      nicknameDisplay.textContent = `${emoji} ${nickname}`;
      nicknameDisplay.style.color = '#e53935';
    }
    
    alert("✅ Nickname guardado com sucesso!");
    console.log("Nickname saved:", emoji, nickname);
  } catch (error) {
    console.error("Error saving nickname:", error);
    alert("Erro ao guardar nickname. Tenta novamente.");
  }
}

// ================================
// LOAD RESULTS
// ================================
async function loadResults() {
  const grid = document.getElementById("resultsGrid");
  const emptyState = document.getElementById("emptyResults");
  
  // Get results from cloud via CloudSync
  let allResults = {};
  
  if (window.CloudSync) {
    try {
      allResults = await window.CloudSync.getQuizResults(currentUser.uid);
    } catch (error) {
      console.error("Error loading results from cloud:", error);
    }
  }
  
  // Fallback to userData if CloudSync not available
  if (Object.keys(allResults).length === 0) {
    allResults = userData?.quizResults || {};
  }
  
  // Filter out invalid keys (like user IDs that got saved incorrectly)
  const validQuizIds = ['vanilla', 'orientation', 'cuckold', 'swing', 'kinks', 'bdsm', 'adventure', 'fantasies', 'exhibitionism'];
  const resultIds = Object.keys(allResults).filter(key => {
    // Only keep valid quiz IDs
    if (validQuizIds.includes(key)) return true;
    // Filter out keys that look like Firebase UIDs (20+ alphanumeric chars)
    if (key.length > 15 && /^[a-zA-Z0-9]+$/.test(key)) {
      console.warn("Ignoring invalid quiz ID (looks like UID):", key);
      return false;
    }
    return true;
  });
  
  if (resultIds.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  
  emptyState.style.display = "none";
  
  // Quiz metadata
  const quizMeta = {
    vanilla: { name: "Vanilla ou Kink", icon: "🔥", color: "#e91e63" },
    orientation: { name: "Orientação Sexual", icon: "🌈", color: "#9c27b0" },
    cuckold: { name: "Voyeurismo & Partilha", icon: "👀", color: "#673ab7" },
    swing: { name: "Swing/Poliamor", icon: "💑", color: "#00bcd4" },
    kinks: { name: "Fetiches e Kinks", icon: "⛓️", color: "#f44336" },
    bdsm: { name: "BDSM & Dinâmicas de Poder", icon: "🎭", color: "#7B1FA2" },
    adventure: { name: "Aventura Sexual", icon: "🎲", color: "#FF5722" },
    fantasies: { name: "Fantasias Secretas", icon: "🔮", color: "#E91E63" },
    exhibitionism: { name: "Exibicionismo & Admiração", icon: "📸", color: "#FFC107" }
  };
  
  let html = "";
  
  resultIds.forEach(quizId => {
    const result = allResults[quizId];
    const meta = quizMeta[quizId] || { name: quizId, icon: "📝", color: "#666" };
    
    html += `
      <div class="result-card-compact" onclick="viewResult('${quizId}')">
        <div class="result-card-left" style="background: ${meta.color}">
          <span class="result-card-icon">${meta.icon}</span>
          <span class="result-card-score">${result.score || 0}%</span>
        </div>
        <div class="result-card-right">
          <h4 class="result-card-title">${meta.name}</h4>
          ${result.category ? `<p class="result-card-category">${result.categoryEmoji || ''} ${result.category}</p>` : ""}
          ${result.date ? `<span class="result-card-date">${formatDate(new Date(result.date))}</span>` : ""}
        </div>
      </div>
    `;
  });
  
  grid.innerHTML = html;
    // Store results for later use
  window.profileResults = allResults;
  
  // Show full report button if user has at least 2 quizzes
  const fullReportContainer = document.getElementById("fullReportContainer");
  if (fullReportContainer && resultIds.length >= 2) {
    fullReportContainer.style.display = "block";
  }
}

// loadLocalResults is deprecated - now using cloud only
function loadLocalResults() {
  // Migrar dados locais para cloud se existirem
  if (window.CloudSync && currentUser) {
    const localResults = localStorage.getItem("q4y_results");
    if (localResults) {
      window.CloudSync.migrateFromLocalStorage(currentUser.uid).then(result => {
        if (result.migrated > 0) {
          console.log("Migrated", result.migrated, "results to cloud");
          loadResults(); // Reload results from cloud
        }
      });
    }
  }
}

async function syncResultsToFirestore(localResults) {
  if (!db || !currentUser) return;
  
  try {
    const updates = {};
    
    for (const [quizId, result] of Object.entries(localResults)) {
      updates[`quizResults.${quizId}`] = result;
    }
    
    await db.collection("quest4you_users").doc(currentUser.uid).update(updates);
    console.log("Results synced to Firestore");
  } catch (error) {
    console.error("Error syncing results:", error);
  }
}

// ================================
// BADGES
// ================================
function loadBadges() {
  const grid = document.getElementById("badgesGrid");
  
  // Define available badges
  const badges = [
    { id: "first_quiz", icon: "🎯", name: "Primeiro Quiz", condition: () => getQuizCount() >= 1 },
    { id: "explorer", icon: "🧭", name: "Explorador", condition: () => getQuizCount() >= 3 },
    { id: "completist", icon: "🏆", name: "Completista", condition: () => getQuizCount() >= 5 },
    { id: "quick", icon: "⚡", name: "Rápido", condition: () => false }, // TODO: time-based
    { id: "sharer", icon: "📤", name: "Partilhador", condition: () => false }, // TODO: share tracking
    { id: "matcher", icon: "💕", name: "Matcher", condition: () => false } // TODO: smart match
  ];
  
  let html = "";
  let unlockedCount = 0;
  
  badges.forEach(badge => {
    const unlocked = badge.condition();
    if (unlocked) unlockedCount++;
    
    html += `
      <div class="badge-item ${unlocked ? '' : 'locked'}">
        <span class="badge-icon">${badge.icon}</span>
        <span class="badge-name">${badge.name}</span>
      </div>
    `;
  });
  
  grid.innerHTML = html;
  document.getElementById("statBadges").textContent = unlockedCount;
}

// ================================
// STATS
// ================================
function updateStats() {
  const quizCount = getQuizCount();
  document.getElementById("statQuizzes").textContent = quizCount;
  
  // Questions answered (estimate: 50 per quiz)
  document.getElementById("statQuestions").textContent = quizCount * 50;
  
  // Matches (placeholder)
  document.getElementById("statMatches").textContent = "0";
}

function getQuizCount() {
  // Use cached profile results
  const results = window.profileResults || userData?.quizResults || {};
  
  // Filter valid quiz IDs
  const validQuizIds = ['vanilla', 'orientation', 'cuckold', 'swing', 'kinks', 'bdsm', 'adventure', 'fantasies', 'exhibitionism'];
  const validResults = Object.keys(results).filter(key => validQuizIds.includes(key));
  
  return validResults.length;
}

// ================================
// SETTINGS
// ================================
async function saveSettings() {
  if (!db || !currentUser) return;
  
  const settings = {
    notifications: document.getElementById("settingNotifications").checked,
    publicProfile: document.getElementById("settingPublicProfile").checked,
    smartMatchEnabled: document.getElementById("settingSmartMatch").checked
  };
  
  try {
    await db.collection("quest4you_users").doc(currentUser.uid).update({ settings });
    console.log("Settings saved");
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

// ================================
// EDIT PROFILE
// ================================
function editProfile() {
  document.getElementById("editName").value = currentUser.displayName || "";
  document.getElementById("editPhoto").value = currentUser.photoURL || "";
  document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

async function saveProfile(event) {
  event.preventDefault();
  
  const name = document.getElementById("editName").value.trim();
  const photoURL = document.getElementById("editPhoto").value.trim();
  
  try {
    // Update Firebase Auth profile
    await currentUser.updateProfile({
      displayName: name,
      photoURL: photoURL || null
    });
    
    // Update Firestore
    if (db) {
      await db.collection("quest4you_users").doc(currentUser.uid).update({
        displayName: name,
        photoURL: photoURL || null
      });
    }
    
    // Update UI
    updateProfileHeader();
    closeEditModal();
    
    alert("Perfil atualizado com sucesso!");
    
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Erro ao guardar. Tenta novamente.");
  }
}

// ================================
// DANGER ZONE
// ================================
async function deleteAllData() {
  if (!confirm("Tens a certeza que queres apagar todos os teus dados? Esta ação não pode ser revertida.")) {
    return;
  }
  
  try {
    // Clear all quiz results from cloud
    if (db && currentUser) {
      await db.collection("quest4you_users").doc(currentUser.uid).update({
        quizResults: {},
        quizProgress: {},
        progress: {}
      });
      
      // Clear CloudSync cache
      if (window.CloudSync) {
        window.CloudSync.clearCache();
      }
    }
    
    // Clear any remaining localStorage data (legacy)
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("q4y_")) {
        localStorage.removeItem(key);
      }
    }
    
    alert("Todos os dados foram apagados.");
    window.location.reload();
    
  } catch (error) {
    console.error("Error deleting data:", error);
    alert("Erro ao apagar dados. Tenta novamente.");
  }
}

async function deleteAccount() {
  if (!confirm("Tens a certeza que queres eliminar a tua conta? Esta ação é PERMANENTE e não pode ser revertida.")) {
    return;
  }
  
  if (!confirm("ÚLTIMA CONFIRMAÇÃO: Ao eliminar a conta, perdes todos os dados. Continuar?")) {
    return;
  }
  
  try {
    // Delete Firestore document
    if (db) {
      await db.collection("quest4you_users").doc(currentUser.uid).delete();
    }
    
    // Clear localStorage
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("q4y_")) {
        localStorage.removeItem(key);
      }
    }
    
    // Delete Firebase Auth account
    await currentUser.delete();
    
    alert("Conta eliminada com sucesso.");
    window.location.href = "../index.html";
    
  } catch (error) {
    console.error("Error deleting account:", error);
    
    if (error.code === "auth/requires-recent-login") {
      alert("Por razões de segurança, precisas de fazer login novamente antes de eliminar a conta.");
      await auth.signOut();
      window.location.href = "auth.html";
    } else {
      alert("Erro ao eliminar conta. Tenta novamente.");
    }
  }
}

// ================================
// UTILITIES
// ================================
function formatDate(date) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return date.toLocaleDateString("pt-PT", options);
}

// ================================
// VIEW RESULT MODAL
// ================================
let currentViewingQuizId = null;

// Quiz metadata for modal
const QUIZ_META = {
  vanilla: { name: "Vanilla ou Kink", icon: "🔥", color: "#e91e63" },
  orientation: { name: "Orientação Sexual", icon: "🌈", color: "#9c27b0" },
  cuckold: { name: "Voyeurismo & Partilha", icon: "👀", color: "#673ab7" },
  swing: { name: "Swing/Poliamor", icon: "💑", color: "#00bcd4" },
  kinks: { name: "Fetiches e Kinks", icon: "⛓️", color: "#f44336" },
  bdsm: { name: "BDSM & Dinâmicas de Poder", icon: "🎭", color: "#7B1FA2" },
  adventure: { name: "Aventura Sexual", icon: "🎲", color: "#FF5722" },
  fantasies: { name: "Fantasias Secretas", icon: "🔮", color: "#E91E63" },
  exhibitionism: { name: "Exibicionismo & Admiração", icon: "📸", color: "#FFC107" }
};

async function viewResult(quizId) {
  currentViewingQuizId = quizId;
  
  // Get quiz config
  const quiz = QUIZ_META[quizId] || { name: quizId, icon: "📝", color: "#666" };
  
  // Get saved results from cloud
  const allResults = window.profileResults || userData?.quizResults || {};
  let result = allResults[quizId];
  
  // Try to load from cloud if not available
  if (!result && currentUser && window.CloudSync) {
    result = await window.CloudSync.getQuizResult(currentUser.uid, quizId);
  }
  
  if (!result) {
    alert("Não foram encontrados resultados para este questionário.");
    return;
  }
  
  // Update modal content
  const modal = document.getElementById("resultModal");
  
  // Header
  document.getElementById("resultEmoji").textContent = quiz.icon;
  document.getElementById("resultHeader").style.background = 
    'linear-gradient(135deg, ' + quiz.color + ' 0%, ' + adjustColor(quiz.color, -20) + ' 100%)';
  
  // Score
  document.getElementById("resultScore").textContent = result.score || 0;
  
  // Category
  if (result.category) {
    document.getElementById("resultCategoryEmoji").textContent = result.categoryEmoji || quiz.icon;
    document.getElementById("resultCategoryLabel").textContent = result.category;
  } else if (result.dominantRole) {
    document.getElementById("resultCategoryEmoji").textContent = "🎭";
    document.getElementById("resultCategoryLabel").textContent = "Role: " + result.dominantRole;
  } else {
    document.getElementById("resultCategoryEmoji").textContent = "🎯";
    document.getElementById("resultCategoryLabel").textContent = result.score + "% de Intensidade";
  }
  
  // Description (use saved or generate based on score)
  const description = result.categoryDescription || generateResultDescription(quiz.name, result.score);
  document.getElementById("resultDescription").textContent = description;
  
  // Breakdown
  const breakdownHtml = buildResultBreakdown(result.categoryScores || {});
  document.getElementById("resultBreakdown").innerHTML = breakdownHtml;
  
  // Show modal
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function generateResultDescription(quizName, score) {
  if (score >= 80) {
    return "Tens um nível muito elevado nesta área! Os teus resultados mostram um grande interesse e abertura.";
  } else if (score >= 60) {
    return "Tens uma curiosidade saudável e estás aberto/a a explorar esta área com moderação.";
  } else if (score >= 40) {
    return "Tens um interesse moderado nesta área. Podes explorar mais ao teu ritmo.";
  } else if (score >= 20) {
    return "Esta área não é particularmente do teu interesse, mas manténs a mente aberta.";
  } else {
    return "Esta área não parece ser do teu interesse no momento. E está tudo bem assim!";
  }
}

function buildResultBreakdown(categoryScores) {
  const entries = Object.entries(categoryScores);
  if (entries.length === 0) return "<p style='text-align: center; color: #888;'>Sem dados de categorias disponíveis.</p>";
  
  // Sort by score descending
  entries.sort((a, b) => b[1] - a[1]);
  const top5 = entries.slice(0, 5);
  
  let html = '<p style="font-weight: 600; margin-bottom: 0.75rem; color: #333;">Top Categorias:</p>';
  
  top5.forEach(([category, score]) => {
    const label = formatCategoryLabel(category);
    html += '<div class="result-breakdown-item">';
    html += '  <span class="result-breakdown-label">' + label + '</span>';
    html += '  <div class="result-breakdown-bar"><div class="result-breakdown-fill" style="width: ' + score + '%"></div></div>';
    html += '  <span class="result-breakdown-value">' + score + '%</span>';
    html += '</div>';
  });
  
  return html;
}

function formatCategoryLabel(category) {
  return category.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
}

function adjustColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function closeResultModal() {
  const modal = document.getElementById("resultModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
}

function shareResult() {
  if (!currentViewingQuizId) return;
  
  const quiz = QUIZ_META[currentViewingQuizId] || { name: currentViewingQuizId };
  const allResults = window.profileResults || userData?.quizResults || {};
  const result = allResults[currentViewingQuizId];
  
  if (!quiz || !result) return;
  
  const text = 'Fiz o questionário "' + quiz.name + '" no Quest4You!\n\nO meu resultado: ' + (result.category || result.score + '%') + '\n\nDescobre o teu também em quest4you.com';
  
  if (navigator.share) {
    navigator.share({
      title: 'Quest4You - ' + quiz.name,
      text: text,
      url: window.location.origin
    });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert("Resultado copiado para a área de transferência!");
    });
  }
}

async function retakeQuiz() {
  if (!currentViewingQuizId) return;
  
  if (confirm("Tens a certeza que queres refazer o questionário? As tuas respostas serão apagadas.")) {
    // Delete from cloud
    if (currentUser && window.CloudSync) {
      try {
        await window.CloudSync.deleteQuizResult(currentUser.uid, currentViewingQuizId);
        await window.CloudSync.clearQuizProgress(currentUser.uid, currentViewingQuizId);
        console.log("Result and progress deleted from cloud");
      } catch (error) {
        console.error("Error deleting from cloud:", error);
      }
    }
    
    // Close modal and go to quiz
    closeResultModal();
    window.location.href = './quiz.html?id=' + currentViewingQuizId;
  }
}

// ================================
// EXPORTS
// ================================
window.editProfile = editProfile;
window.closeEditModal = closeEditModal;
window.saveProfile = saveProfile;
window.deleteAllData = deleteAllData;
window.deleteAccount = deleteAccount;
window.viewResult = viewResult;
window.closeResultModal = closeResultModal;
window.shareResult = shareResult;
window.retakeQuiz = retakeQuiz;
window.viewFullReport = viewFullReport;
window.closeFullReport = closeFullReport;
window.shareFullReport = shareFullReport;
window.downloadFullReport = downloadFullReport;
window.saveNickname = saveNickname;

// ================================
// FULL REPORT
// ================================
function viewFullReport() {
  const allResults = window.profileResults || userData?.quizResults || {};
  
  // Filter valid quiz IDs
  const validQuizIds = ['vanilla', 'orientation', 'cuckold', 'swing', 'kinks', 'bdsm', 'adventure', 'fantasies', 'exhibitionism'];
  const resultIds = Object.keys(allResults).filter(key => validQuizIds.includes(key));
  
  if (resultIds.length < 2) {
    alert("Precisas de completar pelo menos 2 questionários para ver o relatório completo.");
    return;
  }
  
  // Generate report content
  const reportBody = document.getElementById("fullReportBody");
  let html = "";
  
  // Overview Section
  html += '<div class="report-section">';
  html += '<h2 class="report-section-title">📈 Visão Geral</h2>';
  html += '<div class="report-overview-grid">';
  
  // Calculate average score
  let totalScore = 0;
  resultIds.forEach(id => {
    totalScore += allResults[id].score || 0;
  });
  const avgScore = Math.round(totalScore / resultIds.length);
  
  html += '<div class="report-stat-card">';
  html += '  <div class="report-stat-icon">📝</div>';
  html += '  <div class="report-stat-value">' + resultIds.length + '</div>';
  html += '  <div class="report-stat-label">Questionários</div>';
  html += '</div>';
  
  html += '<div class="report-stat-card">';
  html += '  <div class="report-stat-icon">📊</div>';
  html += '  <div class="report-stat-value">' + avgScore + '%</div>';
  html += '  <div class="report-stat-label">Média Global</div>';
  html += '</div>';
  
  html += '<div class="report-stat-card">';
  html += '  <div class="report-stat-icon">❓</div>';
  html += '  <div class="report-stat-value">' + (resultIds.length * 50) + '</div>';
  html += '  <div class="report-stat-label">Perguntas Respondidas</div>';
  html += '</div>';
  
  html += '</div></div>';
  
  // Scores Comparison Section
  html += '<div class="report-section">';
  html += '<h2 class="report-section-title">🎯 Comparação de Resultados</h2>';
  html += '<div class="report-scores-chart">';
  
  // Sort by score descending
  const sortedResults = resultIds.map(id => ({
    id,
    ...allResults[id],
    meta: QUIZ_META[id] || { name: id, icon: "📝", color: "#666" }
  })).sort((a, b) => (b.score || 0) - (a.score || 0));
  
  sortedResults.forEach(result => {
    html += '<div class="report-score-row">';
    html += '  <div class="report-score-quiz">';
    html += '    <span class="report-quiz-icon" style="color: ' + result.meta.color + '">' + result.meta.icon + '</span>';
    html += '    <span class="report-quiz-name">' + result.meta.name + '</span>';
    html += '  </div>';
    html += '  <div class="report-score-bar-container">';
    html += '    <div class="report-score-bar" style="width: ' + (result.score || 0) + '%; background: ' + result.meta.color + '"></div>';
    html += '  </div>';
    html += '  <span class="report-score-value">' + (result.score || 0) + '%</span>';
  });
  
  html += '</div></div>';
  
  // Detailed Results Section
  html += '<div class="report-section">';
  html += '<h2 class="report-section-title">📋 Resultados Detalhados</h2>';
  html += '<div class="report-details-grid">';
  
  sortedResults.forEach(result => {
    html += '<div class="report-detail-card">';
    html += '  <div class="report-detail-header" style="background: ' + result.meta.color + '">';
    html += '    <span class="report-detail-icon">' + result.meta.icon + '</span>';
    html += '    <span class="report-detail-title">' + result.meta.name + '</span>';
    html += '  </div>';
    html += '  <div class="report-detail-body">';
    html += '    <div class="report-detail-score">' + (result.score || 0) + '%</div>';
    
    if (result.category) {
      html += '    <div class="report-detail-category">';
      html += '      <span>' + (result.categoryEmoji || result.meta.icon) + ' ' + result.category + '</span>';
      html += '    </div>';
    } else if (result.dominantRole) {
      html += '    <div class="report-detail-category">';
      html += '      <span>🎭 Role: ' + result.dominantRole + '</span>';
    }
    
    // Show top categories if available
    if (result.categoryScores) {
      const topCategories = Object.entries(result.categoryScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      if (topCategories.length > 0) {
        html += '    <div class="report-detail-breakdown">';
        topCategories.forEach(([cat, score]) => {
          html += '      <div class="report-mini-bar">';
          html += '        <span>' + formatCategoryLabel(cat) + '</span>';
          html += '        <div class="report-mini-bar-bg"><div class="report-mini-bar-fill" style="width: ' + score + '%; background: ' + result.meta.color + '"></div></div>';
          html += '        <span>' + score + '%</span>';
        });
        html += '    </div>';
      }
    }
    
    if (result.date) {
      html += '    <div class="report-detail-date">Completado em ' + formatDate(new Date(result.date)) + '</div>';
    }
    
    html += '  </div>';
    html += '</div>';
  });
  
  html += '</div></div>';
  
  // Profile Summary Section
  html += '<div class="report-section">';
  html += '<h2 class="report-section-title">✨ O Teu Perfil</h2>';
  html += '<div class="report-profile-summary">';
  
  // Generate profile insights based on results
  const profileInsights = generateProfileInsights(sortedResults);
  html += '<p class="report-profile-text">' + profileInsights + '</p>';
  
  // Highlight areas
  if (sortedResults.length >= 3) {
    const top3 = sortedResults.slice(0, 3);
    html += '<div class="report-highlights">';
    html += '  <h4>🏆 Top 3 Áreas de Interesse:</h4>';
    html += '  <div class="report-highlight-tags">';
    top3.forEach(r => {
      html += '    <span class="report-tag" style="background: ' + r.meta.color + '">' + r.meta.icon + ' ' + r.meta.name + '</span>';
    });
    html += '  </div>';
    html += '</div>';
  }
  
  html += '</div></div>';
  
  reportBody.innerHTML = html;
  
  // Show modal
  const modal = document.getElementById("fullReportModal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function generateProfileInsights(sortedResults) {
  if (sortedResults.length === 0) return "Completa mais questionários para descobrir o teu perfil!";
  
  const avgScore = sortedResults.reduce((sum, r) => sum + (r.score || 0), 0) / sortedResults.length;
  const topQuiz = sortedResults[0];
  
  let text = "";
  
  if (avgScore >= 70) {
    text = "Os teus resultados mostram que és uma pessoa muito aberta à exploração e novas experiências. ";
  } else if (avgScore >= 50) {
    text = "Tens uma mente curiosa e equilibrada, aberta a explorar mas com limites bem definidos. ";
  } else if (avgScore >= 30) {
    text = "Preferes uma abordagem mais tradicional, mas manténs curiosidade sobre diferentes temas. ";
  } else {
    text = "Valorizas experiências mais convencionais e confortáveis. E está tudo bem assim! ";
  }
  
  text += "A tua área de maior interesse é <strong>" + topQuiz.meta.name + "</strong> com " + topQuiz.score + "% de afinidade";
  
  if (topQuiz.category) {
    text += ", classificando-te como <strong>" + topQuiz.category + "</strong>";
  }
  
  text += ". ";
  
  if (sortedResults.length >= 5) {
    text += "Com " + sortedResults.length + " questionários completos, tens um perfil bem definido e detalhado!";
  } else {
    text += "Completa mais questionários para ter um perfil ainda mais detalhado.";
  }
  
  return text;
}

function closeFullReport() {
  const modal = document.getElementById("fullReportModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
}

function shareFullReport() {
  const allResults = window.profileResults || {};
  const validQuizIds = ['vanilla', 'orientation', 'cuckold', 'swing', 'kinks', 'bdsm', 'adventure', 'fantasies', 'exhibitionism'];
  const count = Object.keys(allResults).filter(k => validQuizIds.includes(k)).length;
  
  const text = '🎯 O meu perfil Quest4You!\n\nCompletei ' + count + ' questionários de autoconhecimento.\n\nDescobre o teu perfil também em quest4you.com';
  
  if (navigator.share) {
    navigator.share({
      title: 'Quest4You - Meu Perfil',
      text: text,
      url: window.location.origin
    });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert("Texto copiado para a área de transferência!");
    });
  }
}

function downloadFullReport() {
  // For now, show message - PDF generation would require a library
  alert("📥 Funcionalidade de download PDF em breve!\n\nPor agora, podes usar Ctrl+P (ou Cmd+P no Mac) para imprimir/guardar como PDF enquanto o relatório está aberto.");
}

// ================================
// PROFILE PHOTOS
// ================================
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

async function uploadPhoto(type, inputElement) {
  if (!currentUser) {
    alert("Precisas de estar autenticado para fazer upload de fotos.");
    return;
  }

  const file = inputElement.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert("Por favor, seleciona uma imagem válida.");
    return;
  }

  // Validate file size
  if (file.size > MAX_PHOTO_SIZE) {
    alert("A imagem é demasiado grande. Máximo: 5MB");
    return;
  }

  // Check if secret photo requires validation
  if (type === 'secret') {
    const validationStatus = userData?.genderValidation?.status;
    if (validationStatus !== 'approved') {
      alert("Precisas de ter a validação de género aprovada para usar fotos secretas.");
      inputElement.value = '';
      return;
    }
  }

  try {
    // Show loading state
    const previewEl = document.getElementById(type + 'PhotoPreview');
    previewEl.innerHTML = '<div class="photo-loading">📤 A carregar...</div>';

    // Convert to base64 (for now - later use Firebase Storage)
    const base64 = await fileToBase64(file);

    // Resize image if needed
    const resizedBase64 = await resizeImage(base64, 800);

    // Save to Firestore
    const photoKey = type + 'Photo';
    await db.collection("quest4you_users").doc(currentUser.uid).update({
      [photoKey]: resizedBase64,
      [photoKey + 'UpdatedAt']: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update local data
    if (userData) {
      userData[photoKey] = resizedBase64;
    }    // Update UI
    updatePhotoPreview(type, resizedBase64);
    
    console.log("✅ Photo uploaded:", type);
    alert("Foto atualizada com sucesso!");

  } catch (error) {
    console.error("Error uploading photo:", error);
    alert("Erro ao carregar foto. Por favor, tenta novamente.");
  }

  inputElement.value = '';
}

async function removePhoto(type) {
  if (!currentUser) return;

  if (!confirm("Tens a certeza que queres remover esta foto?")) {
    return;
  }

  try {
    const photoKey = type + 'Photo';
    await db.collection("quest4you_users").doc(currentUser.uid).update({
      [photoKey]: firebase.firestore.FieldValue.delete(),
      [photoKey + 'UpdatedAt']: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update local data
    if (userData) {
      delete userData[photoKey];
    }

    // Update UI
    updatePhotoPreview(type, null);
    
    console.log("✅ Photo removed:", type);

  } catch (error) {
    console.error("Error removing photo:", error);
    alert("Erro ao remover foto.");
  }
}

function updatePhotoPreview(type, photoUrl) {
  const previewEl = document.getElementById(type + 'PhotoPreview');
  const imgEl = document.getElementById(type + 'PhotoImg');
  const removeBtn = document.getElementById('remove' + capitalizeFirst(type) + 'Btn');

  if (!previewEl || !imgEl) {
    console.warn(`Preview elements not found for ${type} photo`);
    return;
  }

  if (photoUrl) {
    imgEl.src = photoUrl;
    imgEl.style.display = 'block';
    // Remove placeholder if exists
    const placeholder = previewEl.querySelector('.photo-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'inline-flex';
  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
    // Show placeholder
    const placeholder = previewEl.querySelector('.photo-placeholder');
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
  }
}

function loadAllPhotos() {
  if (!userData) return;

  ['public', 'private', 'secret'].forEach(type => {
    const photoKey = type + 'Photo';
    if (userData[photoKey]) {
      updatePhotoPreview(type, userData[photoKey]);
      
      // Se é a foto pública, também mostrar no avatar do perfil
      if (type === 'public') {
        updateProfileAvatar(userData[photoKey]);
      }
    }
  });

  // Update gender validation status
  updateValidationStatusUI();
}

// Atualizar avatar do perfil com foto pública do Quest4You
function updateProfileAvatar(photoUrl) {
  const avatarImg = document.getElementById("avatarImg");
  const avatarFallback = document.getElementById("avatarFallback");
  
  if (photoUrl && avatarImg) {
    avatarImg.src = photoUrl;
    avatarImg.style.display = "block";
    avatarImg.onload = function() {
      avatarImg.classList.add("loaded");
      avatarFallback.style.display = "none";
    };
    avatarImg.onerror = function() {
      // Se falhar a carregar, mostrar iniciais
      avatarImg.style.display = "none";
      avatarFallback.style.display = "flex";
    };
  }
}

// ================================
// GENDER VALIDATION
// ================================
async function submitGenderValidation(inputElement) {
  if (!currentUser) {
    alert("Precisas de estar autenticado.");
    return;
  }

  const file = inputElement.files[0];
  if (!file) return;

  // Validate file
  if (!file.type.startsWith('image/')) {
    alert("Por favor, seleciona uma imagem válida.");
    return;
  }

  if (file.size > MAX_PHOTO_SIZE) {
    alert("A imagem é demasiado grande. Máximo: 5MB");
    return;
  }

  try {
    // Show loading
    const statusSection = document.getElementById('validationNotStarted');
    if (statusSection) {
      statusSection.innerHTML = '<div class="photo-loading">📤 A enviar...</div>';
    }

    // Convert and resize
    const base64 = await fileToBase64(file);
    const resizedBase64 = await resizeImage(base64, 600);

    // Generate watermark for validation
    const watermark = generateValidationWatermark(currentUser.uid);

    // Get user data for the validation request
    const userDoc = await db.collection("quest4you_users").doc(currentUser.uid).get();
    const userDataForValidation = userDoc.data() || {};

    // Create validation request in separate collection (for admin panel)
    const validationRef = db.collection("genderValidations").doc(currentUser.uid);
    await validationRef.set({
      userId: currentUser.uid,
      userShortId: currentUser.uid.slice(-6).toUpperCase(),
      watermark: watermark,
      email: currentUser.email || userDataForValidation.email,
      displayName: userDataForValidation.displayName || 'Utilizador',
      declaredGender: userDataForValidation.smartMatchPreferences?.gender || userDataForValidation.gender || 'not_specified',
      orientation: userDataForValidation.smartMatchPreferences?.orientation || 'not_specified',
      lookingFor: userDataForValidation.smartMatchPreferences?.lookingFor || 'not_specified',
      quizzesCompleted: userDataForValidation.results ? Object.keys(userDataForValidation.results).length : 0,
      publicPhotoUrl: userDataForValidation.photos?.public || null,
      privatePhotoUrl: userDataForValidation.photos?.private || null,
      secretPhotoUrl: userDataForValidation.photos?.secret || null,
      validationPhotoUrl: resizedBase64,
      status: 'pending',
      requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null
    });

    // Also update user document
    await db.collection("quest4you_users").doc(currentUser.uid).update({
      genderValidation: {
        status: 'pending',
        photoUrl: resizedBase64,
        submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null
      }
    });

    // Update local data
    if (userData) {
      userData.genderValidation = {
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
    }

    // Update UI
    updateValidationStatusUI();
    
    console.log("✅ Gender validation submitted");
    alert("Foto de validação enviada! Será analisada em 24-48 horas.");

  } catch (error) {
    console.error("Error submitting validation:", error);
    alert("Erro ao enviar. Por favor, tenta novamente.");
    updateValidationStatusUI(); // Restore state
  }

  inputElement.value = '';
}

function updateValidationStatusUI() {
  const notStarted = document.getElementById('validationNotStarted');
  const pending = document.getElementById('validationPending');
  const approved = document.getElementById('validationApproved');
  const rejected = document.getElementById('validationRejected');
  const secretUpload = document.getElementById('secretPhotoInput');
  const genderStatus = document.getElementById('genderValidationStatus');

  // Hide all
  [notStarted, pending, approved, rejected].forEach(el => {
    if (el) el.style.display = 'none';
  });

  const validation = userData?.genderValidation;

  if (!validation || !validation.status) {
    // Not started
    if (notStarted) notStarted.style.display = 'block';
    if (secretUpload) secretUpload.disabled = true;
    if (genderStatus) genderStatus.innerHTML = '<span class="validation-pending">⏳ Validação pendente</span>';
  } else if (validation.status === 'pending') {
    // Pending review
    if (pending) pending.style.display = 'block';
    if (secretUpload) secretUpload.disabled = true;
    if (genderStatus) genderStatus.innerHTML = '<span class="validation-pending">⏳ Em análise</span>';
  } else if (validation.status === 'approved') {
    // Approved
    if (approved) approved.style.display = 'block';
    if (secretUpload) secretUpload.disabled = false;
    if (genderStatus) genderStatus.innerHTML = '<span style="color: #4CAF50;">✅ Validado</span>';
  } else if (validation.status === 'rejected') {
    // Rejected
    if (rejected) {
      rejected.style.display = 'block';
      const reasonEl = document.getElementById('rejectionReason');
      if (reasonEl && validation.rejectionReason) {
        reasonEl.textContent = 'Motivo: ' + validation.rejectionReason;
      }
    }
    if (secretUpload) secretUpload.disabled = true;
    if (genderStatus) genderStatus.innerHTML = '<span style="color: #f44336;">❌ Rejeitado</span>';
  }
}

// ================================
// UTILITY FUNCTIONS
// ================================
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeImage(base64, maxSize) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = base64;
  });
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ================================
// FEEDBACK SYSTEM
// ================================
async function submitFeedback() {
  if (!currentUser) {
    alert("❌ Precisas de estar autenticado para enviar feedback.");
    return;
  }

  const feedbackText = document.getElementById('feedbackText').value.trim();
  const feedbackType = document.querySelector('input[name="feedbackType"]:checked')?.value || 'other';

  if (!feedbackText) {
    alert("⚠️ Por favor, escreve o teu feedback antes de enviar.");
    return;
  }

  if (feedbackText.length < 10) {
    alert("⚠️ O feedback precisa de ter pelo menos 10 caracteres.");
    return;
  }

  try {
    // Create feedback document
    await db.collection("quest4you_feedback").add({
      userId: currentUser.uid,
      email: currentUser.email,
      displayName: userData?.displayName || 'Anónimo',
      type: feedbackType,
      message: feedbackText,
      userAgent: navigator.userAgent,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'new'
    });

    // Clear form
    document.getElementById('feedbackText').value = '';
    
    // Show success
    alert("✅ Obrigado pelo teu feedback!\n\nA tua opinião é muito importante para nós e ajuda-nos a melhorar o Quest4You. 💕");
    
    console.log("✅ Feedback submitted:", feedbackType);

  } catch (error) {
    console.error("Error submitting feedback:", error);
    alert("❌ Erro ao enviar feedback. Por favor, tenta novamente.");
  }
}

// ================================
// GENERATE VALIDATION WATERMARK
// ================================
function generateValidationWatermark(userId) {
  const date = new Date();
  const formattedDate = date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Create short user identifier (last 6 chars of UID)
  const shortId = userId.slice(-6).toUpperCase();
  
  return `Q4Y-${shortId} | ${formattedDate} ${formattedTime}`;
}

// Export new functions
window.uploadPhoto = uploadPhoto;
window.removePhoto = removePhoto;
window.submitGenderValidation = submitGenderValidation;
window.submitFeedback = submitFeedback;

// ================================
// FRIENDS SYSTEM
// ================================
let friendsList = [];
let pendingRequests = [];
let searchTimeout = null;
let currentViewingFriend = null;

// Load friends on profile load
async function loadFriends() {
  if (!currentUser || !db) return;
  
  try {
    // Get friendships where user is sender or receiver and status is accepted
    const sentFriendships = await db.collection("quest4you_friendships")
      .where("senderId", "==", currentUser.uid)
      .where("status", "==", "accepted")
      .get();
    
    const receivedFriendships = await db.collection("quest4you_friendships")
      .where("receiverId", "==", currentUser.uid)
      .where("status", "==", "accepted")
      .get();
    
    // Collect friend IDs
    const friendIds = new Set();
    const friendshipMap = new Map();
    
    sentFriendships.docs.forEach(doc => {
      const data = doc.data();
      friendIds.add(data.receiverId);
      friendshipMap.set(data.receiverId, { id: doc.id, ...data });
    });
    
    receivedFriendships.docs.forEach(doc => {
      const data = doc.data();
      friendIds.add(data.senderId);
      friendshipMap.set(data.senderId, { id: doc.id, ...data });
    });
    
    // Fetch friend profiles
    friendsList = [];
    for (const friendId of friendIds) {
      const friendDoc = await db.collection("quest4you_users").doc(friendId).get();
      if (friendDoc.exists) {
        const friendData = friendDoc.data();
        friendsList.push({
          id: friendId,
          friendshipId: friendshipMap.get(friendId).id,
          ...friendData
        });
      }
    }
    
    // Update UI
    renderFriendsList();
    updateFriendsCount();
    
  } catch (error) {
    console.error("Error loading friends:", error);
  }
}

// Load pending friend requests
async function loadPendingRequests() {
  if (!currentUser || !db) return;
  
  try {
    const snapshot = await db.collection("quest4you_friendships")
      .where("receiverId", "==", currentUser.uid)
      .where("status", "==", "pending")
      .get();
    
    pendingRequests = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const senderDoc = await db.collection("quest4you_users").doc(data.senderId).get();
      
      if (senderDoc.exists) {
        const senderData = senderDoc.data();
        pendingRequests.push({
          id: doc.id,
          senderId: data.senderId,
          senderName: senderData.displayName || senderData.nickname || 'Utilizador',
          senderNickname: senderData.nickname ? `${senderData.nicknameEmoji || '👤'} ${senderData.nickname}` : null,
          senderPhoto: senderData.photos?.public || null,
          createdAt: data.createdAt
        });
      }
    }
    
    renderPendingRequests();
    
  } catch (error) {
    console.error("Error loading pending requests:", error);
  }
}

// Render friends list
function renderFriendsList() {
  const grid = document.getElementById("friendsGrid");
  const emptyState = document.getElementById("emptyFriends");
  
  if (!grid) return;
  
  if (friendsList.length === 0) {
    grid.innerHTML = '';
    grid.appendChild(emptyState);
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  grid.innerHTML = friendsList.map(friend => `
    <div class="friend-card" onclick="viewFriendProfile('${friend.id}')">
      <div class="friend-avatar">
        ${friend.photos?.public 
          ? `<img src="${friend.photos.public}" alt="${friend.displayName || 'Amigo'}">`
          : (friend.displayName || friend.nickname || '?').charAt(0).toUpperCase()
        }
        <span class="friend-online-indicator offline"></span>
      </div>
      <div class="friend-info">
        <div class="friend-name">${friend.displayName || 'Utilizador'}</div>
        <div class="friend-nickname">${friend.nickname ? `${friend.nicknameEmoji || '👤'} ${friend.nickname}` : 'Sem nickname'}</div>
        <div class="friend-stats">
          <span>📝 ${Object.keys(friend.quizResults || {}).length} quizzes</span>
        </div>
      </div>
      <div class="friend-card-actions">
        <button class="friend-action-btn" onclick="event.stopPropagation(); removeFriend('${friend.id}', '${friend.friendshipId}')" title="Remover amigo">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

// Render pending requests
function renderPendingRequests() {
  const card = document.getElementById("friendRequestsCard");
  const list = document.getElementById("friendRequestsList");
  
  if (!card || !list) return;
  
  if (pendingRequests.length === 0) {
    card.style.display = 'none';
    return;
  }
  
  card.style.display = 'block';
  
  list.innerHTML = pendingRequests.map(request => `
    <div class="friend-request-item" id="request-${request.id}">
      <div class="friend-request-avatar">
        ${request.senderPhoto 
          ? `<img src="${request.senderPhoto}" alt="${request.senderName}">`
          : request.senderName.charAt(0).toUpperCase()
        }
      </div>
      <div class="friend-request-info">
        <div class="friend-request-name">${request.senderName}</div>
        ${request.senderNickname ? `<div class="friend-request-nickname">${request.senderNickname}</div>` : ''}
      </div>
      <div class="friend-request-actions">
        <button class="btn btn-primary btn-sm" onclick="acceptFriendRequest('${request.id}', '${request.senderId}')">
          ✅ Aceitar
        </button>
        <button class="btn btn-outline btn-sm" onclick="rejectFriendRequest('${request.id}')">
          ❌ Rejeitar
        </button>
      </div>
    </div>
  `).join('');
}

// Update friends count badge
function updateFriendsCount() {
  const badge = document.getElementById("friendsCountBadge");
  if (badge) {
    badge.textContent = friendsList.length;
  }
}

// Filter friends by search
function filterFriends() {
  const query = document.getElementById("friendSearchInput").value.toLowerCase().trim();
  const cards = document.querySelectorAll(".friend-card");
  
  cards.forEach(card => {
    const name = card.querySelector(".friend-name")?.textContent.toLowerCase() || '';
    const nickname = card.querySelector(".friend-nickname")?.textContent.toLowerCase() || '';
    
    if (name.includes(query) || nickname.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Open add friend modal
function openAddFriendModal() {
  const modal = document.getElementById("addFriendModal");
  if (modal) {
    modal.style.display = "flex";
    document.getElementById("friendSearchQuery").value = '';
    document.getElementById("friendSearchResults").innerHTML = `
      <div class="search-hint">
        <span class="hint-icon">💡</span>
        <span>Escreve pelo menos 3 caracteres para procurar</span>
      </div>
    `;
  }
}

// Close add friend modal
function closeAddFriendModal() {
  const modal = document.getElementById("addFriendModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Search users with debounce
function searchUsersDebounced() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(searchUsers, 300);
}

// Search users
async function searchUsers() {
  const query = document.getElementById("friendSearchQuery").value.trim().toLowerCase();
  const resultsDiv = document.getElementById("friendSearchResults");
  const loadingSpan = document.getElementById("searchLoading");
  
  if (query.length < 3) {
    resultsDiv.innerHTML = `
      <div class="search-hint">
        <span class="hint-icon">💡</span>
        <span>Escreve pelo menos 3 caracteres para procurar</span>
      </div>
    `;
    return;
  }
  
  loadingSpan.style.display = 'inline';
  
  try {
    // Search by nickname or email
    const usersSnapshot = await db.collection("quest4you_users")
      .where("settings.publicProfile", "==", true)
      .limit(50)
      .get();
    
    const results = [];
    const existingFriendIds = new Set(friendsList.map(f => f.id));
    const pendingRequestIds = new Set(pendingRequests.map(r => r.senderId));
    
    // Check for pending sent requests
    const sentRequests = await db.collection("quest4you_friendships")
      .where("senderId", "==", currentUser.uid)
      .where("status", "==", "pending")
      .get();
    const sentRequestIds = new Set(sentRequests.docs.map(d => d.data().receiverId));
    
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const userId = doc.id;
      
      // Skip self
      if (userId === currentUser.uid) return;
      
      // Check if matches search
      const nickname = (data.nickname || '').toLowerCase();
      const email = (data.email || '').toLowerCase();
      const displayName = (data.displayName || '').toLowerCase();
      
      if (nickname.includes(query) || email.includes(query) || displayName.includes(query)) {
        let status = 'available';
        if (existingFriendIds.has(userId)) {
          status = 'friend';
        } else if (pendingRequestIds.has(userId)) {
          status = 'pending-received';
        } else if (sentRequestIds.has(userId)) {
          status = 'pending-sent';
        }
        
        results.push({
          id: userId,
          displayName: data.displayName || 'Utilizador',
          nickname: data.nickname,
          nicknameEmoji: data.nicknameEmoji || '👤',
          photo: data.photos?.public || null,
          status: status
        });
      }
    });
    
    loadingSpan.style.display = 'none';
    
    if (results.length === 0) {
      resultsDiv.innerHTML = `
        <div class="search-no-results">
          <div class="no-results-icon">🔍</div>
          <p>Nenhum utilizador encontrado para "${query}"</p>
          <p style="font-size: 0.85rem; color: var(--text-lighter);">Tenta outro termo de pesquisa</p>
        </div>
      `;
      return;
    }
    
    resultsDiv.innerHTML = results.map(user => `
      <div class="search-result-item">
        <div class="search-result-avatar">
          ${user.photo 
            ? `<img src="${user.photo}" alt="${user.displayName}">`
            : user.displayName.charAt(0).toUpperCase()
          }
        </div>
        <div class="search-result-info">
          <div class="search-result-name">${user.displayName}</div>
          ${user.nickname ? `<div class="search-result-nickname">${user.nicknameEmoji} ${user.nickname}</div>` : ''}
          <div class="search-result-status">
            ${user.status === 'friend' ? '✅ Já são amigos' : ''}
            ${user.status === 'pending-sent' ? '⏳ Pedido enviado' : ''}
            ${user.status === 'pending-received' ? '📩 Pedido recebido' : ''}
          </div>
        </div>
        <div class="search-result-action">
          ${user.status === 'available' 
            ? `<button class="btn btn-primary btn-sm" onclick="sendFriendRequest('${user.id}', '${user.displayName}')">➕ Adicionar</button>`
            : user.status === 'pending-received'
            ? `<button class="btn btn-primary btn-sm" onclick="acceptFriendRequestByUserId('${user.id}')">✅ Aceitar</button>`
            : ''
          }
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error("Error searching users:", error);
    loadingSpan.style.display = 'none';
    resultsDiv.innerHTML = `
      <div class="search-no-results">
        <div class="no-results-icon">❌</div>
        <p>Erro ao procurar utilizadores</p>
      </div>
    `;
  }
}

// Send friend request
async function sendFriendRequest(receiverId, receiverName) {
  if (!currentUser || !db) return;
  
  try {
    // Check if friendship already exists
    const existing = await db.collection("quest4you_friendships")
      .where("senderId", "==", currentUser.uid)
      .where("receiverId", "==", receiverId)
      .get();
    
    if (!existing.empty) {
      alert("⚠️ Já enviaste um pedido de amizade a este utilizador.");
      return;
    }
    
    // Create friendship request
    await db.collection("quest4you_friendships").add({
      senderId: currentUser.uid,
      senderName: userData?.displayName || currentUser.displayName || 'Utilizador',
      receiverId: receiverId,
      receiverName: receiverName,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert(`✅ Pedido de amizade enviado para ${receiverName}!`);
    
    // Refresh search results
    searchUsers();
    
  } catch (error) {
    console.error("Error sending friend request:", error);
    alert("❌ Erro ao enviar pedido de amizade.");
  }
}

// Accept friend request
async function acceptFriendRequest(requestId, senderId) {
  if (!currentUser || !db) return;
  
  try {
    // Update friendship status
    await db.collection("quest4you_friendships").doc(requestId).update({
      status: "accepted",
      acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert("✅ Pedido de amizade aceite! Agora são amigos.");
    
    // Refresh lists
    await loadPendingRequests();
    await loadFriends();
    
  } catch (error) {
    console.error("Error accepting friend request:", error);
    alert("❌ Erro ao aceitar pedido de amizade.");
  }
}

// Accept friend request by user ID (from search)
async function acceptFriendRequestByUserId(senderId) {
  const request = pendingRequests.find(r => r.senderId === senderId);
  if (request) {
    await acceptFriendRequest(request.id, senderId);
    closeAddFriendModal();
  }
}

// Reject friend request
async function rejectFriendRequest(requestId) {
  if (!currentUser || !db) return;
  
  if (!confirm("Tens a certeza que queres rejeitar este pedido de amizade?")) return;
  
  try {
    await db.collection("quest4you_friendships").doc(requestId).delete();
    
    // Remove from UI
    const element = document.getElementById(`request-${requestId}`);
    if (element) element.remove();
    
    // Update pending requests
    pendingRequests = pendingRequests.filter(r => r.id !== requestId);
    
    if (pendingRequests.length === 0) {
      document.getElementById("friendRequestsCard").style.display = 'none';
    }
    
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    alert("❌ Erro ao rejeitar pedido de amizade.");
  }
}

// Remove friend
async function removeFriend(friendId, friendshipId) {
  if (!currentUser || !db) return;
  
  if (!confirm("Tens a certeza que queres remover este amigo?")) return;
  
  try {
    await db.collection("quest4you_friendships").doc(friendshipId).delete();
    
    // Refresh friends list
    await loadFriends();
    
    alert("✅ Amigo removido.");
    
  } catch (error) {
    console.error("Error removing friend:", error);
    alert("❌ Erro ao remover amigo.");
  }
}

// View friend profile
async function viewFriendProfile(friendId) {
  const friend = friendsList.find(f => f.id === friendId);
  if (!friend) return;
  
  currentViewingFriend = friend;
  
  const modal = document.getElementById("viewFriendModal");
  const header = document.getElementById("friendProfileHeader");
  const body = document.getElementById("friendProfileBody");
  
  if (!modal || !header || !body) return;
  
  // Render header
  header.innerHTML = `
    <div class="friend-profile-avatar">
      ${friend.photos?.public 
        ? `<img src="${friend.photos.public}" alt="${friend.displayName}">`
        : (friend.displayName || '?').charAt(0).toUpperCase()
      }
    </div>
    <div class="friend-profile-name">${friend.displayName || 'Utilizador'}</div>
    <div class="friend-profile-nickname">${friend.nickname ? `${friend.nicknameEmoji || '👤'} ${friend.nickname}` : ''}</div>
  `;
  
  // Calculate stats
  const quizCount = Object.keys(friend.quizResults || {}).length;
  const badges = friend.badges || [];
  
  // Render body
  body.innerHTML = `
    <div class="friend-profile-stats">
      <div class="friend-stat">
        <div class="friend-stat-value">${quizCount}</div>
        <div class="friend-stat-label">Questionários</div>
      </div>
      <div class="friend-stat">
        <div class="friend-stat-value">${badges.length}</div>
        <div class="friend-stat-label">Badges</div>
      </div>
      <div class="friend-stat">
        <div class="friend-stat-value">
          ${friend.personalInfo?.ageRange || '?'}
        </div>
        <div class="friend-stat-label">Idade</div>
      </div>
    </div>
    
    <div class="friend-profile-info">
      ${friend.personalInfo?.country ? `
        <div class="friend-info-item">
          <span class="friend-info-label">📍 Localização</span>
          <span class="friend-info-value">${friend.personalInfo.city || ''} ${friend.personalInfo.district ? `(${friend.personalInfo.district})` : ''}</span>
        </div>
      ` : ''}
      ${friend.personalInfo?.lookingFor ? `
        <div class="friend-info-item">
          <span class="friend-info-label">💕 À procura de</span>
          <span class="friend-info-value">${getLookingForLabel(friend.personalInfo.lookingFor)}</span>
        </div>      ` : ''}
    </div>
  `;
  
  // Show send message button
  const btnSendMessage = document.getElementById("btnSendMessage");
  if (btnSendMessage) {
    btnSendMessage.style.display = "inline-flex";
  }
  
  modal.style.display = "flex";
}

// Get looking for label
function getLookingForLabel(value) {
  const labels = {
    'friendship': 'Amizade',
    'casual': 'Encontros casuais',
    'relationship': 'Relacionamento sério',
    'open-relationship': 'Relacionamento aberto',
    'exploration': 'Explorar sexualidade',
    'couple-activities': 'Atividades de casal',
    'multiple': 'Várias opções'
  };
  return labels[value] || value;
}

// Close view friend modal
function closeViewFriendModal() {
  const modal = document.getElementById("viewFriendModal");
  if (modal) {
    modal.style.display = "none";
    currentViewingFriend = null;
  }
}

// Remove friend from modal
async function removeFriendFromModal() {
  if (currentViewingFriend) {
    await removeFriend(currentViewingFriend.id, currentViewingFriend.friendshipId);
    closeViewFriendModal();
  }
}

// Send message to friend - redirect to chat
function sendMessageToFriend() {
  if (currentViewingFriend) {
    // Redirect to chat page with friend ID as parameter
    window.location.href = `chat.html?userId=${currentViewingFriend.id}`;
  }
}

// Initialize friends on profile load (add to loadUserProfile)
async function initFriendsSystem() {
  await loadFriends();
  await loadPendingRequests();
}

// Export friends functions
window.loadFriends = loadFriends;
window.loadPendingRequests = loadPendingRequests;
window.filterFriends = filterFriends;
window.openAddFriendModal = openAddFriendModal;
window.closeAddFriendModal = closeAddFriendModal;
window.searchUsersDebounced = searchUsersDebounced;
window.sendFriendRequest = sendFriendRequest;
window.acceptFriendRequest = acceptFriendRequest;
window.acceptFriendRequestByUserId = acceptFriendRequestByUserId;
window.rejectFriendRequest = rejectFriendRequest;
window.removeFriend = removeFriend;
window.viewFriendProfile = viewFriendProfile;
window.closeViewFriendModal = closeViewFriendModal;
window.removeFriendFromModal = removeFriendFromModal;
window.sendMessageToFriend = sendMessageToFriend;