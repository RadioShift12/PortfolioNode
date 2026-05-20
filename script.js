
// PART 2 STEP 1
// Global error listener to catch unhandled errors
window.addEventListener('error', (event) => {
    console.error(`Global Error Caught: ${event.message} at ${event.filename}:${event.lineno}`);
});

document.addEventListener('DOMContentLoaded', () => {
    
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('Service Worker registered successfully!', reg.scope);
                // PART 4: Request Notification Permission once SW is ready
                requestNotificationPermission();
            })
            .catch(err => console.error('Service Worker registration failed:', err));
    }

    // PART 4: Notification Implementation
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                    // Show a desktop notification
                    new Notification("Dylan Portfolio", {
                        body: "Thank you for enabling notifications!",
                        icon: "/profile.jpg"
                    });
                }
            });
        }
    }

    // PART 3: Touch Event Handling
    // Adds a mobile-first touch gesture interaction
    const profileImg = document.querySelector('.profile-img');
    if (profileImg) {
        let touchStartX = 0;
        
        profileImg.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        profileImg.addEventListener('touchend', (e) => {
            let touchEndX = e.changedTouches[0].screenX;
            if (touchEndX - touchStartX > 50) {
                profileImg.style.transform = 'rotate(360deg)';
                profileImg.style.transition = 'transform 0.8s ease';
                setTimeout(() => profileImg.style.transform = 'none', 800);
            }
        }, { passive: true });
    }
    
    let age = 17;
    const name = "Dylan Apfelbeck";
    let isStudent = true;

    console.log("age:" + typeof age + ", name:" + typeof name + ", isStudent:" + typeof isStudent);

    age++;
    console.log("New age: " + age);

    let canVote = (age >= 18) ? true : false;
    console.log("Can vote: " + canVote);


    let ageAsString = String(age);
    let nameAsNumber = Number(name);
    let isStudentAsBoolean = Number(isStudent);

    console.log(ageAsString, nameAsNumber, isStudentAsBoolean);


    let message = "Age is " + age;
    console.log(message);


});