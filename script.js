import {
    auth,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    deleteDoc,
    runTransaction
} from "./firebase-config.js";


"use strict";


/* =====================================================
   HELPERS
===================================================== */

const $ = (selector) =>
    document.querySelector(selector);


const authScreen =
    $("#auth-screen");

const appScreen =
    $("#app");

const loginForm =
    $("#login-form");

const registerForm =
    $("#register-form");

const showRegister =
    $("#show-register");

const showLogin =
    $("#show-login");

const loginMessage =
    $("#login-message");

const registerMessage =
    $("#register-message");


function usernameToEmail(username) {

    return username.toLowerCase() +
        "@awhreals.com";

}


function isValidUsername(username) {

    return /^[a-zA-Z0-9_]{3,20}$/.test(
        username
    );

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function getStoredUser() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "awh_current_user"
            )
        );

    } catch {

        return null;

    }

}


function storeUser(user) {

    localStorage.setItem(
        "awh_current_user",
        JSON.stringify(user)
    );

}


function clearStoredUser() {

    localStorage.removeItem(
        "awh_current_user"
    );

}


function showMessage(
    element,
    text,
    success = false
) {

    if (!element) return;

    element.textContent =
        text;

    element.style.color =
        success
            ? "#00ff88"
            : "#ff4444";

}


/* =====================================================
   AUTH SCREEN
===================================================== */

function showApp() {

    authScreen?.classList.add(
        "hidden"
    );

    appScreen?.classList.remove(
        "hidden"
    );

}


function showAuth() {

    appScreen?.classList.add(
        "hidden"
    );

    authScreen?.classList.remove(
        "hidden"
    );

}


function showLoginForm() {

    loginForm?.classList.remove(
        "hidden"
    );

    registerForm?.classList.add(
        "hidden"
    );

    if (loginMessage) {

        loginMessage.textContent = "";

    }

    if (registerMessage) {

        registerMessage.textContent = "";

    }

}


function showRegisterForm() {

    loginForm?.classList.add(
        "hidden"
    );

    registerForm?.classList.remove(
        "hidden"
    );

    if (loginMessage) {

        loginMessage.textContent = "";

    }

    if (registerMessage) {

        registerMessage.textContent = "";

    }

}


/* =====================================================
   LOGIN / REGISTER TOGGLE
===================================================== */

showRegister?.addEventListener(
    "click",
    showRegisterForm
);


showLogin?.addEventListener(
    "click",
    showLoginForm
);


/* =====================================================
   REGISTER
===================================================== */

registerForm?.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const usernameInput =
            $("#register-username");

        const passwordInput =
            $("#register-password");

        const confirmInput =
            $("#register-confirm");


        if (
            !usernameInput ||
            !passwordInput ||
            !confirmInput
        ) {

            return;

        }


        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmInput.value;


        if (!isValidUsername(username)) {

            showMessage(
                registerMessage,
                "Username must contain only letters, numbers and underscores."
            );

            return;

        }


        if (password.length < 6) {

            showMessage(
                registerMessage,
                "Password must be at least 6 characters."
            );

            return;

        }


        if (password !== confirmPassword) {

            showMessage(
                registerMessage,
                "Passwords do not match."
            );

            return;

        }


        const email =
            usernameToEmail(username);


        try {

            showMessage(
                registerMessage,
                "Creating account..."
            );


            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            const userData = {

                uid:
                    user.uid,

                username:
                    username,

                name:
                    username,

                bio:
                    "Welcome to AWH Reals 🔥",

                email:
                    email,

                createdAt:
                    serverTimestamp()

            };


            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                userData
            );


            const currentUser = {

                uid:
                    user.uid,

                username:
                    username,

                name:
                    username,

                bio:
                    "Welcome to AWH Reals 🔥",

                email:
                    email

            };


            storeUser(
                currentUser
            );


            showMessage(
                registerMessage,
                "Account created successfully!",
                true
            );


            setTimeout(
                function () {

                    showApp();

                    updateProfileUI(
                        currentUser
                    );

                    initializeMainSite();

                },
                300
            );


        } catch (error) {

            console.error(
                "Register error:",
                error
            );


            switch (error.code) {

                case "auth/email-already-in-use":

                    showMessage(
                        registerMessage,
                        "Username already exists."
                    );

                    break;


                case "auth/invalid-email":

                    showMessage(
                        registerMessage,
                        "Invalid username."
                    );

                    break;


                case "auth/weak-password":

                    showMessage(
                        registerMessage,
                        "Password is too weak."
                    );

                    break;


                case "auth/network-request-failed":

                    showMessage(
                        registerMessage,
                        "Network error. Check your internet connection."
                    );

                    break;


                case "auth/operation-not-allowed":

                    showMessage(
                        registerMessage,
                        "Email/Password login is disabled in Firebase."
                    );

                    break;


                default:

                    showMessage(
                        registerMessage,
                        "Could not create account."
                    );

            }

        }

    }
);


