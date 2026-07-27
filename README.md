# Guess Protocol 🎯

Guess Protocol is a browser-based number guessing race where you compete against an adaptive AI. Lock in a secret number, then race each round: you guess the AI's number while it tries to guess yours, using only truthful higher/lower/correct feedback.

🔗 [Play Guess Protocol](https://dipdagod.github.io/guess-da-number/index.html)

## Features

* ✨ **Human vs AI race** – You and the AI each take one guess per round, racing to find the other's secret number first.
* 🧭 **Guided setup flow** – A 3-step wizard (Difficulty → Lock Number → Start Game) walks new players through setup, with a clear step indicator showing progress.
* 🔒 **Verified secret number** – Your number is locked in the browser, so every higher/lower/correct answer you give the AI is checked against it — no bluffing possible.
* 🧠 **Four AI difficulty modes** – Easy (near-random within 1–50), Medium (perfect binary search over 1–100), Hard (human-like guessing with favorite numbers, tighter round limit), and Expert (near-optimal search with barely any margin for error). Each mode explains exactly what changes before you pick it.
* 🎚️ **Sliding difficulty selector** – An animated pill glides between difficulty options, and switching mid-game prompts a confirmation before erasing your progress.
* 📜 **Guess history panels** – A running, scrollable log of every guess and result on both sides, including a verification badge on the AI's feedback history.
* 📊 **Live game intelligence** – A visual range bar shrinks in real time as guesses narrow down the possibilities, alongside round count, remaining candidates, and elimination percentage.
* 🎨 **Dark/light theme** – Defaults to your system preference, remembers your choice via `localStorage`, and switches with a circular wipe animation from the toggle button.
* 🔊 **Sound effects & mute toggle** – Distinct tones for clicks, guesses, locking your secret, wins, and losses, with a one-tap mute option.
* ⌨️ **Keyboard shortcuts** – Enter to submit a guess or lock your number, Space to dismiss the end-of-game screen and play again.
* 📱 **Responsive game board** – Comfortable to play on desktop or mobile.
* 🎉 **Satisfying interactions** – Animated buttons, a locking-in "seal" animation with confetti, an AI "thinking" animation, and a confetti-filled win screen.
