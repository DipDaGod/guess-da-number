/*              Da Script :3               */


// Game engine — pure logic, no DOM. Do not touch when extending the UI.

    const humanFavorites = {3:2.5,7:5,13:3,21:2.5,23:2.5,27:2,37:3,42:5,50:2.5,69:5,73:3,77:3,99:2}; //fav numbers for humans

    const DIFFICULTIES = { easy:{name:"Easy",maxNumber:50,maxRounds:12,strategy:"easy"}, medium:{name:"Medium",maxNumber:100,maxRounds:10,strategy:"binary"}, hard:{name:"Hard",maxNumber:100,maxRounds:9,strategy:"human"}, expert:{name:"Expert",maxNumber:100,maxRounds:7,strategy:"expert"} };
    let currentDifficulty = null, maxNumber = 100, maxRounds = 10, roundNumber = 1, computerSecret = null, gameOver = false, playerLow = 1, playerHigh = 100, playerGuesses = [], aiLow = 1, aiHigh = 100, aiGuess = null, aiGuesses = [], lockedPlayerNumber = null, isPlayerNumberLocked = false;
    function randomInt(min,max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function startGame(key) { const difficulty = DIFFICULTIES[key]; if (!difficulty) return {success:false,message:"Invalid difficulty."}; currentDifficulty=difficulty; maxNumber=difficulty.maxNumber; maxRounds=difficulty.maxRounds; computerSecret=randomInt(1,maxNumber); roundNumber=1; gameOver=false; playerLow=1; playerHigh=maxNumber; playerGuesses=[]; aiLow=1; aiHigh=maxNumber; aiGuess=null; aiGuesses=[]; lockedPlayerNumber=null; isPlayerNumberLocked=false; return {success:true,difficulty:difficulty.name,maxNumber,maxRounds}; }
    function lockPlayerNumber(value) { if (!currentDifficulty) return {success:false,message:"Start the game first."}; if (isPlayerNumberLocked) return {success:false,message:"Your number is already locked."}; const number=Number(value); if (!Number.isInteger(number) || number<1 || number>maxNumber) return {success:false,message:`Choose a number between 1 and ${maxNumber}.`}; lockedPlayerNumber=number; isPlayerNumberLocked=true; return {success:true,message:"Your secret number has been locked."}; }
    function makePlayerGuess(value) { if (gameOver) return {valid:false,message:"The game is already over."}; if (!isPlayerNumberLocked) return {valid:false,message:"Lock your number first."}; const guess=Number(value); if (!Number.isInteger(guess) || guess<1 || guess>maxNumber) return {valid:false,message:`Guess between 1 and ${maxNumber}.`}; playerGuesses.push(guess); if (guess===computerSecret) { gameOver=true; return {valid:true,correct:true,winner:"player",guess,rounds:roundNumber}; } if (guess<computerSecret) { playerLow=Math.max(playerLow,guess+1); return {valid:true,correct:false,direction:"higher",low:playerLow,high:playerHigh}; } playerHigh=Math.min(playerHigh,guess-1); return {valid:true,correct:false,direction:"lower",low:playerLow,high:playerHigh}; }
    function easyAi() { return randomInt(aiLow,aiHigh); }
    function binaryAi() { return Math.floor((aiLow+aiHigh)/2); }
    function getHumanScore(number) { let score=humanFavorites[number] || 1; if(number%2!==0) score*=1.15; if(number%5===0) score*=1.4; if(number>=11 && number<=99 && number%11===0) score*=1.5; return score; }
    function humanAi() { let best=aiLow,bestScore=-Infinity,total=aiHigh-aiLow+1; for(let number=aiLow;number<=aiHigh;number++){const lower=number-aiLow,higher=aiHigh-number,balance=1-Math.max(lower,higher)/total,score=3*balance+getHumanScore(number);if(score>bestScore){bestScore=score;best=number;}} return best; }
    function expertAi() { let best=aiLow,bestScore=-Infinity,total=aiHigh-aiLow+1; for(let number=aiLow;number<=aiHigh;number++){const lower=number-aiLow,higher=aiHigh-number,score=8*(1-Math.max(lower,higher)/total)+getHumanScore(number);if(score>bestScore){bestScore=score;best=number;}} return best; }
    function makeAiGuess() { if (gameOver) return {success:false,message:"The game is already over."}; if (!isPlayerNumberLocked) return {success:false,message:"Player number is not locked."}; if (aiLow>aiHigh) return {success:false,message:"No possible numbers remain."}; switch(currentDifficulty.strategy){case"easy":aiGuess=easyAi();break;case"human":aiGuess=humanAi();break;case"expert":aiGuess=expertAi();break;case"binary":default:aiGuess=binaryAi();} aiGuesses.push(aiGuess); return {success:true,guess:aiGuess,low:aiLow,high:aiHigh,remaining:aiHigh-aiLow+1}; }
    function validatePlayerFeedback(guess,feedback) { if (!isPlayerNumberLocked) return {valid:false}; const expected=guess<lockedPlayerNumber?"higher":guess>lockedPlayerNumber?"lower":"correct"; return {valid:feedback===expected}; }
    function giveAiFeedback(feedback) { if(gameOver) return {valid:false,message:"The game is already over."}; if(aiGuess===null) return {valid:false,message:"AI has not guessed yet."}; feedback=feedback.toLowerCase(); if(!["higher","lower","correct"].includes(feedback)) return {valid:false,message:"Invalid feedback."}; if(!validatePlayerFeedback(aiGuess,feedback).valid) return {valid:false,dishonest:true,message:"That answer does not match your locked number."}; if(feedback==="correct"){gameOver=true;return {valid:true,correct:true,winner:"ai",guess:aiGuess,rounds:roundNumber};} if(feedback==="higher") aiLow=Math.max(aiLow,aiGuess+1); else aiHigh=Math.min(aiHigh,aiGuess-1); if(aiLow>aiHigh) return {valid:false,contradiction:true,message:"Invalid AI range."}; return {valid:true,correct:false,direction:feedback,low:aiLow,high:aiHigh,remaining:aiHigh-aiLow+1}; }
    function nextRound() { if(gameOver) return {success:false,message:"Game is over."}; roundNumber++; if(roundNumber>maxRounds){gameOver=true;return {success:false,draw:true,message:"Maximum rounds reached."};} aiGuess=null; return {success:true,round:roundNumber,roundsLeft:maxRounds-roundNumber+1}; }
    function getGameState() { return {difficulty:currentDifficulty?currentDifficulty.name:null,round:roundNumber,maxRounds,maxNumber,gameOver,numberLocked:isPlayerNumberLocked,player:{low:playerLow,high:playerHigh,guesses:[...playerGuesses]},ai:{low:aiLow,high:aiHigh,remaining:Math.max(0,aiHigh-aiLow+1),lastGuess:aiGuess,guesses:[...aiGuesses]}}; }

    // DOM helpers & cached element lists
    const $ = (selector) => document.querySelector(selector);
    const feedbackButtons = [...document.querySelectorAll("[data-feedback]")];
    const difficultyButtons = [...document.querySelectorAll("[data-difficulty]")];

    // Sound system
    let audioCtx = null;
    let soundEnabled = true;
    function getAudioCtx() { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
    function playTone(freq, { type = "sine", duration = 0.15, startGain = 0.2, delay = 0 } = {}) {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx(), now = ctx.currentTime + delay;
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(startGain, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + duration + 0.03);
      } catch (error) { /* Web Audio unavailable — fail silently */ }
    }
    function playClickSound() { playTone(700, { type:"square", duration:.055, startGain:.09 }); }
    function playGuessSound() { playTone(480, { type:"triangle", duration:.12, startGain:.15 }); playTone(660, { type:"triangle", duration:.12, startGain:.11, delay:.05 }); }
    function playWinSound() { [523,659,784,1046].forEach((freq,i) => playTone(freq, { type:"triangle", duration:.22, startGain:.15, delay:i*.09 })); }
    function playLoseSound() { [392,330,262].forEach((freq,i) => playTone(freq, { type:"sawtooth", duration:.28, startGain:.13, delay:i*.12 })); }
    function playLockSound() {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioCtx(), now = ctx.currentTime;
        const thunk = ctx.createOscillator(), thunkGain = ctx.createGain();
        thunk.type = "sine"; thunk.frequency.setValueAtTime(320, now); thunk.frequency.exponentialRampToValueAtTime(110, now + 0.13);
        thunkGain.gain.setValueAtTime(0.0001, now); thunkGain.gain.exponentialRampToValueAtTime(0.3, now + 0.01); thunkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        thunk.connect(thunkGain).connect(ctx.destination); thunk.start(now); thunk.stop(now + 0.2);
        const click = ctx.createOscillator(), clickGain = ctx.createGain();
        click.type = "square"; click.frequency.setValueAtTime(950, now + 0.11);
        clickGain.gain.setValueAtTime(0.0001, now + 0.11); clickGain.gain.exponentialRampToValueAtTime(0.13, now + 0.12); clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);
        click.connect(clickGain).connect(ctx.destination); click.start(now + 0.11); click.stop(now + 0.2);
      } catch (error) { /* Web Audio unavailable — fail silently */ }
    }
    function setSoundEnabled(enabled) {
      soundEnabled = enabled;
      $("#mute-toggle").textContent = enabled ? "🔊" : "🔇";
      $("#mute-toggle").setAttribute("aria-label", enabled ? "Mute sounds" : "Unmute sounds");
    }

    // Theme system + circular wipe transition (defaults to OS preference, saved to localStorage)
    let currentTheme = "dark";
    function setTheme(theme) {
      currentTheme = theme;
      document.documentElement.dataset.theme = theme === "light" ? "light" : "";
      $("#theme-toggle").textContent = theme === "light" ? "☀️" : "🌙";
      $("#theme-toggle").setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
    const THEME_BG = { dark:"#070916", light:"#f4f6fc" };
    const THEME_STORAGE_KEY = "guess-protocol-theme";
    function getSavedTheme() { try { return localStorage.getItem(THEME_STORAGE_KEY); } catch (error) { return null; } }
    function saveTheme(theme) { try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (error) { /* storage unavailable */ } }
    let themeTransitionRunning = false;
    function playThemeTransition(originEl, nextTheme) {
      if (themeTransitionRunning) return;
      themeTransitionRunning = true;
      const overlay = $("#theme-transition");
      const rect = originEl.getBoundingClientRect();
      const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
      const corners = [[0,0],[window.innerWidth,0],[0,window.innerHeight],[window.innerWidth,window.innerHeight]];
      const radius = Math.ceil(Math.max(...corners.map(([cx,cy]) => Math.hypot(cx - x, cy - y))));
      overlay.style.background = THEME_BG[nextTheme];
      overlay.style.transition = "none";
      overlay.style.opacity = "1";
      overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      void overlay.offsetWidth;
      overlay.style.transition = "clip-path .55s cubic-bezier(.65,0,.35,1)";
      overlay.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;
      overlay.addEventListener("transitionend", function onExpand() {
        overlay.removeEventListener("transitionend", onExpand);
        setTheme(nextTheme);
        saveTheme(nextTheme);
        requestAnimationFrame(() => {
          overlay.style.transition = "clip-path .55s cubic-bezier(.65,0,.35,1)";
          overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
          overlay.addEventListener("transitionend", function onContract() {
            overlay.removeEventListener("transitionend", onContract);
            overlay.style.opacity = "0";
            themeTransitionRunning = false;
          }, { once:true });
        });
      }, { once:true });
    }
    function initTheme() {
      const saved = getSavedTheme();
      if (saved === "dark" || saved === "light") { setTheme(saved); return; }
      const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
      setTheme(prefersLight ? "light" : "dark");
    }

    // Sliding pill for the difficulty selector
    function moveDifficultyPill(button, animate = true) {
      const pill = $("#difficulty-pill"), group = $("#difficulty-group");
      if (!button || !pill || !group) return;
      const groupRect = group.getBoundingClientRect(), buttonRect = button.getBoundingClientRect();
      pill.style.transition = animate ? "transform .38s cubic-bezier(.2,.8,.2,1),width .38s cubic-bezier(.2,.8,.2,1)" : "none";
      pill.style.width = `${buttonRect.width}px`;
      pill.style.transform = `translateX(${buttonRect.left - groupRect.left}px)`;
    }
    window.addEventListener("resize", () => moveDifficultyPill($(".difficulty button.active"), false));

    // Difficulty descriptions — explains exactly what changes per tier
    const DIFFICULTY_DETAILS = {
      easy: "Numbers 1–50, 12 rounds. The AI guesses almost at random within what it's learned — you have a big edge.",
      medium: "Numbers 1–100, 10 rounds. The AI always bisects the range perfectly (binary search) — a fair, evenly matched race.",
      hard: "Numbers 1–100, only 9 rounds. The AI plays smart but has human quirks (favorite numbers) — a tighter margin for error.",
      expert: "Numbers 1–100, only 7 rounds. The AI searches near-optimally — one wasted guess can cost you the game."
    };
    function updateDifficultyDesc(key) { $("#difficulty-desc").textContent = DIFFICULTY_DETAILS[key] || ""; }

    // Setup wizard: Step 1 Difficulty -> Step 2 Lock Number -> Step 3 Start
    let setupStep = 1;
    function renderWizardSteps() {
      [1,2,3].forEach(n => {
        const el = $(`.wizard-step[data-step="${n}"]`);
        el.classList.toggle("current", n === setupStep);
        el.classList.toggle("done", n < setupStep);
        el.querySelector(".step-num").textContent = n < setupStep ? "✓" : n;
        el.dataset.nav = n < setupStep ? "true" : "false";
      });
      $('.wizard-connector[data-after="1"]').classList.toggle("filled", setupStep > 1);
      $('.wizard-connector[data-after="2"]').classList.toggle("filled", setupStep > 2);
    }
    function showSetupStep(step) {
      setupStep = step;
      [1,2,3].forEach(n => $(`#wizard-panel-${n}`).classList.toggle("active", n === step));
      renderWizardSteps();
    }
    document.querySelectorAll(".wizard-step").forEach(el => {
      el.addEventListener("click", () => {
        const target = Number(el.dataset.step);
        if (target < setupStep) { playClickSound(); showSetupStep(target); }
      });
    });
    $("#step1-continue").addEventListener("click", () => { playClickSound(); showSetupStep(isPlayerNumberLocked ? 3 : 2); });

    // Floating background particles
    function initParticles() {
      const container = $("#bg-particles");
      const colors = ["rgba(87,230,255,.55)","rgba(168,132,255,.5)","rgba(116,239,173,.45)"];
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement("span");
        particle.className = "bg-particle";
        const size = 3 + Math.random() * 7;
        particle.style.width = particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.background = `radial-gradient(circle, ${colors[i % colors.length]}, transparent 70%)`;
        particle.style.animationDuration = `${8 + Math.random() * 10}s`;
        particle.style.animationDelay = `${-Math.random() * 10}s`;
        container.appendChild(particle);
      }
    }

    // Ripple feedback on every button
    function attachRipple(button) {
      button.addEventListener("pointerdown", (event) => {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.4;
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
        button.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
      });
    }

    // Shake feedback for invalid input
    function shakeElement(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

    // AI "thinking" animation (typing dots + scan + loading bar)
    let thinkingDotsTimer = null;
    function startThinkingDots(el) {
      let dots = 0;
      el.textContent = "";
      thinkingDotsTimer = setInterval(() => { dots = (dots + 1) % 4; el.textContent = ".".repeat(dots); }, 260);
    }
    function stopThinkingDots() { if (thinkingDotsTimer) { clearInterval(thinkingDotsTimer); thinkingDotsTimer = null; } }
    function startAiThinking(callback) {
      const orb = $("#ai-orb"), guessText = $("#ai-guess"), loadingBar = $("#ai-loading"), loadingFill = loadingBar.querySelector("div");
      orb.classList.add("thinking");
      loadingBar.classList.add("active");
      loadingFill.style.width = "0%";
      startThinkingDots(guessText);
      requestAnimationFrame(() => requestAnimationFrame(() => { loadingFill.style.width = "100%"; }));
      setTimeout(() => {
        stopThinkingDots();
        orb.classList.remove("thinking");
        loadingBar.classList.remove("active");
        callback();
      }, 700);
    }

    // Range bar — visual number line that shrinks as guesses narrow it
    function updateRangeBar(fillId, low, high, max) {
      const fill = document.getElementById(fillId);
      if (!fill || max <= 1) return;
      const leftPct = ((low - 1) / (max - 1)) * 100;
      const widthPct = Math.max(((high - low) / (max - 1)) * 100, 1.4);
      fill.style.left = `${leftPct}%`;
      fill.style.width = `${widthPct}%`;
    }

    // Guess history panels
    let playerHistory = [];
    let aiHistory = [];
    function tagFor(kind) { return kind === "correct" ? { cls:"correct", text:"Correct!" } : kind === "higher" ? { cls:"higher", text:"Higher" } : { cls:"lower", text:"Lower" }; }
    function renderPlayerHistory() {
      const el = $("#player-history");
      if (!playerHistory.length) { el.innerHTML = '<p class="history-empty">No guesses yet.</p>'; return; }
      el.innerHTML = playerHistory.slice().reverse().map(entry => {
        const tag = tagFor(entry.result);
        return `<div class="history-row"><span class="history-guess">${entry.guess}</span><span class="history-tag ${tag.cls}">${tag.text}</span></div>`;
      }).join("");
    }
    function renderAiHistory() {
      const el = $("#ai-history");
      if (!aiHistory.length) { el.innerHTML = '<p class="history-empty">No guesses yet.</p>'; return; }
      el.innerHTML = aiHistory.slice().reverse().map(entry => {
        const tag = tagFor(entry.feedback);
        return `<div class="history-row"><span class="history-guess">${entry.guess}</span><span class="history-meta"><span class="history-tag ${tag.cls}">${tag.text}</span><span class="history-verified">✓ Verified</span></span></div>`;
      }).join("");
    }

    // Core UI rendering & state (message box, live stats, full reset)
    function setMessage(text) { $("#message").textContent = text; }
    function updateUi() {
      const state = getGameState(), eliminated = Math.round((1 - state.ai.remaining / maxNumber) * 100);
      $("#player-range").textContent = `${state.player.low} – ${state.player.high}`;
      $("#remaining").textContent = `${state.ai.remaining} possible number${state.ai.remaining === 1 ? "" : "s"} remaining`;
      $("#eliminated").textContent = `${eliminated}% eliminated`;
      $("#round-display").textContent = `Round ${state.round} / ${state.maxRounds}`;
      $("#player-guess").max = maxNumber; $("#secret-number").max = maxNumber;
      $("#lock-helper").textContent = `Choose a private number from 1 to ${maxNumber}. It stays in this browser.`;
      $("#player-range-max").textContent = maxNumber; $("#ai-range-max").textContent = maxNumber;
      updateRangeBar("player-range-fill", state.player.low, state.player.high, maxNumber);
      updateRangeBar("ai-range-fill", state.ai.low, state.ai.high, maxNumber);
    }
    function setPlaying(enabled) { $("#player-guess").disabled=!enabled; $("#guess-button").disabled=!enabled; feedbackButtons.forEach(button=>button.disabled=true); }
    function resetUi(key) {
      const result = startGame(key);
      const setupPanel = $("#setup-panel");
      $(".app").classList.remove("playing");
      setupPanel.classList.remove("locked","shake");
      difficultyButtons.forEach(button => button.classList.toggle("active", button.dataset.difficulty === key));
      updateDifficultyDesc(key);
      const secretInput = $("#secret-number");
      secretInput.value = ""; secretInput.disabled = false; secretInput.classList.remove("sealed","shake"); secretInput.type = "number";
      $("#lock-button").disabled = false;
      $("#lock-label").textContent = "Lock number";
      $("#player-guess").value = ""; $("#player-guess").classList.remove("shake");
      stopThinkingDots();
      $("#ai-guess").textContent = "?";
      $("#ai-orb").classList.remove("thinking");
      $("#ai-loading").classList.remove("active");
      $("#ai-loading").querySelector("div").style.width = "0%";
      $("#status").textContent = `${result.difficulty} · Setup`;
      playerHistory = []; aiHistory = [];
      renderPlayerHistory(); renderAiHistory();
      showSetupStep(1);
      setPlaying(false);
      updateUi();
      setMessage(`Selected ${result.difficulty}. Choose a difficulty, lock your secret number, then start the race.`);
    }
    function celebrate() { const colors=["#57e6ff","#a884ff","#74efad","#ff7aa8","#ffe278"]; for(let i=0;i<46;i++){const piece=document.createElement("i");piece.className="burst";piece.style.background=colors[i%colors.length];piece.style.left="50%";piece.style.top="35%";piece.style.setProperty("--x",`${(Math.random()-.5)*160}px`);piece.style.setProperty("--y",`${(Math.random()-.5)*60}px`);piece.style.setProperty("--dx",`${(Math.random()-.5)*520}px`);document.body.append(piece);setTimeout(()=>piece.remove(),1300);} }
    function showResult(title,text,won) { const overlay=$("#result-overlay"); overlay.className=`result-overlay show ${won?"win":"loss"}`; $("#result-icon").textContent=won?"★":"!"; $("#result-title").textContent=title; $("#result-text").textContent=text; if (won) { celebrate(); playWinSound(); } else { playLoseSound(); } }
    function finish(message,won=false) { setPlaying(false); $("#status").textContent="Race complete"; setMessage(`${message} Pick a difficulty to play again.`); showResult(won?"You won!":"AI wins",message,won); }
    // Game actions: lock secret -> start race -> take turns
    function lockSecret() {
      const setupPanel = $("#setup-panel"), secretInput = $("#secret-number"), lockButton = $("#lock-button");
      const result = lockPlayerNumber(secretInput.value);
      if (!result.success) {
        setMessage(result.message);
        shakeElement(setupPanel);
        shakeElement(secretInput);
        secretInput.focus();
        return;
      }
      setupPanel.classList.add("locked");
      lockButton.disabled = true;
      secretInput.type = "text";
      secretInput.value = "•".repeat(String(lockedPlayerNumber).length);
      secretInput.disabled = true;
      secretInput.classList.add("sealed");
      $("#lock-label").textContent = "Locked ✓";
      playLockSound();
      const rect = lockButton.getBoundingClientRect();
      const colors = ["#57e6ff","#a884ff","#74efad","#ffe278"];
      for (let i = 0; i < 22; i++) {
        const piece = document.createElement("i");
        piece.className = "mini-burst";
        piece.style.background = colors[i % colors.length];
        piece.style.left = `${rect.left + rect.width / 2}px`;
        piece.style.top = `${rect.top + rect.height / 2}px`;
        piece.style.setProperty("--dx", `${(Math.random() - .5) * 130}px`);
        piece.style.setProperty("--dy", `${(Math.random() - .8) * 130}px`);
        document.body.append(piece);
        setTimeout(() => piece.remove(), 800);
      }
      setMessage("Secret sealed. Get ready…");
      setTimeout(() => {
        showSetupStep(3);
        setMessage("Secret sealed. Hit Start Game when you're ready.");
      }, 600);
    }
    function startRace() {
      $(".app").classList.add("playing");
      $("#status").textContent = `${currentDifficulty.name} · Round 1 / ${maxRounds}`;
      setPlaying(true);
      setMessage("Race started! Make a guess to begin.");
      $("#player-guess").focus();
    }
    function playerTurn() {
      const result = makePlayerGuess($("#player-guess").value);
      if (!result.valid) { setMessage(result.message); shakeElement($("#player-guess")); return; }
      playGuessSound();
      $("#player-guess").value = "";
      if (result.correct) {
        playerHistory.push({ guess: result.guess, result: "correct" }); renderPlayerHistory();
        finish(`The AI's secret number was ${result.guess}. You cracked it in ${result.rounds} rounds.`, true);
        return;
      }
      playerHistory.push({ guess: playerGuesses.at(-1), result: result.direction }); renderPlayerHistory();
      $("#player-guess").disabled = true;
      $("#guess-button").disabled = true;
      setMessage(`The AI's number is ${result.direction} than ${playerGuesses.at(-1)}. Waiting for the AI to respond…`);
      startAiThinking(() => {
        const aiResult = makeAiGuess();
        $("#ai-guess").textContent = aiResult.guess;
        feedbackButtons.forEach(button => button.disabled = false);
        updateUi();
        setMessage(`The AI's number is ${result.direction} than ${playerGuesses.at(-1)}. Now answer its guess.`);
      });
    }
    function respondToAi(feedback) {
      const result = giveAiFeedback(feedback);
      if (!result.valid) { setMessage(result.message); return; }
      aiHistory.push({ guess: aiGuess, feedback: result.correct ? "correct" : result.direction }); renderAiHistory();
      feedbackButtons.forEach(button => button.disabled = true);
      if (result.correct) { finish(`The AI found your secret number (${result.guess}) in ${result.rounds} rounds.`); return; }
      const next = nextRound();
      updateUi();
      if (next.draw) { finish(`It's a draw. Nobody found the other number in ${maxRounds} rounds. The AI's number was ${computerSecret}.`); return; }
      $("#status").textContent = `${currentDifficulty.name} · Round ${next.round} / ${maxRounds}`;
      $("#ai-guess").textContent = "?";
      $("#player-guess").disabled = false;
      $("#guess-button").disabled = false;
      setMessage(`AI learned your number is ${result.direction} than ${aiGuesses.at(-1)}. Your turn for round ${next.round}.`);
      $("#player-guess").focus();
    }
    // Input validation (digits only, clamp to current max)
    function keepDigits(event) { const input=event.target; let value=input.value.replace(/\D/g,""); if(value && Number(value)>maxNumber) value=input.dataset.lastValid || ""; input.value=value; input.dataset.lastValid=value; }
    document.querySelectorAll(".number-only").forEach(input=>{input.addEventListener("input",keepDigits);input.addEventListener("keydown",event=>{if(["e","E","+","-","."].includes(event.key))event.preventDefault();});});

    // Event bindings
    $("#lock-button").addEventListener("click", lockSecret);
    $("#secret-number").addEventListener("keydown", event => { if (event.key === "Enter") lockSecret(); });
    $("#start-game-button").addEventListener("click", () => { playClickSound(); startRace(); });
    $("#guess-button").addEventListener("click", playerTurn);
    $("#player-guess").addEventListener("keydown", event => { if (event.key === "Enter") playerTurn(); });
    feedbackButtons.forEach(button => button.addEventListener("click", () => { playClickSound(); respondToAi(button.dataset.feedback); }));
    let pendingDifficultyButton = null;
    function hasGameProgress() { return isPlayerNumberLocked && !gameOver; }
    function requestDifficultyChange(button) {
      if (hasGameProgress()) {
        pendingDifficultyButton = button;
        $("#confirm-overlay").classList.add("show");
        return;
      }
      playClickSound();
      resetUi(button.dataset.difficulty);
      moveDifficultyPill(button);
    }
    difficultyButtons.forEach(button => button.addEventListener("click", () => requestDifficultyChange(button)));
    $("#confirm-cancel").addEventListener("click", () => { playClickSound(); pendingDifficultyButton = null; $("#confirm-overlay").classList.remove("show"); });
    $("#confirm-proceed").addEventListener("click", () => {
      playClickSound();
      $("#confirm-overlay").classList.remove("show");
      if (pendingDifficultyButton) { resetUi(pendingDifficultyButton.dataset.difficulty); moveDifficultyPill(pendingDifficultyButton); pendingDifficultyButton = null; }
    });
    $("#play-again").addEventListener("click", () => { playClickSound(); $("#result-overlay").className = "result-overlay"; resetUi(currentDifficulty ? Object.keys(DIFFICULTIES).find(key => DIFFICULTIES[key] === currentDifficulty) : "medium"); });
    $("#theme-toggle").addEventListener("click", () => { playClickSound(); playThemeTransition($("#theme-toggle"), currentTheme === "light" ? "dark" : "light"); });
    $("#mute-toggle").addEventListener("click", () => setSoundEnabled(!soundEnabled));
    document.addEventListener("keydown", event => {
      if (event.code === "Space" && $("#result-overlay").classList.contains("show")) { event.preventDefault(); $("#play-again").click(); }
    });
    document.querySelectorAll("button").forEach(attachRipple);

    // Boot sequence
    initParticles();
    initTheme();
    setSoundEnabled(true);
    resetUi("medium");
    moveDifficultyPill($(".difficulty button.active"), false);