/* =====================================================
   LOGIN
===================================================== */

loginForm?.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const usernameInput =
            $("#login-username");

        const passwordInput =
            $("#login-password");


        if (
            !usernameInput ||
            !passwordInput
        ) {

            return;

        }


        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        if (!isValidUsername(username)) {

            showMessage(
                loginMessage,
                "Invalid username."
            );

            return;

        }


        if (!password) {

            showMessage(
                loginMessage,
                "Please enter your password."
            );

            return;

        }


        const email =
            usernameToEmail(username);


        try {

            showMessage(
                loginMessage,
                "Logging in..."
            );


            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            let userData = {};


            try {

                const snapshot =
                    await getDoc(
                        doc(
                            db,
                            "users",
                            user.uid
                        )
                    );


                if (snapshot.exists()) {

                    userData =
                        snapshot.data();

                }

            } catch (error) {

                console.warn(
                    "Could not load user profile:",
                    error
                );

            }


            const currentUser = {

                uid:
                    user.uid,

                email:
                    user.email,

                username:
                    userData.username ||
                    username,

                name:
                    userData.name ||
                    username,

                bio:
                    userData.bio ||
                    "Welcome to AWH Reals 🔥"

            };


            storeUser(
                currentUser
            );


            showMessage(
                loginMessage,
                "Login successful!",
                true
            );


            setTimeout(
                function () {

                    showApp();

                    updateProfileUI(
                        currentUser
                    );

                    initializeMainSite();

                },
                250
            );


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            switch (error.code) {

                case "auth/invalid-credential":

                    showMessage(
                        loginMessage,
                        "Wrong username or password."
                    );

                    break;


                case "auth/user-not-found":

                    showMessage(
                        loginMessage,
                        "Username does not exist."
                    );

                    break;


                case "auth/wrong-password":

                    showMessage(
                        loginMessage,
                        "Wrong password."
                    );

                    break;


                case "auth/too-many-requests":

                    showMessage(
                        loginMessage,
                        "Too many attempts. Try again later."
                    );

                    break;


                case "auth/network-request-failed":

                    showMessage(
                        loginMessage,
                        "Network error."
                    );

                    break;


                case "auth/user-disabled":

                    showMessage(
                        loginMessage,
                        "This account has been disabled."
                    );

                    break;


                default:

                    showMessage(
                        loginMessage,
                        "Login failed."
                    );

            }

        }

    }
);


/* =====================================================
   AUTH STATE
===================================================== */

let authStateInitialized =
    false;


onAuthStateChanged(
    auth,
    async function (user) {

        if (user) {

            let userData = {};


            try {

                const snapshot =
                    await getDoc(
                        doc(
                            db,
                            "users",
                            user.uid
                        )
                    );


                if (snapshot.exists()) {

                    userData =
                        snapshot.data();

                }

            } catch (error) {

                console.warn(
                    "Profile loading error:",
                    error
                );

            }


            const currentUser = {

                uid:
                    user.uid,

                email:
                    user.email,

                username:
                    userData.username ||
                    user.email?.split("@")[0] ||
                    "user",

                name:
                    userData.name ||
                    userData.username ||
                    "User",

                bio:
                    userData.bio ||
                    "Welcome to AWH Reals 🔥"

            };


            storeUser(
                currentUser
            );


            showApp();


            updateProfileUI(
                currentUser
            );


            if (!authStateInitialized) {

                authStateInitialized =
                    true;

                initializeMainSite();

            }

        } else {

            clearStoredUser();

            showAuth();

            showLoginForm();

            authStateInitialized =
                false;

        }

    }
);


