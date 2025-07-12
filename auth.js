// auth.js
import { auth, db, signInAnonymously, collection, addDoc, getDocs, query, orderBy, limit, where, updateDoc, doc, deleteDoc, writeBatch } from './firebase.js';

const namePromptOverlay = document.getElementById('name-prompt-overlay');
const nameInput = document.getElementById('player-name-input');
const confirmNameButton = document.getElementById('confirm-player-name-button');
const leaderboardDisplay = document.getElementById('leaderboard-display');
const leaderboardButton = document.getElementById('leaderboard-button');
const mainMenu = document.getElementById('main-menu');
const loaderContainer = leaderboardDisplay.querySelector('.loader-container');
const podiumAndListContainer = document.getElementById('podium-and-list-container');

/**
 * Obtém o timestamp do início da semana atual (segunda-feira às 00:00)
 * @returns {number} Timestamp do início da semana
 */
function getWeekStartTimestamp() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Dias até segunda-feira
    
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);
    
    return monday.getTime();
}

/**
 * Obtém o timestamp do início da próxima semana (próxima segunda-feira às 00:00)
 * @returns {number} Timestamp do início da próxima semana
 */
function getNextWeekStartTimestamp() {
    const weekStart = getWeekStartTimestamp();
    return weekStart + (7 * 24 * 60 * 60 * 1000); // Adiciona 7 dias
}

/**
 * Verifica se é segunda-feira e se o ranking precisa ser resetado
 * @returns {boolean} True se é segunda-feira e o ranking deve ser resetado
 */
function shouldResetLeaderboard() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    return dayOfWeek === 1; // Segunda-feira
}

/**
 * Limpa o ranking antigo (da semana anterior)
 */
async function clearOldLeaderboard() {
    try {
        const leaderboardRef = collection(db, "leaderboard");
        const querySnapshot = await getDocs(leaderboardRef);
        
        if (!querySnapshot.empty) {
            const batch = writeBatch(db);
            querySnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log("Ranking antigo limpo com sucesso!");
        }
    } catch (error) {
        console.error("Erro ao limpar ranking antigo:", error);
    }
}

/**
 * Verifica e executa o reset do ranking se necessário
 */
async function checkAndResetLeaderboard() {
    if (shouldResetLeaderboard()) {
        const lastResetTime = localStorage.getItem('eco_lastLeaderboardReset');
        const weekStart = getWeekStartTimestamp();
        
        // Verifica se já foi resetado esta semana
        if (!lastResetTime || parseInt(lastResetTime) < weekStart) {
            console.log("Resetando ranking para nova semana...");
            await clearOldLeaderboard();
            localStorage.setItem('eco_lastLeaderboardReset', weekStart.toString());
        }
    }
}

/**
 * Obtém informações sobre o próximo reset do ranking
 * @returns {Object} Informações sobre o próximo reset
 */
