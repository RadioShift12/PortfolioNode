
const contactRateLimit = (() => {
    let lastAttempt = 0;
    return () => {
        const now = Date.now();
        if (now - lastAttempt < 10000) return false;
        lastAttempt = now;
        return true;
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    
    
    const contactToken = Math.random().toString(36).slice(2);
    sessionStorage.setItem('contact_csrf', contactToken);

    const statusMessage = document.createElement('div');
    statusMessage.id = 'form-status-message';
    form.parentNode.insertBefore(statusMessage, form);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        
        if (!contactRateLimit()) {
            statusMessage.textContent = "Please wait before submitting again.";
            statusMessage.style.color = "orange";
            return;
        }

        if (sessionStorage.getItem('contact_csrf') !== contactToken) {
            console.error("Security: Invalid Session Token");
            return;
        }

        
        const rawData = {
            fname: document.getElementById('fname').value.trim(),
            email: document.getElementById('email').value.trim(),
            comments: document.getElementById('comments').value.trim()
        };

        const sanitizedData = {};
        for (let key in rawData) {
            const div = document.createElement('div');
            div.textContent = rawData[key]; 
            sanitizedData[key] = div.innerHTML; 
        }

        
        let errors = [];
        if (!sanitizedData.fname) errors.push("First name is required.");
        if (!sanitizedData.email.includes('@')) errors.push("Valid email is required.");

        if (errors.length > 0) {
            statusMessage.textContent = errors.join(' ');
            statusMessage.style.color = "red";
        } else {
            statusMessage.textContent = "Securely processed your message!";
            statusMessage.style.color = "green";
            form.reset();
        }
    });

    

    // Part 3: Enhanced Geolocation with Auto-fill
    const locationRateLimit = (() => {
        let lastRequest = 0;
        const cooldown = 60000;
        return () => {
            const now = Date.now();
            if (now - lastRequest < cooldown) return false;
            lastRequest = now;
            return true;
        };
    })();
    const locationBtn = document.createElement('button');
    locationBtn.type = 'button';
    locationBtn.textContent = 'Auto-fill City/State';
    locationBtn.className = 'submit-btn';
    form.before(locationBtn);

    locationBtn.addEventListener('click', async () => {
        // Check Rate Limit first
        if (!locationRateLimit()) {
            statusMessage.textContent = "Please wait a minute before requesting location again.";
            statusMessage.style.color = "orange";
            return;
        }

        if (!navigator.geolocation) {
            statusMessage.textContent = "Geolocation is not supported by your browser.";
            return;
        }

        statusMessage.textContent = "Locating...";
        
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                // I thought it would be cool to make it auto fill instead of just telling you the coordinates.
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                // PART 4: Specific Error Scenario Testing/Handling
                //If the service rate limits. I believe this is correct, but dont want to test and get IP banned.
                if (response.status === 429) { 
                    statusMessage.textContent = "Error: The location service is busy. Please try again in a few minutes.";
                    statusMessage.style.color = "red";
                    return;
                }

                if (!response.ok) throw new Error("API Limit reached or service down.");
                
                const data = await response.json();
                
                if (data.address) {
                    document.getElementById('city').value = data.address.city || data.address.town || "";
                    document.getElementById('state').value = data.address.state || "";
                    document.getElementById('zip').value = data.address.postcode || "";
                    
                    statusMessage.textContent = "Location auto-filled!";
                    statusMessage.style.color = "green";
                }
            } catch (error) {
                console.error("Geocoding error:", error);
                statusMessage.textContent = "Address lookup failed. Please enter manually.";
            }
        }, () => {
            statusMessage.textContent = "Permission denied or location unavailable.";
            statusMessage.style.color = "red";
        });
    });
});