/* =====================================================
   PROFILE
===================================================== */

function updateProfileUI(user) {

    const name =
        $("#profile-name");

    const username =
        $("#profile-username");

    const bio =
        $("#profile-bio");


    if (name) {

        name.textContent =
            user.name ||
            user.username ||
            "User";

    }


    if (username) {

        username.textContent =
            "@" +
            (
                user.username ||
                "user"
            );

    }


    if (bio) {

        bio.textContent =
            user.bio ||
            "Welcome to AWH Reals 🔥";

    }


    loadSavedPosts();

}


/* =====================================================
   LOGOUT
===================================================== */

const logoutButton =
    $("#logoutButton");


logoutButton?.addEventListener(
    "click",
    async function () {

        try {

            await signOut(
                auth
            );

            clearStoredUser();

            showAuth();

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


/* =====================================================
   MAIN SITE
===================================================== */

let mainSiteInitialized =
    false;


function initializeMainSite() {

    if (mainSiteInitialized) {

        loadSavedPosts();

        return;

    }


    mainSiteInitialized =
        true;


    initializeNavigation();

    initializeVideos();

    initializeLikes();

    initializeSaves();

    initializeComments();

    loadSavedPosts();

}


/* =====================================================
   NAVIGATION
===================================================== */

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(
            "[data-section]"
        );


    const sections =
        document.querySelectorAll(
            ".page-section"
        );


    navItems.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        button.dataset.section;


                    if (!target) {

                        return;

                    }


                    sections.forEach(
                        function (section) {

                            section.classList.remove(
                                "active"
                            );

                        }
                    );


                    navItems.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    const targetSection =
                        document.getElementById(
                            target
                        );


                    if (targetSection) {

                        targetSection.classList.add(
                            "active"
                        );

                    }


                    button.classList.add(
                        "active"
                    );


                    if (
                        target === "profile"
                    ) {

                        loadSavedPosts();

                    }

                }
            );

        }
    );

}


/* =====================================================
   VIDEOS
===================================================== */

function initializeVideos() {

    const videos =
        Array.from(
            document.querySelectorAll(
                ".reel-video"
            )
        );


    if (!videos.length) {

        return;

    }


    videos.forEach(
        function (video) {

            video.loop =
                true;

            video.playsInline =
                true;

            video.setAttribute(
                "playsinline",
                ""
            );

            video.setAttribute(
                "webkit-playsinline",
                ""
            );

            video.preload =
                "metadata";

            video.muted =
                true;

        }
    );


    function pauseOthers(activeVideo) {

        videos.forEach(
            function (video) {

                if (
                    video !== activeVideo
                ) {

                    video.pause();

                }

            }
        );

    }


    async function playActiveVideo(video) {

        if (!video) {

            return;

        }


        pauseOthers(
            video
        );


        video.muted =
            false;


        try {

            await video.play();

        } catch (error) {

            video.muted =
                true;


            try {

                await video.play();

            } catch (secondError) {

                console.warn(
                    "Video could not autoplay:",
                    secondError
                );

            }

        }

    }


    if (
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(
                function (entries) {

                    entries.forEach(
                        function (entry) {

                            const video =
                                entry.target;


                            if (
                                entry.isIntersecting &&
                                entry.intersectionRatio >= 0.65
                            ) {

                                playActiveVideo(
                                    video
                                );

                            } else {

                                video.pause();

                            }

                        }
                    );

                },
                {
                    threshold: [
                        0,
                        0.65,
                        0.8,
                        1
                    ]
                }
            );


        videos.forEach(
            function (video) {

                observer.observe(
                    video
                );

            }
        );

    } else {

        if (videos[0]) {

            playActiveVideo(
                videos[0]
            );

        }

    }


    let scrollTimer =
        null;


    window.addEventListener(
        "scroll",
        function () {

            clearTimeout(
                scrollTimer
            );


            scrollTimer =
                setTimeout(
                    function () {

                        let bestVideo =
                            null;

                        let bestVisibility =
                            0;


                        videos.forEach(
                            function (video) {

                                const rect =
                                    video.getBoundingClientRect();


                                const viewportHeight =
                                    window.innerHeight;


                                const visibleTop =
                                    Math.max(
                                        0,
                                        rect.top
                                    );


                                const visibleBottom =
                                    Math.min(
                                        viewportHeight,
                                        rect.bottom
                                    );


                                const visibleHeight =
                                    Math.max(
                                        0,
                                        visibleBottom -
                                        visibleTop
                                    );


                                const ratio =
                                    rect.height > 0
                                        ? visibleHeight /
                                          rect.height
                                        : 0;


                                if (
                                    ratio >
                                    bestVisibility
                                ) {

                                    bestVisibility =
                                        ratio;

                                    bestVideo =
                                        video;

                                }

                            }
                        );


                        if (
                            bestVideo &&
                            bestVisibility >= 0.65
                        ) {

                            playActiveVideo(
                                bestVideo
                            );

                        }

                    },
                    100
                );

        },
        {
            passive:
                true
        }
    );

}


