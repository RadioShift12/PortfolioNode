
const contactRateLimit = (() => {
    let lastAttempt = 0;
    return () => {
        const now = Date.now();
        if (now - lastAttempt < 10000) return false;
        lastAttempt = now;
        return true;
    };
})();

const regexPatterns = {
    // Allows letters, spaces, hyphens, and apostrophes, over two chars.
    name: /^[A-Za-z\s'-]{2,}$/,
    
    // 2-letter state code (e.g., WI, CA)
    state: /^[A-Za-z]{2}$/,
    
    // Standard 5 digit ZIP or ZIP+4
    zip: /^\d{5}(-\d{4})?$/,
    
    // Accepts formats: 555-555-5555, (555) 555-5555, 5555555555, 555.555.5555
    phone: /^(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
    
    // Standard email pattern
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};
const fieldRules = {
    fname: { pattern: regexPatterns.name, required: true, msg: "First name must be at least 2 characters (letters only)." },
    lname: { pattern: regexPatterns.name, required: true, msg: "Last name must be at least 2 characters (letters only)." },
    company: { pattern: null, required: true, msg: "Company name is required." },
    city: { pattern: regexPatterns.name, required: false, msg: "City should contain letters only." },
    state: { pattern: regexPatterns.state, required: false, msg: "State must be a 2-letter abbreviation." },
    zip: { pattern: regexPatterns.zip, required: false, msg: "Enter a valid 5-digit Zip code." },
    phone: { pattern: regexPatterns.phone, required: false, msg: "Enter a valid phone number." },
    email: { pattern: regexPatterns.email, required: true, msg: "Please enter a valid email address." }
};
function validateField(input) {
    const rule = fieldRules[input.id];
    const errorSpan = document.getElementById(`${input.id}-error`);
    const value = input.value.trim();

    if (!rule) return true;

    let isValid = true;
    let errorMessage = "";

    if (rule.required && value === "") {
        isValid = false;
        errorMessage = "This field is required.";
    } 
    else if (value !== "" && rule.pattern && !rule.pattern.test(value)) {
        isValid = false;
        errorMessage = rule.msg;
    }

    // UI feedback
    if (errorSpan) {
        errorSpan.textContent = errorMessage;
    }

    if (isValid) {
        input.classList.remove('invalid');
        input.classList.add('valid');
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
    }

    return isValid;
}


document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    
    
    const contactToken = Math.random().toString(36).slice(2);
    sessionStorage.setItem('contact_csrf', contactToken);

    const statusMessage = document.createElement('div');
    statusMessage.id = 'form-status-message';
    form.parentNode.insertBefore(statusMessage, form);


    Object.keys(fieldRules).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('blur', () => validateField(input));
            
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    validateField(input);
                }
            });
        }
    });


    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Rate limiting check
        if (typeof contactRateLimit === 'function' && !contactRateLimit()) {
            statusMessage.textContent = "Please wait before submitting again.";
            statusMessage.style.color = "orange";
            return;
        }

        // Validate fields
        let isFormValid = true;
        Object.keys(fieldRules).forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                const fieldValid = validateField(input);
                if (!fieldValid) isFormValid = false;
            }
        });

        if (!isFormValid) {
            statusMessage.textContent = "Please correct the highlighted errors above.";
            statusMessage.style.color = "red";
        } else {
            statusMessage.textContent = "Thank you! Your form has been submitted successfully.";
            statusMessage.style.color = "green";
            
            // Clean up UI
            form.reset();
            document.querySelectorAll('form input').forEach(input => {
                input.classList.remove('valid', 'invalid');
            });
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