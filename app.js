document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Dashboard Logic (Time, Date, History) ---

    function updateClock() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        document.getElementById('current-date').textContent = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    setInterval(updateClock, 1000);
    updateClock();

    function setupHistory() {
        // Load history from localStorage
        let visits = JSON.parse(localStorage.getItem('moodFixerVisits')) || [];

        // Add current visit if last visit was more than 1 hour ago
        const now = new Date();
        const nowStr = now.toLocaleString();

        if (visits.length === 0 || (now.getTime() - new Date(visits[0]).getTime() > 1000 * 60 * 60)) {
            visits.unshift(nowStr);
            if (visits.length > 10) visits.pop(); // Keep only last 10
            localStorage.setItem('moodFixerVisits', JSON.stringify(visits));
        }

        const visitList = document.getElementById('visit-list');
        visitList.innerHTML = '';
        visits.forEach(visit => {
            const li = document.createElement('li');
            li.textContent = `🌱 Signed in: ${visit}`;
            visitList.appendChild(li);
        });
    }

    setupHistory();

    // Toggle History Sidebar
    const toggleBtn = document.getElementById('toggle-history');
    const dashboard = document.getElementById('dashboard');
    const toggleText = document.getElementById('toggle-text');

    toggleBtn.addEventListener('click', () => {
        dashboard.classList.toggle('collapsed');
        if (dashboard.classList.contains('collapsed')) {
            toggleText.textContent = 'Show History';
        } else {
            toggleText.textContent = 'Hide History';
        }
    });

    // --- 2. App State & Flow ---
    let userState = {
        identity: null,
        moodEmoji: null,
        moodText: ''
    };

    const stepIdentity = document.getElementById('step-identity');
    const stepMood = document.getElementById('step-mood');
    const stepResult = document.getElementById('step-result');

    // Identity Selection
    const identityBtns = document.querySelectorAll('#step-identity .btn-option');
    identityBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            userState.identity = e.target.dataset.identity;

            // Visual feedback
            identityBtns.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');

            // Move to next step after brief delay
            setTimeout(() => {
                stepIdentity.classList.add('hidden');
                
                // Toggle Logo and History Icon
                const mainLogo = document.getElementById('main-logo');
                if(mainLogo) mainLogo.classList.add('hidden-element');
                
                const toggleHistory = document.getElementById('toggle-history');
                if(toggleHistory) toggleHistory.classList.remove('hidden-element');
                
                setTimeout(() => stepMood.classList.remove('hidden'), 400);
            }, 500);
        });
    });

    // Mood Selection (Emoji)
    const moodBtns = document.querySelectorAll('#step-mood .emoji-btn');
    moodBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            userState.moodEmoji = e.target.dataset.mood;
            moodBtns.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
        });
    });

    const customMoodInput = document.getElementById('custom-mood');
    customMoodInput.addEventListener('input', (e) => {
        userState.moodText = e.target.value;
    });

    const btnSubmitMood = document.getElementById('btn-submit-mood');
    btnSubmitMood.addEventListener('click', () => {
        if (!userState.moodEmoji && !userState.moodText.trim()) {
            alert("Please select an emoji or type how you feel!");
            return;
        }

        generateAIResponse();

        stepMood.classList.add('hidden');
        setTimeout(() => stepResult.classList.remove('hidden'), 400);
    });

    const btnRestart = document.getElementById('btn-restart');
    btnRestart.addEventListener('click', () => {
        // Reset state visual
        moodBtns.forEach(b => b.classList.remove('selected'));
        customMoodInput.value = '';
        userState.moodEmoji = null;
        userState.moodText = '';

        stepResult.classList.add('hidden');
        setTimeout(() => stepMood.classList.remove('hidden'), 400);
    });


    // --- 3. Simulated AI Engine ---
    // knowledgeBase is now loaded globally from data.js

    function generateAIResponse() {
        let category = 'generic';
        let text = userState.moodText.toLowerCase();
        let emoji = userState.moodEmoji;

        // Simple NLP logic
        if (text.includes('sad') || text.includes('cry') || text.includes('depress') || emoji === 'Sad') {
            category = 'sad';
        } else if (text.includes('happy') || text.includes('joy') || text.includes('good') || emoji === 'Happy') {
            category = 'happy';
        } else if (text.includes('sleep') || text.includes('bed') || emoji === 'Sleepy') {
            category = 'sleepy';
        } else if (text.includes('tired') || text.includes('exhausted') || emoji === 'Tired' || emoji === 'tired') {
            category = 'tired';
        } else if (text.includes('wake') || text.includes('morning') || emoji === 'Waking Up') {
            category = 'wakingup';
        } else if (text.includes('anxious') || text.includes('panic') || text.includes('nervous') || emoji === 'Anxious') {
            category = 'anxious';
        } else if (text.includes('angry') || text.includes('mad') || text.includes('hate') || emoji === 'Angry') {
            category = 'angry';
        } else if (emoji === 'Lovely' || text.includes('love') || text.includes('lovely')) {
            category = 'lovely';
        } else if (emoji === 'generic' || emoji === 'Normal' || text.includes('normal') || text.includes('fine') || text.includes('okay')) {
            category = 'normal';
        }

        const responses = knowledgeBase[category] || knowledgeBase.generic;
        let responseText = responses[Math.floor(Math.random() * responses.length)];

        // Optionally personalize based on identity if we want to (keeping it generally inspiring)
        if (userState.identity) {
            // We could prepend "Hey [Identity] friend! " but maybe just keep it clean.
        }

        document.getElementById('result-text').textContent = responseText;
    }
});
