/*
    Just a small note, a lot of my project already had error handling
    So there was much I had to add.
    (Im thinking, and hoping the zoo assignment is the same way)
*/

// PART 2 STEP 1
// Global error listener to catch unhandled errors
window.addEventListener('error', (event) => {
    console.error(`Global Error Caught: ${event.message} at ${event.filename}:${event.lineno}`);
});

document.addEventListener('DOMContentLoaded', () => {

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