function getNextResetInfo() {
    const now = new Date();
    const nextWeekStart = getNextWeekStartTimestamp();
    const timeUntilReset = nextWeekStart - now.getTime();
    
    const days = Math.floor(timeUntilReset / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeUntilReset % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    return {
        days,
        hours,
        nextResetDate: new Date(nextWeekStart)
    };
}

/**
 * Função de debug para testar o reset do ranking (apenas em desenvolvimento)
 */
function debugResetLeaderboard() {
    if (window.DEV_MODE) {
        console.log("=== DEBUG: Informações do Reset do Ranking ===");
        console.log("Data atual:", new Date().toLocaleString());
        console.log("Dia da semana:", new Date().getDay());
        console.log("É segunda-feira?", shouldResetLeaderboard());
        console.log("Início da semana atual:", new Date(getWeekStartTimestamp()).toLocaleString());
        console.log("Próximo reset:", new Date(getNextWeekStartTimestamp()).toLocaleString());
        console.log("Informações do próximo reset:", getNextResetInfo());
        console.log("Último reset salvo:", localStorage.getItem('eco_lastLeaderboardReset'));
        console.log("=============================================");
    }
}

function updateNextResetTime() {
    const resetInfo = getNextResetInfo();
    const timeElement = document.getElementById('next-reset-time');
    if (timeElement) {
        timeElement.textContent = `${resetInfo.days}d ${resetInfo.hours}h`;
    }
}

/**
 * Checks for player name on startup. If not found, shows the prompt.
 * Otherwise, proceeds with anonymous login.
 */
function checkPlayerName() {
    const playerName = localStorage.getItem('eco_playerName');
    if (!playerName) {
        namePromptOverlay.classList.add('visible');
        nameInput.focus();
    } else {
        login();
    }
}

/**
 * Handles the confirmation of the player's name, saves it,
 * and proceeds with the login.
 */
function confirmName() {
    const playerName = nameInput.value.trim();
    if (playerName && playerName.length > 0 && playerName.length <= 10) {
        localStorage.setItem('eco_playerName', playerName);
        namePromptOverlay.classList.remove('visible');
        login();
    } else {
        alert('O nome deve ter entre 1 e 10 caracteres.');
        nameInput.focus();
    }
}

/**
 * Performs anonymous login with Firebase.
 */
async function login() {
    try {
        const userCredential = await signInAnonymously(auth);
        console.log("Usuário conectado anonimamente:", userCredential.user.uid);
    } catch (error) {
        console.error("Falha no login anônimo:", error);
    }
}

/**
 * Saves the player's score to the leaderboard if it's a top-10 time
 * AND it's their personal best.
 * @param {number} time - The time in seconds.
 */
async function saveScore(time) {
    const playerName = localStorage.getItem('eco_playerName');
    const user = auth.currentUser;

    if (!playerName || !user) {
        console.error("Nome do jogador ou usuário não encontrado. A pontuação não foi salva.");
        return;
    }

    // Verifica e reseta o ranking se necessário
    await checkAndResetLeaderboard();

    const userId = user.uid;
    const leaderboardRef = collection(db, "leaderboard");
    const weekStart = getWeekStartTimestamp();

    try {
        // 1. Verificar se a pontuação qualifica para o Top 10 da semana atual
        const leaderboardQuery = query(leaderboardRef, orderBy("time"), limit(10));
        const leaderboardSnapshot = await getDocs(leaderboardQuery);

        let qualifies = false;
        if (leaderboardSnapshot.docs.length < 10) {
            qualifies = true; // Qualifica se o ranking não estiver cheio
        } else {
            const worstTop10Time = leaderboardSnapshot.docs[leaderboardSnapshot.docs.length - 1].data().time;
            if (time < worstTop10Time) {
                qualifies = true; // Qualifica se for melhor que o 10º lugar
            }
        }

        if (!qualifies) {
            console.log("A pontuação não foi boa o suficiente para entrar no Top 10 da semana.");
            return; // Encerra a função se não for um tempo do Top 10
        }

        // 2. Se qualificar, verificar se é o recorde pessoal do jogador na semana atual
        const userScoreQuery = query(leaderboardRef, where("userId", "==", userId));
        const userScoreSnapshot = await getDocs(userScoreQuery);

        if (userScoreSnapshot.empty) {
            // Se o jogador não tem pontuação na semana, adiciona a nova
            await addDoc(leaderboardRef, {
                userId: userId,
                name: playerName,
                time: time,
                createdAt: new Date(),
                weekStart: weekStart // Adiciona timestamp da semana
            });
            console.log("Nova pontuação salva com sucesso no ranking da semana!");
            
            // Envia webhook para entrada no top 10
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            const embed = {
                title: '🏆 NOVO JOGADOR NO TOP 10!',
                description: `Um jogador entrou no ranking semanal!`,
                color: 0xffd700,
                fields: [
                    { name: 'Nome do Jogador', value: playerName, inline: true },
                    { name: 'Tempo', value: timeString, inline: true },
                    { name: 'Data', value: new Date().toLocaleString('pt-BR'), inline: false }
                ],
                timestamp: new Date().toISOString(),
                footer: { text: 'ECO - Sistema de Logs' }
            };
            
            // Envia o webhook
            fetch('https://discord.com/api/webhooks/1393437919120986235/LKW8yaMuz94YdpNHJ0er1qyeTKMpGuzYZbhT5QA-9sGrjV7SM1ZkWYPAcYEroEbhE3mr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            }).catch(console.error);
            
        } else {
            // Se o jogador já tem pontuação, verifica se a nova é melhor
            const userDoc = userScoreSnapshot.docs[0];
            const existingTime = userDoc.data().time;

            if (time < existingTime) {
                // Se o novo tempo for melhor, atualiza o documento existente
                const docRef = doc(db, "leaderboard", userDoc.id);
                await updateDoc(docRef, {
                    time: time,
                    createdAt: new Date(),
                    name: playerName,
                    weekStart: weekStart // Atualiza timestamp da semana
                });
                console.log("Pontuação recorde da semana atualizada com sucesso!");
                
                // Envia webhook para melhoria de recorde
                const minutes = Math.floor(time / 60);
                const seconds = time % 60;
                const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                const oldMinutes = Math.floor(existingTime / 60);
                const oldSeconds = existingTime % 60;
                const oldTimeString = `${oldMinutes.toString().padStart(2, '0')}:${oldSeconds.toString().padStart(2, '0')}`;
                
                const embed = {
                    title: '⚡ RECORDE PESSOAL BATIDO!',
                    description: `Um jogador melhorou seu tempo no ranking!`,
                    color: 0x00ff00,
                    fields: [
                        { name: 'Nome do Jogador', value: playerName, inline: true },
                        { name: 'Novo Tempo', value: timeString, inline: true },
                        { name: 'Tempo Anterior', value: oldTimeString, inline: true },
                        { name: 'Melhoria', value: `${existingTime - time}s`, inline: true },
                        { name: 'Data', value: new Date().toLocaleString('pt-BR'), inline: false }
                    ],
                    timestamp: new Date().toISOString(),
                    footer: { text: 'ECO - Sistema de Logs' }
                };
                
                // Envia o webhook
                fetch('https://discord.com/api/webhooks/1393437919120986235/LKW8yaMuz94YdpNHJ0er1qyeTKMpGuzYZbhT5QA-9sGrjV7SM1ZkWYPAcYEroEbhE3mr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ embeds: [embed] })
                }).catch(console.error);
                
            } else {
                console.log("A nova pontuação não é melhor que o recorde pessoal anterior da semana. Nada foi salvo.");
            }
        }
    } catch (e) {
        console.error("Erro ao salvar ou atualizar pontuação: ", e);
    }
}


/**
 * Fetches and displays the top 10 scores from the leaderboard.
 */
async function showLeaderboard() {
    mainMenu.classList.remove('visible');
    leaderboardDisplay.classList.add('visible');

    // Verifica e reseta o ranking se necessário
    await checkAndResetLeaderboard();

    // Mostrar o loader e esconder o conteúdo
    loaderContainer.style.display = 'flex';
    podiumAndListContainer.style.display = 'none';

    // Elementos do pódio e da lista
    const podium1 = document.querySelector('.podium-place.rank-1');
    const podium2 = document.querySelector('.podium-place.rank-2');
    const podium3 = document.querySelector('.podium-place.rank-3');
    const othersList = document.getElementById('leaderboard-others-list');

    // Limpar conteúdo anterior
    podium1.innerHTML = '';
    podium2.innerHTML = '';
    podium3.innerHTML = '';
    othersList.innerHTML = '';
    
    // Esconder o botão ver mais/menos inicialmente
    const verMaisBtn = document.getElementById('ver-mais-ranking-btn');
    if (verMaisBtn) verMaisBtn.style.display = 'none';

    // Remover informações de reset anteriores
    const leaderboardContainer = leaderboardDisplay.querySelector('.leaderboard-container');
    // Remove todos os <p> que contenham 'Próximo reset' no texto
    Array.from(leaderboardContainer.querySelectorAll('p')).forEach(p => {
        if (p.textContent.includes('Próximo reset')) p.remove();
    });

    try {
        const q = query(collection(db, "leaderboard"), orderBy("time"), limit(10));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Placeholders para o pódio
            const podiumPlaceholders = [
                { label: 'Primeiro Lugar', class: 'rank-1' },
                { label: 'Segundo Lugar', class: 'rank-2' },
                { label: 'Terceiro Lugar', class: 'rank-3' }
            ];
            const podiumEls = [podium1, podium2, podium3];
            podiumPlaceholders.forEach((ph, idx) => {
                podiumEls[idx].innerHTML = `
                    <span class="rank-icon"><i class='fa-solid fa-medal' style='opacity:0.4;'></i></span>
                    <span class="player-name" style="opacity:0.5; filter: blur(0.5px);">${ph.label}</span>
                    <span class="player-time" style="opacity:0.4; filter: blur(1px);">--:--</span>
                `;
            });
            // Placeholders para os demais lugares (4º ao 10º)
            const placeNames = ['Quarto Lugar', 'Quinto Lugar', 'Sexto Lugar', 'Sétimo Lugar', 'Oitavo Lugar', 'Nono Lugar', 'Décimo Lugar'];
            othersList.innerHTML = '';
            for (let i = 0; i < placeNames.length; i++) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="rank-info">
                        <span class="rank" style="opacity:0.4;">#${i+4}</span>
                        <span class="name" style="opacity:0.5; filter: blur(0.5px);">${placeNames[i]}</span>
                    </div>
                    <span class="time" style="opacity:0.4; filter: blur(1px);">--:--</span>
                `;
                li.style.opacity = '0.7';
                li.style.filter = 'blur(0.1px)';
                li.style.pointerEvents = 'none';
                othersList.appendChild(li);
            }
            const resetInfo = getNextResetInfo();
            loaderContainer.innerHTML = `
                <p>O vazio ainda não registrou ecos esta semana. Seja o primeiro.</p>
                <p style="font-size: 0.8em; margin-top: 10px; opacity: 0.7;">
                    Próximo reset: ${resetInfo.days}d ${resetInfo.hours}h
                </p>
            `;
            // Mostra o pódio mesmo vazio
            loaderContainer.style.display = 'none';
            podiumAndListContainer.style.display = 'block';

            return;
        }

        // Ícone FontAwesome de medalha para o pódio
        const medalIcon = '<i class="fa-solid fa-medal"></i>';

        let rank = 1;
        const others = [];
        const scores = [];
        
        // Coletar todos os scores primeiro
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            scores.push({
                name: data.name,
                time: data.time,
                rank: rank
            });
            rank++;
        });

        // Preencher o pódio com dados reais ou placeholders
        const podiumPlaceholders = [
            { label: 'Primeiro Lugar', class: 'rank-1' },
            { label: 'Segundo Lugar', class: 'rank-2' },
            { label: 'Terceiro Lugar', class: 'rank-3' }
        ];
        const podiumEls = [podium1, podium2, podium3];
        
        for (let i = 0; i < 3; i++) {
            const score = scores.find(s => s.rank === i + 1);
            if (score) {
                const minutes = Math.floor(score.time / 60);
                const seconds = score.time % 60;
                const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                podiumEls[i].innerHTML = `
                    <span class="rank-icon">${medalIcon}</span>
                    <span class="player-name">${score.name}</span>
                    <span class="player-time">${timeString}</span>
                `;
            } else {
                // Manter placeholder para posição vazia
                podiumEls[i].innerHTML = `
                    <span class="rank-icon"><i class='fa-solid fa-medal' style='opacity:0.4;'></i></span>
                    <span class="player-name" style="opacity:0.5; filter: blur(0.5px);">${podiumPlaceholders[i].label}</span>
                    <span class="player-time" style="opacity:0.4; filter: blur(1px);">--:--</span>
                `;
            }
        }

        // Processar scores para a lista (posições 4-10)
        scores.forEach((score) => {
            if (score.rank > 3) {
                const minutes = Math.floor(score.time / 60);
                const seconds = score.time % 60;
                const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                const listHTML = `
                    <div class="rank-info">
                        <span class="rank">#${score.rank}</span> 
                        <span class="name">${score.name}</span>
                    </div>
                    <span class="time">${timeString}</span>
                `;
                others.push({ html: listHTML, rank: score.rank });
            }
        });

        // Função para renderizar a lista com placeholders
        function renderOthersList() {
            othersList.innerHTML = '';
            const maxToShow = 7; // Sempre mostrar todas as 7 posições (4-10)
            
            for (let i = 0; i < maxToShow; i++) {
                const li = document.createElement('li');
                const actualRank = i + 4;
                const score = others.find(s => s.rank === actualRank);
                
                if (score) {
                    li.innerHTML = score.html;
                    li.style.opacity = '1';
                    li.style.filter = 'none';
                    li.style.pointerEvents = 'auto';
                } else {
                    // Placeholder para posição vazia
                    const placeNames = ['Quarto Lugar', 'Quinto Lugar', 'Sexto Lugar', 'Sétimo Lugar', 'Oitavo Lugar', 'Nono Lugar', 'Décimo Lugar'];
                    li.innerHTML = `
                        <div class="rank-info">
                            <span class="rank" style="opacity:0.4;">#${actualRank}</span>
                            <span class="name" style="opacity:0.5; filter: blur(0.5px);">${placeNames[i]}</span>
                        </div>
                        <span class="time" style="opacity:0.4; filter: blur(1px);">--:--</span>
                    `;
                    li.style.opacity = '0.7';
                    li.style.filter = 'blur(0.1px)';
                    li.style.pointerEvents = 'none';
                }
                
                li.style.setProperty('--item-index', i);
                othersList.appendChild(li);
            }
        }

        // Renderizar a lista sempre com todas as posições
        renderOthersList();
        
        // Esconder o botão ver mais/menos
        const verMaisBtn = document.getElementById('ver-mais-ranking-btn');
        if (verMaisBtn) verMaisBtn.style.display = 'none';



    } catch (e) {
        console.error("Erro ao buscar o ranking: ", e);
        loaderContainer.innerHTML = '<p>Falha ao contatar os ecos distantes.</p>';
    } finally {
        // Esconder o loader e mostrar o conteúdo
        loaderContainer.style.display = 'none';
        podiumAndListContainer.style.display = 'block';
        
        // Atualizar o tempo do próximo reset no HTML
        updateNextResetTime();
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    // Verifica e reseta o ranking se necessário ao carregar a página
    await checkAndResetLeaderboard();
    checkPlayerName();
    
    // Atualizar o tempo do próximo reset
    updateNextResetTime();
    
    // Debug do reset do ranking (apenas em desenvolvimento)
    debugResetLeaderboard();
});
confirmNameButton.addEventListener('click', confirmName);
nameInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        confirmName();
    }
});

leaderboardButton.addEventListener('click', showLeaderboard);

leaderboardDisplay.querySelector('.back-button').addEventListener('click', () => {
    leaderboardDisplay.classList.remove('visible');
    mainMenu.classList.add('visible');
});

// Exportar funções para uso em outros arquivos
export { saveScore, checkAndResetLeaderboard, getNextResetInfo, clearOldLeaderboard };

// Make saveScore globally accessible for script.js
window.ecoGame = window.ecoGame || {};
window.ecoGame.saveScore = saveScore;
window.ecoGame.clearLeaderboard = clearOldLeaderboard;
window.ecoGame.getNextResetInfo = getNextResetInfo;

/**
 * Função para criar dados mockados no ranking para testes
 * Gera 10 scores com nomes e tempos variados
 */
async function createMockLeaderboardData() {
    try {
        // Limpar dados existentes primeiro
        await clearOldLeaderboard();
        
        const mockNames = [
            'EcoMaster',
            'SilentRunner',
            'DarkPulse',
            'ShadowEcho',
            'VoidWalker',
            'StealthPro',
            'NightCrawler',
            'PhantomEcho',
            'VoidRunner',
            'EchoHunter'
        ];
        
        // Gerar tempos variados entre 2-15 minutos
        const mockTimes = [
            125,   // 2:05
            187,   // 3:07
            234,   // 3:54
            298,   // 4:58
            356,   // 5:56
            423,   // 7:03
            487,   // 8:07
            534,   // 8:54
            598,   // 9:58
            645    // 10:45
        ];
        
        console.log('ECO DEV: Criando dados mockados no ranking...');
        
        // Criar os 10 scores
        for (let i = 0; i < 10; i++) {
            const scoreData = {
                name: mockNames[i],
                time: mockTimes[i],
                timestamp: Date.now() - (i * 60000) // Timestamps diferentes para cada score
            };
            
            await addDoc(collection(db, "leaderboard"), scoreData);
            console.log(`ECO DEV: Score criado - ${scoreData.name}: ${Math.floor(scoreData.time/60)}:${(scoreData.time%60).toString().padStart(2,'0')}`);
        }
        
        console.log('ECO DEV: Dados mockados criados com sucesso!');
        alert('ECO DEV: 10 scores mockados criados no ranking!');
        
    } catch (error) {
        console.error('ECO DEV: Erro ao criar dados mockados:', error);
        alert('ECO DEV: Erro ao criar dados mockados: ' + error.message);
    }
}

// Adicionar a função ao objeto global para acesso via console
window.ecoGame.createMockData = createMockLeaderboardData;