/* =====================================================
   LIKES
===================================================== */

function initializeLikes() {

    const buttons =
        document.querySelectorAll(
            ".like-button"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function (event) {

                    event.stopPropagation();


                    const user =
                        auth.currentUser;


                    if (!user) {

                        showAuth();

                        return;

                    }


                    const reel =
                        button.closest(
                            ".reel"
                        );


                    if (!reel) {

                        return;

                    }


                    const reelId =
                        reel.dataset.reel;


                    if (!reelId) {

                        return;

                    }


                    if (
                        button.dataset.processing ===
                        "true"
                    ) {

                        return;

                    }


                    button.dataset.processing =
                        "true";


                    const wasLiked =
                        button.classList.contains(
                            "liked"
                        );


                    const counter =
                        button.querySelector(
                            "span"
                        );


                    let currentCount =
                        Number(
                            counter?.textContent ||
                            0
                        );


                    const newLiked =
                        !wasLiked;


                    const newCount =
                        Math.max(
                            0,
                            currentCount +
                            (
                                newLiked
                                    ? 1
                                    : -1
                            )
                        );


                    button.classList.toggle(
                        "liked",
                        newLiked
                    );


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    if (icon) {

                        icon.classList.toggle(
                            "fa-solid",
                            newLiked
                        );

                        icon.classList.toggle(
                            "fa-regular",
                            !newLiked
                        );

                    }


                    if (counter) {

                        counter.textContent =
                            newCount;

                    }


                    try {

                        const reelReference =
                            doc(
                                db,
                                "reels",
                                reelId
                            );


                        const likeReference =
                            doc(
                                db,
                                "reels",
                                reelId,
                                "likes",
                                user.uid
                            );


                        if (newLiked) {

                            await setDoc(
                                likeReference,
                                {

                                    uid:
                                        user.uid,

                                    createdAt:
                                        serverTimestamp()

                                }
                            );


                            await setDoc(
                                reelReference,
                                {

                                    reelId:
                                        reelId,

                                    likesCount:
                                        newCount

                                },
                                {
                                    merge:
                                        true
                                }
                            );

                        } else {

                            await deleteDoc(
                                likeReference
                            );


                            await runTransaction(
                                db,
                                async function (
                                    transaction
                                ) {

                                    const snapshot =
                                        await transaction.get(
                                            reelReference
                                        );


                                    let count =
                                        0;


                                    if (
                                        snapshot.exists()
                                    ) {

                                        count =
                                            Number(
                                                snapshot
                                                    .data()
                                                    .likesCount ||
                                                0
                                            );

                                    }


                                    count =
                                        Math.max(
                                            0,
                                            count - 1
                                        );


                                    transaction.set(
                                        reelReference,
                                        {

                                            reelId:
                                                reelId,

                                            likesCount:
                                                count

                                        },
                                        {
                                            merge:
                                                true
                                        }
                                    );

                                }
                            );

                        }

                    } catch (error) {

                        console.error(
                            "Like error:",
                            error
                        );


                        button.classList.toggle(
                            "liked",
                            wasLiked
                        );


                        if (icon) {

                            icon.classList.toggle(
                                "fa-solid",
                                wasLiked
                            );

                            icon.classList.toggle(
                                "fa-regular",
                                !wasLiked
                            );

                        }


                        if (counter) {

                            counter.textContent =
                                currentCount;

                        }

                    } finally {

                        button.dataset.processing =
                            "false";

                    }

                }
            );

        }
    );


    document
        .querySelectorAll(
            ".reel"
        )
        .forEach(
            function (reel) {

                const reelId =
                    reel.dataset.reel;


                const button =
                    reel.querySelector(
                        ".like-button"
                    );


                const counter =
                    button?.querySelector(
                        "span"
                    );


                if (
                    !reelId ||
                    !button ||
                    !counter
                ) {

                    return;

                }


                onSnapshot(
                    doc(
                        db,
                        "reels",
                        reelId
                    ),
                    function (snapshot) {

                        if (
                            snapshot.exists()
                        ) {

                            const data =
                                snapshot.data();


                            counter.textContent =
                                Number(
                                    data.likesCount ||
                                    0
                                );

                        } else {

                            counter.textContent =
                                "0";

                        }

                    },
                    function (error) {

                        console.error(
                            "Like listener error:",
                            error
                        );

                    }
                );


                const user =
                    auth.currentUser;


                if (!user) {

                    return;

                }


                getDoc(
                    doc(
                        db,
                        "reels",
                        reelId,
                        "likes",
                        user.uid
                    )
                )
                    .then(
                        function (snapshot) {

                            const liked =
                                snapshot.exists();


                            button.classList.toggle(
                                "liked",
                                liked
                            );


                            const icon =
                                button.querySelector(
                                    "i"
                                );


                            if (icon) {

                                icon.classList.toggle(
                                    "fa-solid",
                                    liked
                                );

                                icon.classList.toggle(
                                    "fa-regular",
                                    !liked
                                );

                            }

                        }
                    )
                    .catch(
                        function (error) {

                            console.error(
                                "Load like state error:",
                                error
                            );

                        }
                    );

            }
        );

}


