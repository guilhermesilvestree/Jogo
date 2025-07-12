// =================================================================
// PAINEL DE DESENVOLVIMENTO PARA: ECO (v4.0 - Simplificado)
// Por: ECO (Especialista em Construção de Odds)
// =================================================================

(function() {
    // Variáveis de controle globais para os cheats
    window.DEV_MODE = true; // Habilita modo de desenvolvimento
    window.DEV_MODE_INVINCIBLE = false;
    window.DEV_MODE_REVEAL_MAP = false;

    // Aguarda o carregamento completo da página
    window.addEventListener('load', () => {
        if (typeof window.ecoGame === 'undefined') {
            console.error("ECO DEV: O objeto 'window.ecoGame' não foi encontrado. Verifique as edições no 'script.js'.");
            return;
        }
        console.log("ECO DEV: Painel de Desenvolvimento ativado (v4.0).");
        createDevPanel();
        initializeDevFunctions();
    });

    /**
     * Cria a estrutura HTML e o estilo do painel de desenvolvimento.
     */
    function createDevPanel() {
        const panel = document.createElement('div');
        panel.id = 'eco-dev-panel';
        panel.classList.add('minimized'); // Começa minimizado

        const styles = `
            #eco-dev-panel {
                position: fixed; top: 10px; right: 10px; background-color: rgba(10, 30, 40, 0.95);
                border: 2px solid #00ffff; border-radius: 8px; box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                color: #fff; font-family: "Montserrat", sans-serif; z-index: 1000; padding: 15px; width: 280px;
                font-size: 14px; display: flex; flex-direction: column; gap: 12px;
                transition: height 0.2s, min-height 0.2s, max-height 0.2s, padding 0.2s;
            }
            #eco-dev-panel.minimized {
                height: auto; min-height: 0; max-height: none; padding: 8px 15px 8px 15px;
                width: 220px;
            }
            #eco-dev-panel.minimized .dev-group,
            #eco-dev-panel.minimized #dev-stats,
            #eco-dev-panel.minimized #dev-refresh-stats {
                display: none !important;
            }
            #eco-dev-panel .dev-toggle-btn {
                position: absolute; top: 8px; left: 8px; background: none; border: none; color: #00ffff;
                font-size: 1.3em; cursor: pointer; z-index: 1100; padding: 0 6px; border-radius: 4px;
                transition: background 0.2s;
            }
            #eco-dev-panel .dev-toggle-btn:hover {
                background: rgba(0,255,255,0.1);
            }
            #eco-dev-panel h3 {
                margin: 0 0 10px 0; color: #00ffff; text-align: center; text-shadow: 0 0 5px #00ffff;
                border-bottom: 1px solid #00ffff44; padding-bottom: 8px;
                transition: background 0.2s, color 0.2s;
                cursor: pointer;
                user-select: none;
            }
            #eco-dev-panel h3:hover {
                background: rgba(0,255,255,0.08);
                color: #fff;
            }
            #eco-dev-panel.minimized h3 {
                margin-bottom: 0; border-bottom: none; padding-bottom: 0;
            }
            #eco-dev-panel button {
                width: 100%; padding: 8px 10px; font-weight: 600; font-size: 1em;
                border: 1px solid rgba(0, 255, 255, 0.4); color: #00ffff; background-color: rgba(0, 255, 255, 0.1);
                cursor: pointer; border-radius: 5px; transition: all 0.2s ease-in-out; text-align: center;
            }
            #eco-dev-panel button:hover {
                background-color: rgba(0, 255, 255, 0.2); border-color: #00ffff; transform: translateY(-1px);
            }
            #eco-dev-panel button.toggled {
                background-color: #00ffff; color: #0a1e28; box-shadow: 0 0 10px #00ffff;
            }
            #eco-dev-panel .dev-group {
                display: flex; flex-direction: column; gap: 8px; border-top: 1px dashed #00ffff55; padding-top: 12px;
            }
            #eco-dev-panel input[type=number] {
                width: 100%; box-sizing: border-box; background: rgba(0, 0, 0, 0.3);
                border: 1px solid #00ffff88; border-radius: 4px; color: white; padding: 6px 8px; font-size: 1em;
            }
            #eco-dev-panel .stat-display {
                background: rgba(0,0,0,0.2); border: 1px solid #00ffff33; padding: 10px; border-radius: 5px;
                font-size: 0.9em; display: flex; flex-direction: column; gap: 5px;
            }
            #eco-dev-panel .stat-display span { color: #00ffff; }
        `;

        panel.innerHTML = `
            <style>${styles}</style>
            <h3 id="eco-dev-title" title="Clique para abrir/fechar painel">Painel Hacker - ECO v4.0</h3>
            <div class="dev-group">
                <button id="dev-skip-level">Pular Nível</button>
                <button id="dev-win-game">Vencer o Jogo</button>
                <button id="dev-clear-leaderboard">Limpar Ranking</button>
                <button id="dev-force-reset">Forçar Reset (Simula Segunda)</button>
                <button id="dev-ranking-info">Info do Ranking</button>
                <button id="dev-create-mock-data">Criar Dados Mock</button>
            </div>
            <div class="dev-group">
                <button id="dev-invincible">Invencibilidade (OFF)</button>
                <button id="dev-reveal-map">Revelar Mapa (OFF)</button>
            </div>
            <div class="dev-group">
                <label for="dev-set-money-input">Setar Fragmentos (Moedas):</label>
                <input type="number" id="dev-set-money-input" placeholder="Ex: 100">
                <button id="dev-set-money-btn">Confirmar</button>
            </div>
            <div class="dev-group">
                <div id="dev-stats" class="stat-display">Carregando stats...</div>
                <button id="dev-refresh-stats">Atualizar Stats</button>
            </div>
        `;
        document.body.appendChild(panel);

        // Listener para minimizar/maximizar no título
        const title = panel.querySelector('#eco-dev-title');
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => {
            panel.classList.toggle('minimized');
        });
    }

    /**
     * Adiciona os listeners de eventos aos botões do painel.
     */
    function initializeDevFunctions() {
        document.getElementById('dev-skip-level').addEventListener('click', () => {
            if (window.ecoGame.game.level && window.ecoGame.heartOfLight) {
                window.ecoGame.heartOfLight.absorb();
            } else {
                alert("ECO DEV Error: Inicie um nível primeiro.");
            }
        });

        document.getElementById('dev-win-game').addEventListener('click', () => {
            if (window.ecoGame.game && typeof window.ecoGame.game.winGame === 'function') {
                window.ecoGame.game.winGame();
            } else {
                alert("ECO DEV Error: Não foi possível acionar a vitória.");
            }
        });

        document.getElementById('dev-clear-leaderboard').addEventListener('click', async () => {
            if (confirm("ECO DEV: Tem certeza que deseja limpar o ranking da semana atual? Esta ação não pode ser desfeita.")) {
                try {
                    if (window.ecoGame.clearLeaderboard && typeof window.ecoGame.clearLeaderboard === 'function') {
                        await window.ecoGame.clearLeaderboard();
                        alert("ECO DEV: Ranking da semana limpo com sucesso!");
                        
                        // Atualiza o localStorage para indicar que foi resetado manualmente
                        const weekStart = new Date();
                        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Segunda-feira
                        weekStart.setHours(0, 0, 0, 0);
                        localStorage.setItem('eco_lastLeaderboardReset', weekStart.getTime().toString());
                        
                        console.log("ECO DEV: Ranking limpo manualmente via painel de desenvolvimento");
                    } else {
                        alert("ECO DEV Error: Função de limpeza do ranking não encontrada.");
                    }
                } catch (error) {
                    console.error("ECO DEV Error ao limpar ranking:", error);
                    alert("ECO DEV Error: Falha ao limpar o ranking. Verifique o console para mais detalhes.");
                }
            }
        });

        document.getElementById('dev-force-reset').addEventListener('click', async () => {
            if (confirm("ECO DEV: Forçar reset do ranking (simula segunda-feira)? Esta ação limpará o ranking e atualizará o timestamp de reset.")) {
                try {
                    if (window.ecoGame.clearLeaderboard && typeof window.ecoGame.clearLeaderboard === 'function') {
                        await window.ecoGame.clearLeaderboard();
                        
                        // Força o timestamp para a semana atual (simula que é segunda-feira)
                        const now = new Date();
                        const weekStart = new Date(now);
                        weekStart.setDate(now.getDate() - now.getDay() + 1); // Segunda-feira
                        weekStart.setHours(0, 0, 0, 0);
                        localStorage.setItem('eco_lastLeaderboardReset', weekStart.getTime().toString());
                        
                        alert("ECO DEV: Reset forçado executado com sucesso! Ranking limpo e timestamp atualizado.");
                        console.log("ECO DEV: Reset forçado executado via painel de desenvolvimento");
                        
                        // Atualiza as estatísticas para mostrar as mudanças
                        updateStatsDisplay();
                    } else {
                        alert("ECO DEV Error: Função de limpeza do ranking não encontrada.");
                    }
                } catch (error) {
                    console.error("ECO DEV Error ao forçar reset:", error);
                    alert("ECO DEV Error: Falha ao forçar reset. Verifique o console para mais detalhes.");
                }
            }
        });

        document.getElementById('dev-ranking-info').addEventListener('click', () => {
            try {
                const now = new Date();
                const dayOfWeek = now.getDay();
                const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                
                let info = `=== INFORMAÇÕES DO RANKING ===\n\n`;
                info += `Data atual: ${now.toLocaleString()}\n`;
                info += `Dia da semana: ${dayNames[dayOfWeek]}\n`;
                info += `É segunda-feira: ${dayOfWeek === 1 ? 'Sim' : 'Não'}\n\n`;
                
                if (window.ecoGame.getNextResetInfo && typeof window.ecoGame.getNextResetInfo === 'function') {
                    const resetInfo = window.ecoGame.getNextResetInfo();
                    info += `Próximo reset: ${resetInfo.days} dias e ${resetInfo.hours} horas\n`;
                    info += `Data do próximo reset: ${resetInfo.nextResetDate.toLocaleString()}\n\n`;
                }
                
                const lastReset = localStorage.getItem('eco_lastLeaderboardReset');
                if (lastReset) {
                    const lastResetDate = new Date(parseInt(lastReset));
                    info += `Último reset: ${lastResetDate.toLocaleString()}\n`;
                } else {
                    info += `Último reset: Nunca\n`;
                }
                
                info += `\nTimestamp salvo: ${lastReset || 'Nenhum'}`;
                
                alert(info);
                console.log("ECO DEV: Informações do ranking exibidas");
            } catch (error) {
                console.error("ECO DEV Error ao exibir informações do ranking:", error);
                alert("ECO DEV Error: Falha ao exibir informações do ranking.");
            }
        });

        document.getElementById('dev-invincible').addEventListener('click', (e) => {
            window.DEV_MODE_INVINCIBLE = !window.DEV_MODE_INVINCIBLE;
            e.target.textContent = `Invencibilidade (${window.DEV_MODE_INVINCIBLE ? 'ON' : 'OFF'})`;
            e.target.classList.toggle('toggled', window.DEV_MODE_INVINCIBLE);
        });

        document.getElementById('dev-reveal-map').addEventListener('click', (e) => {
            window.DEV_MODE_REVEAL_MAP = !window.DEV_MODE_REVEAL_MAP;
            e.target.textContent = `Revelar Mapa (${window.DEV_MODE_REVEAL_MAP ? 'ON' : 'OFF'})`;
            e.target.classList.toggle('toggled', window.DEV_MODE_REVEAL_MAP);
        });

        document.getElementById('dev-set-money-btn').addEventListener('click', () => {
            const input = document.getElementById('dev-set-money-input');
            const amount = parseInt(input.value, 10);
            if (!isNaN(amount)) {
                window.ecoGame.setTotalCoins(amount);
                input.value = '';
                updateStatsDisplay();
            }
        });

        document.getElementById('dev-refresh-stats').addEventListener('click', updateStatsDisplay);
        
        document.getElementById('dev-create-mock-data').addEventListener('click', async () => {
            if (confirm("ECO DEV: Criar 10 scores mockados no ranking para testes? Esta ação substituirá os dados existentes.")) {
                try {
                    if (window.ecoGame.createMockData && typeof window.ecoGame.createMockData === 'function') {
                        await window.ecoGame.createMockData();
                        console.log("ECO DEV: Dados mockados criados via painel de desenvolvimento");
                    } else {
                        alert("ECO DEV Error: Função de criação de dados mock não encontrada.");
                    }
                } catch (error) {
                    console.error("ECO DEV Error ao criar dados mock:", error);
                    alert("ECO DEV Error: Falha ao criar dados mock. Verifique o console para mais detalhes.");
                }
            }
        });
        
        updateStatsDisplay();
        setInterval(updateStatsDisplay, 2000);
    }

    /**
     * Atualiza o painel de estatísticas com informações do save atual.
     */
    function updateStatsDisplay() {
        const statsDiv = document.getElementById('dev-stats');
        const { currentSlotId, game, totalCoins, isPremiumUnlocked } = window.ecoGame;

        if (currentSlotId === null) {
            statsDiv.innerHTML = "Nenhum save carregado.";
            return;
        }
        try {
            const levelName = game.level ? game.level.name : "Menu Principal";
            const metadataStr = localStorage.getItem(`eco_save_${currentSlotId}_metadata`);
            const metadata = metadataStr ? JSON.parse(metadataStr) : {};
            const saveName = metadata.saveName || `Jogo ${currentSlotId}`;

            // Informações do ranking
            let rankingInfo = "Ranking: Não disponível";
            if (window.ecoGame.getNextResetInfo && typeof window.ecoGame.getNextResetInfo === 'function') {
                try {
                    const resetInfo = window.ecoGame.getNextResetInfo();
                    const lastReset = localStorage.getItem('eco_lastLeaderboardReset');
                    const lastResetDate = lastReset ? new Date(parseInt(lastReset)).toLocaleDateString() : "Nunca";
                    
                    rankingInfo = `Ranking: ${resetInfo.days}d ${resetInfo.hours}h até reset<br>
                    <strong>Último reset:</strong> <span>${lastResetDate}</span>`;
                } catch (e) {
                    rankingInfo = "Ranking: Erro ao carregar";
                }
            }

            statsDiv.innerHTML = `
                <strong>Save Ativo:</strong> <span>${saveName}</span><br>
                <strong>Slot ID:</strong> <span>${currentSlotId}</span><br>
                <strong>Local:</strong> <span>${levelName}</span><br>
                <strong>Fragmentos:</strong> <span>${totalCoins}</span><br>
                <strong>Premium:</strong> <span>${isPremiumUnlocked ? 'Sim' : 'Não'}</span><br>
                <strong>${rankingInfo}</strong>
            `;
        } catch (e) {
            statsDiv.innerHTML = "Aguardando dados do jogo...";
        }
    }

})();