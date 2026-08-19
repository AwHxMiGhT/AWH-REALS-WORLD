import {

    auth,
    db,

    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,

    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    deleteDoc,
    runTransaction

} from "./firebase-config.js";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        "use strict";


        console.log(
            "AWH Reals - JavaScript Loaded"
        );


        /* =====================================================
           AUTH ELEMENTS
        ===================================================== */

        const loginForm =
            document.getElementById(
                "login-form"
            );


        const registerForm =
            document.getElementById(
                "register-form"
            );


        const showRegister =
            document.getElementById(
                "show-register"
            );


        const showLogin =
            document.getElementById(
                "show-login"
            );


        const loginMessage =
            document.getElementById(
                "login-message"
            );


        const registerMessage =
            document.getElementById(
                "register-message"
            );


        /* =====================================================
           LOCAL PROFILE SESSION
        ===================================================== */

        function getCurrentUser() {

            try {

                return JSON.parse(
                    localStorage.getItem(
                        "awh_current_user"
                    )
                );

            } catch (error) {

                console.error(
                    "Could not read current user:",
                    error
                );

                return null;

            }

        }


        function setCurrentUser(user) {

            localStorage.setItem(
                "awh_current_user",
                JSON.stringify(user)
            );

        }


        function clearCurrentUser() {

            localStorage.removeItem(
                "awh_current_user"
            );

        }


        /* =====================================================
           AUTH PAGE SWITCH
        ===================================================== */

        if (
            showRegister &&
            loginForm &&
            registerForm
        ) {

            showRegister.addEventListener(
                "click",
                function () {

                    loginForm.classList.add(
                        "hidden"
                    );

                    showRegister.classList.add(
                        "hidden"
                    );

                    registerForm.classList.remove(
                        "hidden"
                    );

                    if (loginMessage) {

                        loginMessage.textContent =
                            "";

                    }

                }
            );

        }


        if (
            showLogin &&
            loginForm &&
            registerForm
        ) {

            showLogin.addEventListener(
                "click",
                function () {

                    registerForm.classList.add(
                        "hidden"
                    );

                    loginForm.classList.remove(
                        "hidden"
                    );

                    if (registerMessage) {

                        registerMessage.textContent =
                            "";

                    }

                    if (showRegister) {

                        showRegister.classList.remove(
                            "hidden"
                        );

                    }

                }
            );

        }


        /* =====================================================
           USERNAME VALIDATION
        ===================================================== */

        function isValidUsername(username) {

            const usernameRegex =
                /^[a-zA-Z0-9_]{3,20}$/;

            return usernameRegex.test(
                username
            );

        }


        function usernameToEmail(username) {

            return (
                username.toLowerCase() +
                "@awhreals.com"
            );

        }


        /* =====================================================
           LOGIN
        ===================================================== */

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    const usernameInput =
                        document.getElementById(
                            "login-username"
                        );


                    const passwordInput =
                        document.getElementById(
                            "login-password"
                        );


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


                    if (
                        !isValidUsername(
                            username
                        )
                    ) {

                        if (loginMessage) {

                            loginMessage.style.color =
                                "#ff4444";

                            loginMessage.textContent =
                                "Invalid username.";

                        }

                        return;

                    }


                    if (!password) {

                        if (loginMessage) {

                            loginMessage.style.color =
                                "#ff4444";

                            loginMessage.textContent =
                                "Please enter your password.";

                        }

                        return;

                    }


                    const email =
                        usernameToEmail(
                            username
                        );


                    try {

                        if (loginMessage) {

                            loginMessage.style.color =
                                "";

                            loginMessage.textContent =
                                "Logging in...";

                        }


                        const userCredential =
                            await signInWithEmailAndPassword(
                                auth,
                                email,
                                password
                            );


                        const user =
                            userCredential.user;


                        const userRef =
                            doc(
                                db,
                                "users",
                                user.uid
                            );


                        const userSnapshot =
                            await getDoc(
                                userRef
                            );


                        let userData = {};


                        if (
                            userSnapshot.exists()
                        ) {

                            userData =
                                userSnapshot.data();

                        }


                        const currentUser = {

                            ...userData,

                            username:
                                userData.username ||
                                username,

                            name:
                                userData.name ||
                                username,

                            bio:
                                userData.bio ||
                                "Welcome to AWH Reals World 🔥",

                            email:
                                user.email,

                            uid:
                                user.uid,

                            guest:
                                false

                        };


                        setCurrentUser(
                            currentUser
                        );


                        if (loginMessage) {

                            loginMessage.style.color =
                                "#00ff88";

                            loginMessage.textContent =
                                "Login successful!";

                        }


                        setTimeout(
                            function () {

                                window.location.href =
                                    "index.html";

                            },
                            500
                        );


                    } catch (error) {

                        console.error(
                            "Firebase login error:",
                            error
                        );


                        if (loginMessage) {

                            loginMessage.style.color =
                                "#ff4444";


                            switch (
                                error.code
                            ) {

                                case "auth/invalid-credential":

                                    loginMessage.textContent =
                                        "Wrong username or password.";

                                    break;


                                case "auth/user-not-found":

                                    loginMessage.textContent =
                                        "Username does not exist.";

                                    break;


                                case "auth/wrong-password":

                                    loginMessage.textContent =
                                        "Wrong password.";

                                    break;


                                case "auth/too-many-requests":

                                    loginMessage.textContent =
                                        "Too many attempts. Please try again later.";

                                    break;


                                case "auth/network-request-failed":

                                    loginMessage.textContent =
                                        "Network error. Check your internet connection.";

                                    break;


                                case "auth/user-disabled":

                                    loginMessage.textContent =
                                        "This account has been disabled.";

                                    break;


                                default:

                                    loginMessage.textContent =
                                        error.message ||
                                        "Something went wrong. Please try again.";

                            }

                        }

                    }

                }
            );

        }


        /* =====================================================
           CREATE ACCOUNT
        ===================================================== */

        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    const usernameInput =
                        document.getElementById(
                            "register-username"
                        );


                    const passwordInput =
                        document.getElementById(
                            "register-password"
                        );


                    const confirmInput =
                        document.getElementById(
                            "register-confirm"
                        );


                    if (
                        !usernameInput ||
                        !passwordInput ||
                        !confirmInput
                    ) {

                        if (registerMessage) {

                            registerMessage.style.color =
                                "#ff4444";

                            registerMessage.textContent =
                                "Registration form is missing required fields.";

                        }

                        return;

                    }


                    const username =
                        usernameInput.value.trim();


                    const password =
                        passwordInput.value;


                    const confirmPassword =
                        confirmInput.value;


                    if (
                        !isValidUsername(
                            username
                        )
                    ) {

                        if (registerMessage) {

                            registerMessage.style.color =
                                "#ff4444";

                            registerMessage.textContent =
                                "Username can only contain letters, numbers, and underscores.";

                        }

                        return;

                    }


                    if (
                        password.length < 6
                    ) {

                        if (registerMessage) {

                            registerMessage.style.color =
                                "#ff4444";

                            registerMessage.textContent =
                                "Password must be at least 6 characters.";

                        }

                        return;

                    }


                    if (
                        password !==
                        confirmPassword
                    ) {

                        if (registerMessage) {

                            registerMessage.style.color =
                                "#ff4444";

                            registerMessage.textContent =
                                "Passwords do not match.";

                        }

                        return;

                    }


                    const email =
                        usernameToEmail(
                            username
                        );


                    try {

                        if (registerMessage) {

                            registerMessage.style.color =
                                "";

                            registerMessage.textContent =
                                "Creating account...";

                        }


                        const userCredential =
                            await createUserWithEmailAndPassword(
                                auth,
                                email,
                                password
                            );


                        const user =
                            userCredential.user;


                        const userData = {

                            username:
                                username,

                            name:
                                username,

                            bio:
                                "Welcome to AWH Reals World 🔥",

                            email:
                                email,

                            uid:
                                user.uid,

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


                        setCurrentUser({

                            ...userData,

                            guest:
                                false

                        });


                        if (registerMessage) {

                            registerMessage.style.color =
                                "#00ff88";

                            registerMessage.textContent =
                                "Account created successfully!";

                        }


                        setTimeout(
                            function () {

                                window.location.href =
                                    "index.html";

                            },
                            700
                        );


                    } catch (error) {

                        console.error(
                            "Firebase registration error:",
                            error
                        );


                        if (registerMessage) {

                            registerMessage.style.color =
                                "#ff4444";


                            switch (
                                error.code
                            ) {

                                case "auth/email-already-in-use":

                                    registerMessage.textContent =
                                        "Username already exists.";

                                    break;


                                case "auth/invalid-email":

                                    registerMessage.textContent =
                                        "Invalid username.";

                                    break;


                                case "auth/weak-password":

                                    registerMessage.textContent =
                                        "Password is too weak.";

                                    break;


                                case "auth/operation-not-allowed":

                                    registerMessage.textContent =
                                        "Email/Password authentication is not enabled in Firebase.";

                                    break;


                                case "auth/network-request-failed":

                                    registerMessage.textContent =
                                        "Network error. Check your internet connection.";

                                    break;


                                default:

                                    registerMessage.textContent =
                                        error.message ||
                                        "Something went wrong. Please try again.";

                            }

                        }

                    }

                }
            );

        }


        /* =====================================================
           REELS
        ===================================================== */

        const videos =
            Array.from(
                document.querySelectorAll(
                    ".reel-video"
                )
            );


        const feed =
            document.querySelector(
                ".feed"
            );


        const reels =
            Array.from(
                document.querySelectorAll(
                    ".reel"
                )
            );


        if (
            !videos.length ||
            !feed
        ) {

            console.log(
                "No reels found."
            );

            return;

        }


        /* =====================================================
           LOCAL USER
        ===================================================== */

        let currentUser =
            getCurrentUser();


        let firebaseUser =
            auth.currentUser;


        /* =====================================================
           VIDEO SETTINGS
        ===================================================== */

        videos.forEach(
            function (video) {

                video.muted =
                    true;

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

            }
        );


        /* =====================================================
           VIDEO CONTROL
        ===================================================== */

        let userInteracted =
            false;


        let currentVideo =
            null;


        let firstScrollDone =
            false;


        function stopVideo(video) {

            if (!video) {
                return;
            }


            try {

                video.pause();

                video.currentTime =
                    0;

            } catch (error) {

                console.log(
                    "Video stop error:",
                    error
                );

            }

        }


        async function playVideo(video) {

            if (!video) {
                return;
            }


            videos.forEach(
                function (other) {

                    if (
                        other !==
                        video
                    ) {

                        stopVideo(
                            other
                        );

                    }

                }
            );


            currentVideo =
                video;


            video.muted =
                !userInteracted;


            video.volume =
                1;


            try {

                await video.play();

            } catch (error) {

                video.muted =
                    true;


                try {

                    await video.play();

                } catch (secondError) {

                    console.log(
                        "Video play failed:",
                        secondError
                    );

                }

            }

        }


        function handleFirstScroll() {

            if (firstScrollDone) {
                return;
            }


            firstScrollDone =
                true;


            userInteracted =
                true;


            if (currentVideo) {

                currentVideo.muted =
                    false;

                currentVideo.volume =
                    1;


                currentVideo
                    .play()
                    .catch(
                        function () {}
                    );

            }

        }


        feed.addEventListener(
            "scroll",
            handleFirstScroll,
            {
                passive: true,
                once: true
            }
        );


        const observer =
            new IntersectionObserver(
                function (entries) {

                    entries.forEach(
                        function (entry) {

                            const video =
                                entry.target;


                            if (
                                entry.isIntersecting &&
                                entry.intersectionRatio >=
                                    0.65
                            ) {

                                playVideo(
                                    video
                                );

                            } else {

                                stopVideo(
                                    video
                                );

                            }

                        }
                    );

                },
                {
                    threshold: [
                        0,
                        0.65,
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


        playVideo(
            videos[0]
        );


        /* =====================================================
           FAST SCROLL
        ===================================================== */

        let scrollTimer =
            null;


        feed.addEventListener(
            "scroll",
            function () {

                clearTimeout(
                    scrollTimer
                );


                scrollTimer =
                    setTimeout(
                        function () {

                            let closestVideo =
                                null;


                            let closestDistance =
                                Infinity;


                            videos.forEach(
                                function (video) {

                                    const rect =
                                        video.getBoundingClientRect();


                                    const center =
                                        rect.top +
                                        rect.height / 2;


                                    const viewportCenter =
                                        window.innerHeight / 2;


                                    const distance =
                                        Math.abs(
                                            center -
                                            viewportCenter
                                        );


                                    if (
                                        distance <
                                        closestDistance
                                    ) {

                                        closestDistance =
                                            distance;

                                        closestVideo =
                                            video;

                                    }

                                }
                            );


                            if (
                                closestVideo
                            ) {

                                playVideo(
                                    closestVideo
                                );

                            }

                        },
                        40
                    );

            },
            {
                passive: true
            }
        );


        videos.forEach(
            function (video) {

                video.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();


                        userInteracted =
                            true;


                        if (
                            video.paused
                        ) {

                            video.muted =
                                false;

                            video.volume =
                                1;


                            playVideo(
                                video
                            );

                        } else {

                            video.pause();

                        }

                    }
                );

            }
        );


        /* =====================================================
           USER PROFILE FALLBACK
        ===================================================== */

        if (!currentUser) {

            currentUser = {

                username:
                    firebaseUser?.email
                        ?.split("@")[0] ||
                    "user",

                name:
                    "User",

                bio:
                    "Welcome to AWH Reals World 🔥",

                uid:
                    firebaseUser?.uid ||
                    null,

                guest:
                    false

            };

        }


        /* =====================================================
           FIRESTORE HELPERS
        ===================================================== */

        function getReelRef(reelId) {

            return doc(
                db,
                "reels",
                reelId
            );

        }


        function getLikeRef(
            reelId,
            uid
        ) {

            return doc(
                db,
                "reels",
                reelId,
                "likes",
                uid
            );

        }


        function getSaveRef(
            uid,
            reelId
        ) {

            return doc(
                db,
                "users",
                uid,
                "saved",
                reelId
            );

        }


        function getCommentCollection(
            reelId
        ) {

            return collection(
                db,
                "reels",
                reelId,
                "comments"
            );

        }


        /* =====================================================
           INITIALIZE REEL
        ===================================================== */

        async function initializeReel(
            reel
        ) {

            if (!reel) {
                return;
            }


            const reelId =
                reel.dataset.reel;


            if (!reelId) {
                return;
            }


            const reelRef =
                getReelRef(
                    reelId
                );


            try {

                const snapshot =
                    await getDoc(
                        reelRef
                    );


                /*
                 * IMPORTANT:
                 * Do NOT reset likesCount
                 * every time the page opens.
                 */

                if (
                    !snapshot.exists()
                ) {

                    await setDoc(
                        reelRef,
                        {
                            reelId:
                                reelId,

                            likesCount:
                                0
                        }
                    );

                }

            } catch (error) {

                console.error(
                    "Could not initialize reel:",
                    error
                );

            }

        }


        /* =====================================================
           LOAD LIKE COUNT
        ===================================================== */

        async function loadLikeCount(
            reel
        ) {

            if (!reel) {
                return;
            }


            const reelId =
                reel.dataset.reel;


            const countElement =
                reel.querySelector(
                    ".like-button span"
                );


            if (
                !reelId ||
                !countElement
            ) {

                return;

            }


            try {

                const snapshot =
                    await getDoc(
                        getReelRef(
                            reelId
                        )
                    );


                if (
                    snapshot.exists()
                ) {

                    const data =
                        snapshot.data();


                    countElement.textContent =
                        Number(
                            data.likesCount ||
                            0
                        );

                } else {

                    countElement.textContent =
                        "0";

                }

            } catch (error) {

                console.error(
                    "Like count error:",
                    error
                );

            }

        }


        /* =====================================================
           CHECK USER LIKE
        ===================================================== */

        async function checkUserLike(
            reel
        ) {

            if (
                !reel ||
                !firebaseUser
            ) {

                return;

            }


            const reelId =
                reel.dataset.reel;


            const button =
                reel.querySelector(
                    ".like-button"
                );


            if (
                !reelId ||
                !button
            ) {

                return;

            }


            try {

                const snapshot =
                    await getDoc(
                        getLikeRef(
                            reelId,
                            firebaseUser.uid
                        )
                    );


                button.classList.toggle(
                    "liked",
                    snapshot.exists()
                );

            } catch (error) {

                console.error(
                    "Could not check like:",
                    error
                );

            }

        }


        /* =====================================================
           LIKE / UNLIKE
        ===================================================== */

        async function toggleLike(
            reel,
            button
        ) {

            if (!firebaseUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            const reelId =
                reel.dataset.reel;


            if (!reelId) {
                return;
            }


            /*
             * Prevent double-click
             */

            if (
                button.dataset.processing ===
                "true"
            ) {

                return;

            }


            button.dataset.processing =
                "true";


            const likeRef =
                getLikeRef(
                    reelId,
                    firebaseUser.uid
                );


            const reelRef =
                getReelRef(
                    reelId
                );


            const countElement =
                button.querySelector(
                    "span"
                );


            /*
             * Remember current UI state.
             * This lets the interface react immediately.
             */

            const wasLiked =
                button.classList.contains(
                    "liked"
                );


            const oldCount =
                parseInt(
                    countElement?.textContent
                ) || 0;


            const newLiked =
                !wasLiked;


            const optimisticCount =
                Math.max(
                    0,
                    oldCount +
                    (
                        newLiked
                            ? 1
                            : -1
                    )
                );


            /*
             * INSTANT UI UPDATE
             */

            button.classList.toggle(
                "liked",
                newLiked
            );


            if (countElement) {

                countElement.textContent =
                    optimisticCount;

            }


            try {

                /*
                 * Use transaction so two users
                 * cannot incorrectly overwrite
                 * the same like count.
                 */

                await runTransaction(
                    db,
                    async function (
                        transaction
                    ) {

                        const reelSnapshot =
                            await transaction.get(
                                reelRef
                            );


                        const likeSnapshot =
                            await transaction.get(
                                likeRef
                            );


                        let likesCount =
                            0;


                        if (
                            reelSnapshot.exists()
                        ) {

                            likesCount =
                                Number(
                                    reelSnapshot
                                        .data()
                                        .likesCount ||
                                    0
                                );

                        }


                        /*
                         * If the like document
                         * exists -> unlike.
                         */

                        if (
                            likeSnapshot.exists()
                        ) {

                            likesCount =
                                Math.max(
                                    0,
                                    likesCount -
                                    1
                                );


                            transaction.delete(
                                likeRef
                            );


                        } else {

                            /*
                             * Otherwise -> like.
                             */

                            likesCount +=
                                1;


                            transaction.set(
                                likeRef,
                                {
                                    uid:
                                        firebaseUser.uid,

                                    createdAt:
                                        serverTimestamp()
                                }
                            );

                        }


                        transaction.set(
                            reelRef,
                            {
                                reelId:
                                    reelId,

                                likesCount:
                                    likesCount
                            },
                            {
                                merge:
                                    true
                            }
                        );

                    }
                );


            } catch (error) {

                console.error(
                    "Like error:",
                    error
                );


                /*
                 * Firebase failed.
                 * Restore previous UI.
                 */

                button.classList.toggle(
                    "liked",
                    wasLiked
                );


                if (countElement) {

                    countElement.textContent =
                        oldCount;

                }


                alert(
                    "Could not update like. Please try again."
                );

            } finally {

                button.dataset.processing =
                    "false";

            }

        }


        /* =====================================================
           LIKE REALTIME COUNTERS
        ===================================================== */

        reels.forEach(
            function (reel) {

                const reelId =
                    reel.dataset.reel;


                const countElement =
                    reel.querySelector(
                        ".like-button span"
                    );


                if (
                    !reelId ||
                    !countElement
                ) {

                    return;

                }


                onSnapshot(
                    getReelRef(
                        reelId
                    ),
                    function (
                        snapshot
                    ) {

                        if (
                            !snapshot.exists()
                        ) {

                            return;

                        }


                        const data =
                            snapshot.data();


                        /*
                         * Don't wait for another
                         * button click.
                         * Firestore updates the count
                         * live.
                         */

                        countElement.textContent =
                            Number(
                                data.likesCount ||
                                0
                            );

                    },
                    function (error) {

                        console.error(
                            "Realtime like counter error:",
                            error
                        );

                    }
                );

            }
        );


        /* =====================================================
           SETUP REELS
        ===================================================== */

        reels.forEach(
            async function (reel) {

                await initializeReel(
                    reel
                );

                await loadLikeCount(
                    reel
                );

            }
        );


        /* =====================================================
           LIKE BUTTONS
        ===================================================== */

        document
            .querySelectorAll(
                ".like-button"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        async function (
                            event
                        ) {

                            event.stopPropagation();


                            const reel =
                                button.closest(
                                    ".reel"
                                );


                            if (!reel) {
                                return;
                            }


                            await toggleLike(
                                reel,
                                button
                            );

                        }
                    );

                }
            );


        /* =====================================================
           SAVES
        ===================================================== */

        const saveButtons =
            document.querySelectorAll(
                ".save-button"
            );


        async function checkSaved(
            reel,
            button
        ) {

            if (
                !firebaseUser ||
                !reel ||
                !button
            ) {

                return;

            }


            const reelId =
                reel.dataset.reel;


            if (!reelId) {
                return;
            }


            try {

                const snapshot =
                    await getDoc(
                        getSaveRef(
                            firebaseUser.uid,
                            reelId
                        )
                    );


                button.classList.toggle(
                    "saved",
                    snapshot.exists()
                );

            } catch (error) {

                console.error(
                    "Save check error:",
                    error
                );

            }

        }


        async function toggleSave(
            reel,
            button
        ) {

            if (!firebaseUser) {

                alert(
                    "Please login first."
                );

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


            const saveRef =
                getSaveRef(
                    firebaseUser.uid,
                    reelId
                );


            const wasSaved =
                button.classList.contains(
                    "saved"
                );


            /*
             * INSTANT UI UPDATE
             */

            button.classList.toggle(
                "saved",
                !wasSaved
            );


            try {

                const snapshot =
                    await getDoc(
                        saveRef
                    );


                if (
                    snapshot.exists()
                ) {

                    await deleteDoc(
                        saveRef
                    );


                    button.classList.remove(
                        "saved"
                    );

                } else {

                    await setDoc(
                        saveRef,
                        {
                            reelId:
                                reelId,

                            savedAt:
                                serverTimestamp()
                        }
                    );


                    button.classList.add(
                        "saved"
                    );

                }

            } catch (error) {

                console.error(
                    "Save error:",
                    error
                );


                /*
                 * Restore old UI
                 */

                button.classList.toggle(
                    "saved",
                    wasSaved
                );


                alert(
                    "Could not update save. Please try again."
                );

            } finally {

                button.dataset.processing =
                    "false";

            }

        }


        saveButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    async function (
                        event
                    ) {

                        event.stopPropagation();


                        const reel =
                            button.closest(
                                ".reel"
                            );


                        if (!reel) {
                            return;
                        }


                        await toggleSave(
                            reel,
                            button
                        );

                    }
                );

            }
        );


        /* =====================================================
           SAVED REELS
        ===================================================== */

        let unsubscribeSavedReels =
            null;


        function renderSavedReels() {

            const savedGrid =
                document.getElementById(
                    "saved-grid"
                );


            if (
                !savedGrid ||
                !firebaseUser
            ) {

                return;

            }


            /*
             * IMPORTANT:
             * Remove previous listener.
             */

            if (
                unsubscribeSavedReels
            ) {

                unsubscribeSavedReels();

                unsubscribeSavedReels =
                    null;

            }


            const savedRef =
                collection(
                    db,
                    "users",
                    firebaseUser.uid,
                    "saved"
                );


            unsubscribeSavedReels =
                onSnapshot(
                    savedRef,
                    function (
                        snapshot
                    ) {

                        savedGrid.innerHTML =
                            "";


                        if (
                            snapshot.empty
                        ) {

                            savedGrid.innerHTML = `

                                <div class="empty-saved">

                                    <i class="fa-regular fa-bookmark"></i>

                                    <p>
                                        No saved reels yet.
                                    </p>

                                </div>

                            `;

                            return;

                        }


                        snapshot.forEach(
                            function (
                                savedDoc
                            ) {

                                const reelId =
                                    savedDoc.id;


                                const reel =
                                    document.querySelector(
                                        `.reel[data-reel="${reelId}"]`
                                    );


                                if (!reel) {
                                    return;
                                }


                                const originalVideo =
                                    reel.querySelector(
                                        ".reel-video"
                                    );


                                if (
                                    !originalVideo
                                ) {

                                    return;

                                }


                                const card =
                                    document.createElement(
                                        "div"
                                    );


                                card.className =
                                    "profile-reel";


                                const video =
                                    document.createElement(
                                        "video"
                                    );


                                video.src =
                                    originalVideo.currentSrc ||
                                    originalVideo.src;


                                video.muted =
                                    true;


                                video.playsInline =
                                    true;


                                video.preload =
                                    "metadata";


                                const icon =
                                    document.createElement(
                                        "i"
                                    );


                                icon.className =
                                    "fa-solid fa-bookmark";


                                card.appendChild(
                                    video
                                );


                                card.appendChild(
                                    icon
                                );


                                card.addEventListener(
                                    "click",
                                    function () {

                                        document
                                            .querySelector(
                                                '[data-section="home"]'
                                            )
                                            ?.click();


                                        setTimeout(
                                            function () {

                                                reel.scrollIntoView(
                                                    {
                                                        behavior:
                                                            "smooth"
                                                    }
                                                );

                                            },
                                            100
                                        );

                                    }
                                );


                                savedGrid.appendChild(
                                    card
                                );

                            }
                        );

                    },
                    function (error) {

                        console.error(
                            "Saved reels realtime error:",
                            error
                        );

                    }
                );

        }


        /* =====================================================
           COMMENTS ELEMENTS
        ===================================================== */

        let activeReelId =
            null;


        const commentsScreen =
            document.getElementById(
                "comments-screen"
            );


        const commentsList =
            document.getElementById(
                "comments-list"
            );


        const commentVideo =
            document.getElementById(
                "comment-video"
            );


        const commentForm =
            document.getElementById(
                "comment-form"
            );


        const commentInput =
            document.getElementById(
                "comment-input"
            );


        let unsubscribeComments =
            null;


        /*
         * Store comment count listeners
         * so they don't duplicate.
         */

        const commentCountUnsubscribers =
            [];


        /* =====================================================
           ESCAPE HTML
        ===================================================== */

        function escapeHTML(
            value
        ) {

            return String(value)

                .replace(
                    /&/g,
                    "&amp;"
                )

                .replace(
                    /</g,
                    "&lt;"
                )

                .replace(
                    />/g,
                    "&gt;"
                )

                .replace(
                    /"/g,
                    "&quot;"
                )

                .replace(
                    /'/g,
                    "&#039;"
                );

        }


        /* =====================================================
           COMMENT COUNT
        ===================================================== */

        function listenToCommentCount(
            reel
        ) {

            if (!reel) {
                return;
            }


            const reelId =
                reel.dataset.reel;


            if (!reelId) {
                return;
            }


            const commentButton =
                reel.querySelector(
                    ".comment-button"
                );


            if (!commentButton) {
                return;
            }


            /*
             * Your HTML already has a span
             * inside the button.
             */

            const countElement =
                commentButton.querySelector(
                    "span"
                );


            if (!countElement) {
                return;
            }


            const commentsRef =
                getCommentCollection(
                    reelId
                );


            const unsubscribe =
                onSnapshot(
                    commentsRef,
                    function (
                        snapshot
                    ) {

                        countElement.textContent =
                            snapshot.size;

                    },
                    function (error) {

                        console.error(
                            "Comment count error:",
                            error
                        );

                    }
                );


            commentCountUnsubscribers.push(
                unsubscribe
            );

        }


        reels.forEach(
            function (reel) {

                listenToCommentCount(
                    reel
                );

            }
        );


        /* =====================================================
           RENDER COMMENTS
        ===================================================== */

        function renderComments(
            comments
        ) {

            if (!commentsList) {
                return;
            }


            commentsList.innerHTML =
                "";


            if (!comments.length) {

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


            comments.forEach(
                function (
                    comment
                ) {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "comment-item";


                    const replies =
                        Array.isArray(
                            comment.replies
                        )
                            ? comment.replies
                            : [];


                    let repliesHTML =
                        "";


                    if (
                        replies.length
                    ) {

                        repliesHTML =
                            `

                                <div class="replies">

                                    ` +

                            replies
                                .map(
                                    function (
                                        reply
                                    ) {

                                        return `

                                            <div class="reply-item">

                                                <strong>
                                                    ${escapeHTML(
                                                        reply.username ||
                                                        "User"
                                                    )}
                                                </strong>

                                                <span>
                                                    ${escapeHTML(
                                                        reply.text ||
                                                        ""
                                                    )}
                                                </span>

                                            </div>

                                        `;

                                    }
                                )
                                .join(
                                    ""
                                ) +

                            `

                                </div>

                            `;

                    }


                    item.innerHTML = `

                        <div class="comment-avatar">

                            ${escapeHTML(
                                String(
                                    comment.username ||
                                    "U"
                                )
                                    .charAt(0)
                                    .toUpperCase()
                            )}

                        </div>


                        <div class="comment-body">

                            <strong>
                                ${escapeHTML(
                                    comment.username ||
                                    "User"
                                )}
                            </strong>


                            <p>
                                ${escapeHTML(
                                    comment.text ||
                                    ""
                                )}
                            </p>


                            <button
                                class="reply-button"
                                type="button"
                                data-comment-id="${escapeHTML(
                                    comment.id
                                )}">

                                Reply

                            </button>


                            ${repliesHTML}

                        </div>

                    `;


                    commentsList.appendChild(
                        item
                    );

                }
            );


            /*
             * Reply buttons
             */

            commentsList
                .querySelectorAll(
                    ".reply-button"
                )
                .forEach(
                    function (
                        button
                    ) {

                        button.addEventListener(
                            "click",
                            async function () {

                                if (
                                    !firebaseUser
                                ) {

                                    alert(
                                        "Please login first."
                                    );

                                    return;

                                }


                                const commentId =
                                    button.dataset
                                        .commentId;


                                const reply =
                                    prompt(
                                        "Write your reply:"
                                    );


                                if (
                                    !reply
                                ) {

                                    return;

                                }


                                const cleanReply =
                                    reply.trim();


                                if (
                                    !cleanReply
                                ) {

                                    return;

                                }


                                try {

                                    const commentRef =
                                        doc(
                                            db,
                                            "reels",
                                            activeReelId,
                                            "comments",
                                            commentId
                                        );


                                    const snapshot =
                                        await getDoc(
                                            commentRef
                                        );


                                    if (
                                        !snapshot.exists()
                                    ) {

                                        return;

                                    }


                                    const commentData =
                                        snapshot.data();


                                    const replies =
                                        Array.isArray(
                                            commentData.replies
                                        )
                                            ? [
                                                ...commentData.replies
                                            ]
                                            : [];


                                    replies.push({

                                        username:
                                            currentUser.username,

                                        text:
                                            cleanReply,

                                        uid:
                                            firebaseUser.uid,

                                        createdAt:
                                            new Date()
                                                .toISOString()

                                    });


                                    await setDoc(
                                        commentRef,
                                        {
                                            replies:
                                                replies
                                        },
                                        {
                                            merge:
                                                true
                                        }
                                    );


                                } catch (error) {

                                    console.error(
                                        "Reply error:",
                                        error
                                    );


                                    alert(
                                        "Could not add reply."
                                    );

                                }

                            }
                        );

                    }
                );

        }


        /* =====================================================
           REALTIME COMMENTS
        ===================================================== */

        function listenToComments(
            reelId
        ) {

            if (
                unsubscribeComments
            ) {

                unsubscribeComments();

                unsubscribeComments =
                    null;

            }


            if (
                !commentsList ||
                !reelId
            ) {

                return;

            }


            const commentsQuery =
                query(
                    getCommentCollection(
                        reelId
                    ),
                    orderBy(
                        "createdAt",
                        "asc"
                    )
                );


            unsubscribeComments =
                onSnapshot(
                    commentsQuery,
                    function (
                        snapshot
                    ) {

                        const comments =
                            [];


                        snapshot.forEach(
                            function (
                                commentDoc
                            ) {

                                comments.push({

                                    id:
                                        commentDoc.id,

                                    ...commentDoc.data()

                                });

                            }
                        );


                        renderComments(
                            comments
                        );

                    },
                    function (
                        error
                    ) {

                        console.error(
                            "Comments realtime error:",
                            error
                        );


                        if (
                            commentsList
                        ) {

                            commentsList.innerHTML = `

                                <div class="no-comments">

                                    <p>
                                        Could not load comments.
                                    </p>

                                </div>

                            `;

                        }

                    }
                );

        }


        /* =====================================================
           OPEN COMMENTS
        ===================================================== */

        document
            .querySelectorAll(
                ".comment-button"
            )
            .forEach(
                function (
                    button
                ) {

                    button.addEventListener(
                        "click",
                        function (
                            event
                        ) {

                            event.stopPropagation();


                            const reel =
                                button.closest(
                                    ".reel"
                                );


                            if (!reel) {
                                return;
                            }


                            activeReelId =
                                reel.dataset.reel;


                            if (
                                commentVideo
                            ) {

                                const reelVideo =
                                    reel.querySelector(
                                        ".reel-video"
                                    );


                                if (
                                    reelVideo
                                ) {

                                    commentVideo.src =
                                        reelVideo.currentSrc ||
                                        reelVideo.src;


                                    commentVideo.currentTime =
                                        0;


                                    commentVideo.muted =
                                        true;


                                    commentVideo
                                        .play()
                                        .catch(
                                            function () {}
                                        );

                                }

                            }


                            listenToComments(
                                activeReelId
                            );


                            if (
                                commentsScreen
                            ) {

                                commentsScreen.classList.add(
                                    "show"
                                );

                            }

                        }
                    );

                }
            );


        /* =====================================================
           CLOSE COMMENTS
        ===================================================== */

        const commentsBack =
            document.getElementById(
                "comments-back"
            );


        if (
            commentsBack
        ) {

            commentsBack.addEventListener(
                "click",
                function () {

                    if (
                        commentsScreen
                    ) {

                        commentsScreen.classList.remove(
                            "show"
                        );

                    }


                    if (
                        commentVideo
                    ) {

                        commentVideo.pause();

                        commentVideo.src =
                            "";

                    }


                    if (
                        unsubscribeComments
                    ) {

                        unsubscribeComments();

                        unsubscribeComments =
                            null;

                    }

                }
            );

        }


        /* =====================================================
           ADD COMMENT
        ===================================================== */

        if (
            commentForm
        ) {

            commentForm.addEventListener(
                "submit",
                async function (
                    event
                ) {

                    event.preventDefault();


                    if (
                        !firebaseUser
                    ) {

                        alert(
                            "Please login first."
                        );

                        return;

                    }


                    if (
                        !commentInput
                    ) {

                        return;

                    }


                    const text =
                        commentInput.value.trim();


                    if (
                        !text ||
                        !activeReelId
                    ) {

                        return;

                    }


                    /*
                     * Prevent accidental
                     * double submissions.
                     */

                    if (
                        commentForm.dataset
                            .processing ===
                        "true"
                    ) {

                        return;

                    }


                    commentForm.dataset
                        .processing =
                        "true";


                    try {

                        const commentsRef =
                            getCommentCollection(
                                activeReelId
                            );


                        await addDoc(
                            commentsRef,
                            {

                                uid:
                                    firebaseUser.uid,

                                username:
                                    currentUser.username,

                                text:
                                    text,

                                replies:
                                    [],

                                createdAt:
                                    serverTimestamp()

                            }
                        );


                        commentInput.value =
                            "";


                    } catch (error) {

                        console.error(
                            "Add comment error:",
                            error
                        );


                        alert(
                            "Could not add comment. Please try again."
                        );

                    } finally {

                        commentForm.dataset
                            .processing =
                            "false";

                    }

                }
            );

        }


        /* =====================================================
           PROFILE
        ===================================================== */

        const profileName =
            document.getElementById(
                "profile-name"
            );


        const profileUsername =
            document.getElementById(
                "profile-username"
            );


        const profileBio =
            document.getElementById(
                "profile-bio"
            );


        if (
            profileName
        ) {

            profileName.textContent =
                currentUser.name ||
                currentUser.username;

        }


        if (
            profileUsername
        ) {

            profileUsername.textContent =
                "@" +
                currentUser.username;

        }


        if (
            profileBio
        ) {

            profileBio.textContent =
                currentUser.bio ||
                "Welcome to AWH Reals World 🔥";

        }


        /* =====================================================
           NAVIGATION
        ===================================================== */

        const navItems =
            document.querySelectorAll(
                ".nav-item, .add-button"
            );


        const sections =
            document.querySelectorAll(
                ".page-section"
            );


        navItems.forEach(
            function (
                button
            ) {

                button.addEventListener(
                    "click",
                    function () {

                        const sectionId =
                            button.dataset.section;


                        if (!sectionId) {
                            return;
                        }


                        sections.forEach(
                            function (
                                section
                            ) {

                                section.classList.remove(
                                    "active"
                                );

                            }
                        );


                        const target =
                            document.getElementById(
                                sectionId
                            );


                        if (
                            target
                        ) {

                            target.classList.add(
                                "active"
                            );

                        }


                        navItems.forEach(
                            function (
                                item
                            ) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );


                        if (
                            sectionId ===
                            "home"
                        ) {

                            if (
                                videos[0]
                            ) {

                                playVideo(
                                    videos[0]
                                );

                            }

                        } else {

                            videos.forEach(
                                function (
                                    video
                                ) {

                                    stopVideo(
                                        video
                                    );

                                }
                            );

                        }


                        if (
                            sectionId ===
                            "profile"
                        ) {

                            renderSavedReels();

                        }

                    }
                );

            }
        );


        /* =====================================================
           SEARCH
        ===================================================== */

        const searchButton =
            document.getElementById(
                "search-button"
            );


        if (
            searchButton
        ) {

            searchButton.addEventListener(
                "click",
                function () {

                    const search =
                        prompt(
                            "Search AWH Reals:"
                        );


                    if (
                        search
                    ) {

                        alert(
                            "Search: " +
                            search
                        );

                    }

                }
            );

        }


        /* =====================================================
           MESSAGES
        ===================================================== */

        const messagesButton =
            document.getElementById(
                "messages-button"
            );


        if (
            messagesButton
        ) {

            messagesButton.addEventListener(
                "click",
                function () {

                    alert(
                        "Messages are coming soon."
                    );

                }
            );

        }


        /* =====================================================
           BUTTON / VIDEO CONFLICT
        ===================================================== */

        document
            .querySelectorAll(
                ".reel-actions button"
            )
            .forEach(
                function (
                    button
                ) {

                    button.addEventListener(
                        "click",
                        function (
                            event
                        ) {

                            event.stopPropagation();

                        }
                    );

                }
            );


        /* =====================================================
           FIREBASE AUTH STATE
        ===================================================== */

        onAuthStateChanged(
            auth,
            async function (
                user
            ) {

                firebaseUser =
                    user;


                if (!user) {

                    console.log(
                        "No authenticated Firebase user."
                    );

                    return;

                }


                console.log(
                    "Authenticated user:",
                    user.uid
                );


                /*
                 * Load user profile from Firestore
                 * so username is always correct.
                 */

                try {

                    const userSnapshot =
                        await getDoc(
                            doc(
                                db,
                                "users",
                                user.uid
                            )
                        );


                    if (
                        userSnapshot.exists()
                    ) {

                        const data =
                            userSnapshot.data();


                        currentUser = {

                            ...currentUser,

                            ...data,

                            uid:
                                user.uid,

                            email:
                                user.email,

                            guest:
                                false

                        };


                        setCurrentUser(
                            currentUser
                        );


                        /*
                         * Update profile
                         */

                        if (
                            profileName
                        ) {

                            profileName.textContent =
                                currentUser.name ||
                                currentUser.username;

                        }


                        if (
                            profileUsername
                        ) {

                            profileUsername.textContent =
                                "@" +
                                currentUser.username;

                        }


                        if (
                            profileBio
                        ) {

                            profileBio.textContent =
                                currentUser.bio ||
                                "Welcome to AWH Reals World 🔥";

                        }

                    }

                } catch (error) {

                    console.error(
                        "Could not load user profile:",
                        error
                    );

                }


                /*
                 * Check likes
                 */

                reels.forEach(
                    function (
                        reel
                    ) {

                        checkUserLike(
                            reel
                        );

                    }
                );


                /*
                 * Check saves
                 */

                reels.forEach(
                    function (
                        reel
                    ) {

                        const button =
                            reel.querySelector(
                                ".save-button"
                            );


                        if (
                            button
                        ) {

                            checkSaved(
                                reel,
                                button
                            );

                        }

                    }
                );


                /*
                 * Start saved listener
                 */

                renderSavedReels();

            }
        );


        /* =====================================================
           FINAL
        ===================================================== */

        console.log(
            "AWH Reals initialized successfully."
        );

    }
);