/* =====================================================
   SAVE REELS
===================================================== */

function initializeSaves() {

    const buttons =
        document.querySelectorAll(
            ".save-button"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function (event) {

                    event.stopPropagation();


                    const user =
                        auth.currentUser;


                    if (!user) {

                        showAuth();

                        return;

                    }


                    const reel =
                        button.closest(
                            ".reel"
                        );


                    if (!reel) {

                        return;

                    }


                    const reelId =
                        reel.dataset.reel;


                    if (!reelId) {

                        return;

                    }


                    if (
                        button.dataset.processing ===
                        "true"
                    ) {

                        return;

                    }


                    button.dataset.processing =
                        "true";


                    const wasSaved =
                        button.classList.contains(
                            "saved"
                        );


                    const newSaved =
                        !wasSaved;


                    button.classList.toggle(
                        "saved",
                        newSaved
                    );


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    if (icon) {

                        icon.classList.toggle(
                            "fa-solid",
                            newSaved
                        );

                        icon.classList.toggle(
                            "fa-regular",
                            !newSaved
                        );

                    }


                    try {

                        const reference =
                            doc(
                                db,
                                "users",
                                user.uid,
                                "saved",
                                reelId
                            );


                        if (newSaved) {

                            await setDoc(
                                reference,
                                {

                                    reelId:
                                        reelId,

                                    video:
                                        reel.dataset.video ||
                                        reel.querySelector(
                                            ".reel-video"
                                        )?.getAttribute(
                                            "src"
                                        ) ||
                                        "",

                                    savedAt:
                                        serverTimestamp()

                                }
                            );

                        } else {

                            await deleteDoc(
                                reference
                            );

                        }


                        await loadSavedPosts();

                    } catch (error) {

                        console.error(
                            "Save error:",
                            error
                        );


                        button.classList.toggle(
                            "saved",
                            wasSaved
                        );


                        if (icon) {

                            icon.classList.toggle(
                                "fa-solid",
                                wasSaved
                            );

                            icon.classList.toggle(
                                "fa-regular",
                                !wasSaved
                            );

                        }

                    } finally {

                        button.dataset.processing =
                            "false";

                    }

                }
            );

        }
    );


    loadSaveStates();

}


/* =====================================================
   LOAD SAVE STATES
===================================================== */

async function loadSaveStates() {

    const user =
        auth.currentUser;


    if (!user) {

        return;

    }


    const reels =
        document.querySelectorAll(
            ".reel"
        );


    for (const reel of reels) {

        const reelId =
            reel.dataset.reel;


        const button =
            reel.querySelector(
                ".save-button"
            );


        if (
            !reelId ||
            !button
        ) {

            continue;

        }


        try {

            const snapshot =
                await getDoc(
                    doc(
                        db,
                        "users",
                        user.uid,
                        "saved",
                        reelId
                    )
                );


            const saved =
                snapshot.exists();


            button.classList.toggle(
                "saved",
                saved
            );


            const icon =
                button.querySelector(
                    "i"
                );


            if (icon) {

                icon.classList.toggle(
                    "fa-solid",
                    saved
                );

                icon.classList.toggle(
                    "fa-regular",
                    !saved
                );

            }

        } catch (error) {

            console.error(
                "Load save state error:",
                error
            );

        }

    }

}


/* =====================================================
   LOAD SAVED REELS IN PROFILE
===================================================== */

async function loadSavedPosts() {

    const user =
        auth.currentUser;


    const container =
        $("#saved-grid");


    if (
        !user ||
        !container
    ) {

        return;

    }


    try {

        const savedCollection =
            collection(
                db,
                "users",
                user.uid,
                "saved"
            );


        const snapshot =
            await getDocs(
                savedCollection
            );


        if (snapshot.empty) {

            container.innerHTML = `

                <div class="empty-saved">

                    <i class="fa-regular fa-bookmark"></i>

                    <p>
                        No saved reels yet.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML =
            "";


        const savedItems =
            [];


        snapshot.forEach(
            function (savedDoc) {

                const data =
                    savedDoc.data();


                savedItems.push({

                    id:
                        savedDoc.id,

                    reelId:
                        data.reelId ||
                        savedDoc.id,

                    video:
                        data.video ||
                        ""

                });

            }
        );


        savedItems.reverse();


        savedItems.forEach(
            function (item) {

                const reel =
                    document.querySelector(
                        `.reel[data-reel="${CSS.escape(item.reelId)}"]`
                    );


                const originalVideo =
                    reel?.querySelector(
                        ".reel-video"
                    );


                const videoSrc =
                    item.video ||
                    reel?.dataset.video ||
                    originalVideo?.getAttribute(
                        "src"
                    ) ||
                    originalVideo?.currentSrc ||
                    "";


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "saved-reel-card";


                card.dataset.reel =
                    item.reelId;


                if (videoSrc) {

                    const video =
                        document.createElement(
                            "video"
                        );


                    video.src =
                        videoSrc;

                    video.muted =
                        true;

                    video.loop =
                        true;

                    video.playsInline =
                        true;

                    video.preload =
                        "metadata";


                    card.appendChild(
                        video
                    );


                    card.addEventListener(
                        "mouseenter",
                        function () {

                            video.play()
                                .catch(
                                    function () {}
                                );

                        }
                    );


                    card.addEventListener(
                        "mouseleave",
                        function () {

                            video.pause();

                            video.currentTime =
                                0;

                        }
                    );

                } else {

                    card.innerHTML = `

                        <div class="saved-placeholder">

                            <i class="fa-solid fa-play"></i>

                        </div>

                    `;

                }


                const overlay =
                    document.createElement(
                        "div"
                    );


                overlay.className =
                    "saved-overlay";


                overlay.innerHTML = `

                    <i class="fa-solid fa-bookmark"></i>

                `;


                card.appendChild(
                    overlay
                );


                card.addEventListener(
                    "click",
                    function () {

                        const home =
                            $("#home");


                        const navItems =
                            document.querySelectorAll(
                                "[data-section]"
                            );


                        document
                            .querySelectorAll(
                                ".page-section"
                            )
                            .forEach(
                                function (section) {

                                    section.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        home?.classList.add(
                            "active"
                        );


                        navItems.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        document
                            .querySelector(
                                '[data-section="home"]'
                            )
                            ?.classList.add(
                                "active"
                            );


                        if (reel) {

                            setTimeout(
                                function () {

                                    reel.scrollIntoView(
                                        {
                                            behavior:
                                                "smooth",

                                            block:
                                                "center"
                                        }
                                    );

                                },
                                100
                            );

                        }

                    }
                );


                container.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Load saved posts error:",
            error
        );


        container.innerHTML = `

            <div class="empty-saved">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <p>
                    Could not load saved reels.
                </p>

            </div>

        `;

    }

}


/* =====================================================
   COMMENTS
===================================================== */

function initializeComments() {

    const commentsScreen =
        $("#comments-screen");

    const commentsList =
        $("#comments-list");

    const commentForm =
        $("#comment-form");

    const commentInput =
        $("#comment-input");

    const commentsBack =
        $("#comments-back");

    const commentVideo =
        $("#comment-video");


    let activeReelId = null;

    let unsubscribeComments = null;


    function commentsRef(reelId) {

        return collection(
            db,
            "reels",
            reelId,
            "comments"
        );

    }


    /*
     * تحديث عداد الكومنتات
     */

    function updateCommentCount(
        reelId,
        count
    ) {

        const reel =
            document.querySelector(
                `.reel[data-reel="${CSS.escape(reelId)}"]`
            );


        if (!reel) return;


        const button =
            reel.querySelector(
                ".comment-button"
            );


        if (!button) return;


        const counter =
            button.querySelector(
                "span"
            );


        if (counter) {

            counter.textContent =
                count;

        }

    }


    /*
     * تحميل عدد الكومنتات لكل Reel
     */

    function initializeCommentCounters() {

        document
            .querySelectorAll(".reel")
            .forEach(
                function (reel) {

                    const reelId =
                        reel.dataset.reel;


                    if (!reelId) return;


                    const button =
                        reel.querySelector(
                            ".comment-button"
                        );


                    if (!button) return;


                    const counter =
                        button.querySelector(
                            "span"
                        );


                    if (!counter) return;


                    const commentsQuery =
                        query(
                            commentsRef(
                                reelId
                            )
                        );


                    onSnapshot(
                        commentsQuery,
                        function (snapshot) {

                            updateCommentCount(
                                reelId,
                                snapshot.size
                            );

                        },
                        function (error) {

                            console.error(
                                "Comment counter error:",
                                error
                            );

                        }
                    );

                }
            );

    }


    async function openComments(reel) {

        const user =
            auth.currentUser;


        if (!user) {

            showAuth();

            return;

        }


        activeReelId =
            reel.dataset.reel;


        const video =
            reel.querySelector(
                ".reel-video"
            );


        if (
            video &&
            commentVideo
        ) {

            commentVideo.src =
                video.currentSrc ||
                video.src;

            commentVideo.muted =
                true;


            commentVideo.play()
                .catch(
                    function () {}
                );

        }


        /*
         * إلغاء listener القديم
         */

        if (
            unsubscribeComments
        ) {

            unsubscribeComments();

            unsubscribeComments =
                null;

        }


        /*
         * Query الكومنتات
         */

        const commentsQuery =
            query(
                commentsRef(
                    activeReelId
                ),
                orderBy(
                    "createdAt",
                    "asc"
                )
            );


        /*
         * Realtime comments
         */

        unsubscribeComments =
            onSnapshot(
                commentsQuery,

                function (snapshot) {

                    if (!commentsList) {

                        return;

                    }


                    commentsList.innerHTML =
                        "";


                    /*
                     * تحديث العداد فورًا
                     */

                    updateCommentCount(
                        activeReelId,
                        snapshot.size
                    );


                    /*
                     * مفيش كومنتات
                     */

                    if (
                        snapshot.empty
                    ) {

                        commentsList.innerHTML = `

                            <div class="no-comments">

                                <i class="fa-regular fa-comment"></i>

                                <p>
                                    No comments yet.
                                </p>

                            </div>

                        `;

                        return;

                    }


                    /*
                     * عرض الكومنتات
                     */

                    snapshot.forEach(
                        function (commentDoc) {

                            const data =
                                commentDoc.data();


                            const item =
                                document.createElement(
                                    "div"
                                );


                            item.className =
                                "comment-item";


                            item.innerHTML = `

                                <div class="comment-avatar">

                                    ${escapeHTML(
                                        (
                                            data.username ||
                                            "U"
                                        )
                                            .charAt(0)
                                            .toUpperCase()
                                    )}

                                </div>


                                <div class="comment-body">

                                    <strong>
                                        ${escapeHTML(
                                            data.username ||
                                            "User"
                                        )}
                                    </strong>

                                    <p>
                                        ${escapeHTML(
                                            data.text ||
                                            ""
                                        )}
                                    </p>

                                </div>

                            `;


                            commentsList.appendChild(
                                item
                            );

                        }
                    );

                },

                function (error) {

                    console.error(
                        "Comments listener error:",
                        error
                    );

                }
            );


        /*
         * إظهار شاشة الكومنتات
         */

        commentsScreen?.classList.add(
            "show"
        );

    }


    /*
     * فتح الكومنتات
     */

    document
        .querySelectorAll(
            ".comment-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();


                        const reel =
                            button.closest(
                                ".reel"
                            );


                        if (reel) {

                            openComments(
                                reel
                            );

                        }

                    }
                );

            }
        );


    /*
     * زر الرجوع
     */

    commentsBack?.addEventListener(
        "click",
        function () {

            commentsScreen?.classList.remove(
                "show"
            );


            if (commentVideo) {

                commentVideo.pause();

                commentVideo.removeAttribute(
                    "src"
                );

                commentVideo.load();

            }


            if (
                unsubscribeComments
            ) {

                unsubscribeComments();

                unsubscribeComments =
                    null;

            }


            activeReelId =
                null;

        }
    );


    /*
     * إضافة كومنت
     */

    commentForm?.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                showAuth();

                return;

            }


            if (
                !commentInput ||
                !activeReelId
            ) {

                return;

            }


            const text =
                commentInput.value.trim();


            if (!text) {

                return;

            }


            if (text.length > 300) {

                return;

            }


            try {

                const storedUser =
                    getStoredUser();


                /*
                 * إضافة الكومنت إلى Firestore
                 */

                await addDoc(
                    commentsRef(
                        activeReelId
                    ),
                    {

                        uid:
                            user.uid,

                        username:
                            storedUser?.username ||
                            user.email?.split("@")[0] ||
                            "User",

                        text:
                            text,

                        createdAt:
                            serverTimestamp()

                    }
                );


                /*
                 * تفريغ خانة الكتابة
                 */

                commentInput.value =
                    "";

            } catch (error) {

                console.error(
                    "Comment error:",
                    error
                );

            }

        }
    );


    /*
     * تشغيل عدادات الكومنتات
     */

    initializeCommentCounters();

}


/* =====================================================
   START
===================================================== */

console.log(
    "AWH Reals loaded successfully."
);


/* =====================================================
   RESET REEL WHEN LEAVING IT
===================================================== */

const reelObserver = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            const video = entry.target.querySelector(".reel-video");

            if (!video) return;

            if (entry.isIntersecting) {

                // دخل الريل
                video.currentTime = 0;

                video.play().catch(() => {});

            } else {

                // خرج من الريل
                video.pause();

                // لما ترجع له يبدأ من الأول
                video.currentTime = 0;
            }

        });

    },
    {
        threshold: 0.75
    }
);


/* =====================================================
   OBSERVE ALL REELS
===================================================== */

function observeReels() {

    document.querySelectorAll(".reel").forEach((reel) => {

        reelObserver.observe(reel);

    });

}


/* =====================================================
   START
===================================================== */

observeReels();
